import releaseHistory from "./changelog.json";
// SPDX-License-Identifier: AGPL-3.0-only
import { z } from "zod";
export const VERSION = "0.1.0";
export const kinds = [
  "entry",
  "project",
  "collection",
  "relationship",
  "conversation",
  "developerIdea",
  "review",
  "embedding",
] as const;
const id = z.string().min(1).max(100);
const date = z.iso.datetime();
const base = z.object({
  id,
  createdAt: date,
  updatedAt: date,
  deletedAt: date.nullable().default(null),
});
export const attachmentSchema = z.object({
  id,
  name: z.string().max(255),
  mime: z.string().max(200),
  uri: z.string().max(15_000_000),
  size: z.number().nonnegative().max(10_000_000),
});
export const revisionSchema = z.object({
  id,
  content: z.string().max(200000),
  title: z.string().max(300),
  at: date,
  author: z.enum(["user", "ai"]),
});
export const entrySchema = base.extend({
  kind: z.literal("entry"),
  title: z.string().max(300),
  originalContent: z.string().max(200000),
  content: z.string().max(200000),
  type: z.string().max(80).default("Thought"),
  tags: z.array(z.string().max(80)).max(100),
  collectionIds: z.array(id),
  projectId: id.nullable(),
  favorite: z.boolean(),
  pinned: z.boolean(),
  archived: z.boolean(),
  excludeAI: z.boolean(),
  mood: z.string().max(80),
  attachments: z.array(attachmentSchema).max(20),
  revisions: z.array(revisionSchema).max(500),
  lastViewedAt: date.nullable().default(null),
});
export const taskSchema = z.object({
  id,
  title: z.string().min(1).max(500),
  done: z.boolean(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  due: z.string().max(30).default(""),
  completedAt: date.nullable().default(null),
});
export const projectSchema = base.extend({
  kind: z.literal("project"),
  name: z.string().min(1).max(200),
  description: z.string().max(10000),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  status: z.enum([
    "Concept",
    "Exploring",
    "Planned",
    "In progress",
    "Paused",
    "Completed",
    "Archived",
  ]),
  tasks: z.array(taskSchema).max(1000),
});
export const collectionSchema = base.extend({
  kind: z.literal("collection"),
  name: z.string().min(1).max(200),
});
export const relationshipTypes = [
  "Related to",
  "Inspired by",
  "Continuation of",
  "Contradicts",
  "Solves",
  "Depends on",
  "Part of project",
  "Duplicate of",
] as const;
export const relationshipSchema = base
  .extend({
    kind: z.literal("relationship"),
    from: id,
    to: id,
    type: z.enum(relationshipTypes),
    source: z.enum(["manual", "suggested"]),
    explanation: z.string().max(2000),
  })
  .refine((r) => r.from !== r.to, "An entry cannot link to itself");
export const conversationSchema = base.extend({
  kind: z.literal("conversation"),
  entryId: id.nullable(),
  model: z.string().max(200),
  operation: z.string().max(500),
  sources: z.array(id),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(200000),
        at: date,
      }),
    )
    .max(200),
});
export const ideaStatuses = [
  "Pending",
  "Approved",
  "Deferred",
  "In Progress",
  "Implemented",
  "Rejected",
] as const;
export const developerIdeaSchema = base.extend({
  kind: z.literal("developerIdea"),
  title: z.string().min(1).max(300),
  description: z.string().max(20000),
  category: z.enum([
    "Feature",
    "Improvement",
    "Bug Fix",
    "UI/UX",
    "Performance",
    "Other",
  ]),
  priority: z.enum(["low", "normal", "high"]),
  status: z.enum(ideaStatuses),
  implementation: z.string().max(2000),
  history: z
    .array(
      z.object({
        at: date,
        status: z.enum(ideaStatuses),
        notes: z.string().max(2000),
      }),
    )
    .max(1000)
    .default([]),
});
export const reviewSchema = base.extend({
  kind: z.literal("review"),
  period: z.string().max(100),
  content: z.string().max(200000),
  sources: z.array(id),
});
export const embeddingSchema = base.extend({
  kind: z.literal("embedding"),
  entryId: id,
  model: z.string().max(200),
  contentHash: z.string().max(100),
  values: z.array(z.number()).max(8192),
});
export const recordSchema = z.discriminatedUnion("kind", [
  entrySchema,
  projectSchema,
  collectionSchema,
  relationshipSchema,
  conversationSchema,
  developerIdeaSchema,
  reviewSchema,
  embeddingSchema,
]);
export type EchoRecord = z.infer<typeof recordSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Project = z.infer<typeof projectSchema>;
export type DeveloperIdea = z.infer<typeof developerIdeaSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export const now = () => new Date().toISOString();
let idFactory: () => string = () => globalThis.crypto.randomUUID();
export function setIdFactory(factory: () => string) {
  idFactory = factory;
}
export const uid = () => idFactory();
export function stamp() {
  const at = now();
  return { id: uid(), createdAt: at, updatedAt: at, deletedAt: null };
}
export function newEntry(content: string, options: Partial<Entry> = {}): Entry {
  return entrySchema.parse({
    ...stamp(),
    kind: "entry",
    title: "",
    originalContent: content,
    content,
    type: "Thought",
    tags: [],
    collectionIds: [],
    projectId: null,
    favorite: false,
    pinned: false,
    archived: false,
    excludeAI: false,
    mood: "",
    attachments: [],
    revisions: [],
    ...options,
  });
}
export function editEntry(
  entry: Entry,
  patch: Partial<Entry>,
  author: "user" | "ai" = "user",
): Entry {
  const changed =
    (patch.content !== undefined && patch.content !== entry.content) ||
    (patch.title !== undefined && patch.title !== entry.title);
  return entrySchema.parse({
    ...entry,
    ...patch,
    id: entry.id,
    originalContent: entry.originalContent,
    updatedAt: now(),
    revisions: changed
      ? [
          ...entry.revisions,
          {
            id: uid(),
            content: entry.content,
            title: entry.title,
            at: entry.updatedAt,
            author,
          },
        ].slice(-500)
      : entry.revisions,
  });
}
export function titleOf(entry: Entry) {
  return (
    entry.title ||
    entry.content
      .split("\n")[0]
      .replace(/^#+\s*/, "")
      .slice(0, 90) ||
    "Untitled thought"
  );
}
export function search(
  entries: Entry[],
  query: string,
  filters: {
    projectId?: string;
    tag?: string;
    collectionId?: string;
    from?: string;
    to?: string;
    aiOnly?: boolean;
  } = {},
) {
  const tokens = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries
    .filter(
      (e) =>
        !e.deletedAt &&
        (!filters.aiOnly || !e.excludeAI) &&
        (!filters.projectId || e.projectId === filters.projectId) &&
        (!filters.tag || e.tags.includes(filters.tag)) &&
        (!filters.collectionId ||
          e.collectionIds.includes(filters.collectionId)) &&
        (!filters.from || e.createdAt.slice(0, 10) >= filters.from) &&
        (!filters.to || e.createdAt.slice(0, 10) <= filters.to),
    )
    .map((e) => ({
      entry: e,
      score: tokens.reduce(
        (s, t) =>
          s +
          (e.title.toLowerCase().includes(t) ? 3 : 0) +
          (e.content.toLowerCase().includes(t) ? 1 : 0) +
          (e.tags.some((tag) => tag.toLowerCase().includes(t)) ? 2 : 0),
        0,
      ),
    }))
    .filter(
      (r) =>
        !tokens.length ||
        tokens.every((t) =>
          `${r.entry.title} ${r.entry.content} ${r.entry.tags.join(" ")}`
            .toLowerCase()
            .includes(t),
        ),
    )
    .sort(
      (a, b) =>
        b.score - a.score || b.entry.updatedAt.localeCompare(a.entry.updatedAt),
    )
    .map((r) => r.entry);
}
export function keywordConnections(entry: Entry, entries: Entry[]) {
  const words = (s: string) =>
    new Set(s.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) || []);
  const source = words(
    `${entry.title} ${entry.content} ${entry.tags.join(" ")}`,
  );
  return entries
    .filter((e) => e.id !== entry.id && !e.deletedAt)
    .map((e) => {
      const target = words(`${e.title} ${e.content} ${e.tags.join(" ")}`);
      const shared = [...source].filter((w) => target.has(w));
      return {
        entry: e,
        score:
          shared.length / Math.max(1, new Set([...source, ...target]).size),
        explanation: `Shared words: ${shared.slice(0, 6).join(", ")}`,
        shared,
      };
    })
    .filter((r) => r.shared.length >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
export const exportSchema = z.object({
  schemaVersion: z.literal(1),
  application: z.literal("it.openrecode.echo"),
  exportedAt: date,
  records: z.array(recordSchema).max(50000),
});
export function exportData(records: EchoRecord[]) {
  return exportSchema.parse({
    schemaVersion: 1,
    application: "it.openrecode.echo",
    exportedAt: now(),
    records,
  });
}
export function planImport(existing: EchoRecord[], input: unknown) {
  const parsed = exportSchema.parse(input);
  if (new Set(parsed.records.map((r) => r.id)).size !== parsed.records.length)
    throw new Error("Duplicate IDs inside import");
  const map = new Map(existing.map((r) => [r.id, r]));
  return {
    added: parsed.records.filter((r) => !map.has(r.id)),
    identical: parsed.records.filter(
      (r) => JSON.stringify(map.get(r.id)) === JSON.stringify(r),
    ),
    conflicts: parsed.records.filter(
      (r) =>
        map.has(r.id) && JSON.stringify(map.get(r.id)) !== JSON.stringify(r),
    ),
  };
}
export const analysisSchema = z.object({
  title: z.string().max(300),
  summary: z.string().max(3000),
  tags: z.array(z.string().max(80)).max(12),
  questions: z.array(z.string().max(1000)).max(10),
  steps: z.array(z.string().max(1000)).max(20),
});
export const aiRequestSchema = z
  .object({
    operation: z.enum(["analyze", "develop", "ask", "embed"]),
    prompt: z.string().min(1).max(4000),
    entries: z.array(entrySchema).min(1).max(12),
    consent: z.literal(true),
  })
  .superRefine((r, ctx) => {
    if (r.entries.some((e) => e.excludeAI || e.deletedAt))
      ctx.addIssue({
        code: "custom",
        message: "Excluded or deleted entries cannot be processed",
      });
    if (r.entries.reduce((s, e) => s + e.content.length, 0) > 48000)
      ctx.addIssue({
        code: "custom",
        message: "Context exceeds 48,000 characters",
      });
  });
export type AIRequest = z.infer<typeof aiRequestSchema>;
export const syncOperationSchema = z.object({
  operationId: id,
  baseRevision: z.number().int().nonnegative(),
  record: recordSchema,
});
export type SyncOperation = z.infer<typeof syncOperationSchema>;
export type RemoteRecord = {
  record: EchoRecord;
  revision: number;
  sequence: number;
};
export type Conflict = {
  id: string;
  local: EchoRecord;
  remote: EchoRecord;
  revision: number;
};
export function shouldConflict(
  baseRevision: number,
  currentRevision: number,
  incoming: EchoRecord,
  current: EchoRecord,
) {
  return (
    baseRevision !== currentRevision &&
    JSON.stringify(incoming) !== JSON.stringify(current)
  );
}
export function cosine(a: number[], b: number[]) {
  if (a.length !== b.length || !a.length) return 0;
  const norm = Math.sqrt(
    a.reduce((s, v) => s + v * v, 0) * b.reduce((s, v) => s + v * v, 0),
  );
  return norm ? a.reduce((s, v, i) => s + v * b[i], 0) / norm : 0;
}
export function markdownExport(records: EchoRecord[]) {
  return records
    .filter((r): r is Entry => r.kind === "entry" && !r.deletedAt)
    .map(
      (e) =>
        `# ${titleOf(e)}\n\n${e.content}\n\n---\nCreated: ${e.createdAt}\nTags: ${e.tags.join(", ")}\nID: ${e.id}`,
    )
    .join("\n\n");
}
export const changelog = releaseHistory;
export { ExtensionRegistry } from "./extensions.ts";

export function updateDeveloperIdea(
  idea: DeveloperIdea,
  patch: Partial<DeveloperIdea>,
): DeveloperIdea {
  return developerIdeaSchema.parse({
    ...idea,
    ...patch,
    updatedAt: now(),
    history:
      patch.status && patch.status !== idea.status
        ? [
            ...idea.history,
            {
              at: now(),
              status: patch.status,
              notes: patch.implementation || idea.implementation,
            },
          ]
        : idea.history,
  });
}
