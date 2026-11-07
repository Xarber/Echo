// SPDX-License-Identifier: AGPL-3.0-only
import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { newEntry } from "../src/index.ts";
test("IndexedDB atomically persists records and draft metadata across adapter reload", async () => {
  const { storage } = await import("../../../apps/client/src/storage.web.ts");
  const e = newEntry("offline survives");
  await storage.commit([e], { draft: "recover me", queue: [{ id: e.id }] });
  const loaded = await storage.load();
  assert.equal((loaded.records[0] as any).content, "offline survives");
  assert.equal(loaded.meta.draft, "recover me");
  assert.equal((loaded.meta.queue as any[])[0].id, e.id);
});
