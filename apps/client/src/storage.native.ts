// SPDX-License-Identifier: AGPL-3.0-only
import * as SQLite from "expo-sqlite";
import type { Storage } from "./storage";
const db = SQLite.openDatabaseAsync("echo.db").then(async (db) => {
  await db.execAsync(
    "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,kind TEXT NOT NULL,updated_at TEXT NOT NULL,payload TEXT NOT NULL); CREATE INDEX IF NOT EXISTS records_kind_date ON records(kind,updated_at); CREATE TABLE IF NOT EXISTS meta(id TEXT PRIMARY KEY,payload TEXT NOT NULL); PRAGMA user_version=1;",
  );
  return db;
});
export const storage: Storage = {
  async load() {
    const d = await db;
    return {
      records: (
        await d.getAllAsync<{ payload: string }>("SELECT payload FROM records")
      ).map((r) => JSON.parse(r.payload)),
      meta: JSON.parse(
        (
          await d.getFirstAsync<{ payload: string }>(
            "SELECT payload FROM meta WHERE id=?",
            "state",
          )
        )?.payload || "{}",
      ),
    };
  },
  async commit(records, meta) {
    const d = await db;
    await d.withExclusiveTransactionAsync(async (tx) => {
      for (const record of records) {
        const r = record as { id: string; kind?: string; updatedAt?: string };
        await tx.runAsync(
          "INSERT OR REPLACE INTO records VALUES(?,?,?,?)",
          r.id,
          r.kind || "",
          r.updatedAt || "",
          JSON.stringify(record),
        );
      }
      await tx.runAsync(
        "INSERT OR REPLACE INTO meta VALUES(?,?)",
        "state",
        JSON.stringify(meta),
      );
    });
  },
};
