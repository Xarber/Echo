// SPDX-License-Identifier: AGPL-3.0-only
import { openDB } from "idb";
import type { Storage } from "./storage";
const db = openDB("echo-local-v1", 1, {
  upgrade(db) {
    db.createObjectStore("records", { keyPath: "id" });
    db.createObjectStore("meta");
  },
});
// Only one writable tab per origin. A stale tab must never replace another
// tab's mutation queue, drafts or record revisions with an old snapshot.
let writer: Promise<boolean> | undefined;
function ownsWriterLock(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(true); // Node test adapter
  writer ??= new Promise((resolve) => {
    if (!navigator.locks) {
      resolve(false);
      return;
    }
    void navigator.locks
      .request("echo-local-v1-writer", { ifAvailable: true }, (lock) => {
        resolve(!!lock);
        if (lock) return new Promise<void>(() => {}); // released on document teardown
      })
      .catch(() => resolve(false));
  });
  return writer;
}
export const storage: Storage = {
  async load() {
    const writable = await ownsWriterLock();
    const d = await db;
    const tx = d.transaction(["records", "meta"]);
    return {
      records: await tx.objectStore("records").getAll(),
      meta: (await tx.objectStore("meta").get("state")) || {},
      ...(!writable
        ? {
            readOnlyReason: navigator.locks
              ? "Echo is already open in another tab. This copy is read-only. Close the other tab and reload to edit."
              : "This context cannot safely lock local data. Use HTTPS or localhost in a current browser to edit.",
          }
        : {}),
    };
  },
  async commit(records, meta) {
    if (!(await ownsWriterLock()))
      throw new Error(
        "This tab is read-only. Close the other Echo tab and reload to edit.",
      );
    const d = await db;
    const tx = d.transaction(["records", "meta"], "readwrite");
    for (const record of records) await tx.objectStore("records").put(record);
    await tx.objectStore("meta").put(meta, "state");
    await tx.done;
  },
};
