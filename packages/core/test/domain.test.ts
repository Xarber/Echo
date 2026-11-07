// SPDX-License-Identifier: AGPL-3.0-only
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newEntry,
  editEntry,
  exportData,
  planImport,
  search,
  keywordConnections,
  relationshipSchema,
  stamp,
  analysisSchema,
  aiRequestSchema,
  shouldConflict,
  cosine,
  recordSchema,
  markdownExport,
} from "../src/index.ts";
test("capture allows untitled, unclassified thoughts and retains exact original text", () => {
  const e = newEntry("  A fleeting thought\n");
  assert.equal(e.title, "");
  assert.equal(e.originalContent, "  A fleeting thought\n");
  assert.equal(e.content, e.originalContent);
  assert.deepEqual(e.tags, []);
});
test("edits preserve original and previous versions; metadata alone creates no content revision", () => {
  const e = newEntry("first");
  const edited = editEntry(e, { content: "second" }, "ai");
  assert.equal(edited.originalContent, "first");
  assert.equal(edited.revisions[0].content, "first");
  assert.equal(edited.revisions[0].author, "ai");
  assert.equal(editEntry(edited, { favorite: true }).revisions.length, 1);
  const restore = editEntry(edited, { content: edited.revisions[0].content });
  assert.equal(restore.content, "first");
  assert.equal(restore.revisions[1].content, "second");
});
test("search scopes, tags, deleted and AI-excluded records are respected", () => {
  const a = newEntry("video calling", { tags: ["portal"], projectId: "p" }),
    b = newEntry("private video", { excludeAI: true }),
    c = newEntry("deleted video", { deletedAt: new Date().toISOString() });
  assert.deepEqual(
    search([a, b, c], "video", { projectId: "p" }).map((e) => e.id),
    [a.id],
  );
  assert.equal(search([a, b, c], "video", { aiOnly: true }).length, 1);
  assert.equal(search([a, b, c], "", { tag: "portal" }).length, 1);
  assert.equal(search([a, b], "video nonexistent").length, 0);
});
test("export round trips without credentials or unexpected fields", () => {
  const e = recordSchema.parse({ ...newEntry("private"), apiKey: "secret" });
  const data = exportData([e]);
  assert.ok(!JSON.stringify(data).includes("secret"));
  assert.equal(
    planImport([], JSON.parse(JSON.stringify(data))).added.length,
    1,
  );
  assert.equal(markdownExport([e]).includes("private"), true);
});
test("import preserves existing records, identifies conflicts and rejects duplicate IDs", () => {
  const a = newEntry("a");
  const p = planImport([a], exportData([editEntry(a, { content: "b" })]));
  assert.equal(p.conflicts.length, 1);
  assert.equal(p.added.length, 0);
  assert.throws(() => planImport([], exportData([a, a])), /Duplicate/);
  assert.throws(() => planImport([], { schemaVersion: 9 }));
});
test("relationships reject self links and unsupported relationship types", () => {
  assert.throws(() =>
    relationshipSchema.parse({
      ...stamp(),
      kind: "relationship",
      from: "a",
      to: "a",
      type: "Related to",
      source: "manual",
      explanation: "",
    }),
  );
});
test("keyword fallback explains only shared words; never labeled semantic", () => {
  const a = newEntry("spontaneous video calling platform"),
    b = newEntry("video calling friends"),
    c = newEntry("garden flowers");
  const results = keywordConnections(a, [a, b, c]);
  assert.equal(results.length, 1);
  assert.match(results[0].explanation, /video/);
  assert.equal(results[0].entry.id, b.id);
});
test("AI structured outputs reject missing and malformed model data", () => {
  assert.throws(() => analysisSchema.parse({ title: "x" }));
  assert.throws(() =>
    analysisSchema.parse({
      title: "x",
      summary: "",
      tags: 42,
      questions: [],
      steps: [],
    }),
  );
});
test("AI requires explicit consent, selected permitted records and bounded context", () => {
  const e = newEntry("hello");
  assert.throws(() =>
    aiRequestSchema.parse({
      operation: "analyze",
      prompt: "analyze",
      entries: [e],
      consent: false,
    }),
  );
  assert.throws(() =>
    aiRequestSchema.parse({
      operation: "ask",
      prompt: "ask",
      entries: [{ ...e, excludeAI: true }],
      consent: true,
    }),
  );
  assert.throws(() =>
    aiRequestSchema.parse({
      operation: "ask",
      prompt: "ask",
      entries: [newEntry("a".repeat(49000))],
      consent: true,
    }),
  );
  assert.equal(
    aiRequestSchema.parse({
      operation: "develop",
      prompt: "expand",
      entries: [e],
      consent: true,
    }).entries.length,
    1,
  );
});
test("sync detects stale conflicting changes but accepts exact idempotent content", () => {
  const e = newEntry("a"),
    b = editEntry(e, { content: "b" });
  assert.equal(shouldConflict(1, 2, b, e), true);
  assert.equal(shouldConflict(2, 2, b, e), false);
  assert.equal(shouldConflict(1, 2, e, e), false);
});
test("cosine handles zero vectors and incompatible dimensions", () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.equal(cosine([0], [0]), 0);
  assert.equal(cosine([1], [1, 2]), 0);
});

test("developer ideas retain status history and survive versioned interchange", async () => {
  const { developerIdeaSchema, updateDeveloperIdea } =
    await import("../src/index.ts");
  const idea = developerIdeaSchema.parse({
    ...stamp(),
    kind: "developerIdea",
    title: "Improve capture",
    description: "A synthetic developer feedback record.",
    category: "Improvement",
    priority: "normal",
    status: "Pending",
    implementation: "",
  });
  const approved = updateDeveloperIdea(idea, { status: "Approved" });
  const reopened = updateDeveloperIdea(approved, { status: "Deferred" });
  assert.equal(idea.status, "Pending");
  assert.deepEqual(
    reopened.history.map((h) => h.status),
    ["Approved", "Deferred"],
  );
  const restored = planImport(
    [],
    JSON.parse(JSON.stringify(exportData([reopened]))),
  ).added[0];
  assert.equal(restored.kind, "developerIdea");
  assert.equal((restored as typeof reopened).history.length, 2);
});

test("host extension registry rejects unapproved capabilities and duplicate manifests", async () => {
  const { ExtensionRegistry } = await import("../src/index.ts");
  const registry = new ExtensionRegistry();
  let invoked = 0;
  const manifest = {
    id: "synthetic-extension",
    name: "Test extension",
    apiVersion: 1 as const,
    permissions: ["capture" as const],
  };
  assert.throws(() => registry.register(manifest, [], []), /permission/);
  const dispose = registry.register(
    manifest,
    [
      {
        id: "capture",
        label: "Capture",
        run: async () => {
          invoked++;
        },
      },
    ],
    ["capture"],
  );
  assert.throws(
    () => registry.register(manifest, [], ["capture"]),
    /Duplicate/,
  );
  await registry.invoke("synthetic-extension:capture");
  assert.equal(invoked, 1);
  dispose();
  assert.equal(registry.actions().length, 0);
});
