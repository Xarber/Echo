// SPDX-License-Identifier: AGPL-3.0-only
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
export function openDatabase(
  path = process.env.DATABASE_PATH || "./data/echo.db",
) {
  if (path !== ":memory:")
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS records(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,id TEXT NOT NULL,kind TEXT NOT NULL,revision INTEGER NOT NULL,payload TEXT NOT NULL,sequence INTEGER NOT NULL,PRIMARY KEY(user_id,id));
 CREATE INDEX IF NOT EXISTS records_cursor ON records(user_id,sequence);
 CREATE INDEX IF NOT EXISTS records_kind ON records(user_id,kind);
 CREATE TABLE IF NOT EXISTS operations(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,id TEXT NOT NULL,record_id TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(user_id,id));
 CREATE TABLE IF NOT EXISTS counters(id INTEGER PRIMARY KEY CHECK(id=1),value INTEGER NOT NULL);
 INSERT OR IGNORE INTO counters VALUES(1,0); PRAGMA user_version=1;`);
  return db;
}
