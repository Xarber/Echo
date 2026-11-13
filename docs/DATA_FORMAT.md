# Data model and portability

Schema v1 uses globally unique IDs, ISO UTC creation/modification timestamps and nullable deletion tombstones. Record kinds: entry, project, collection, relationship, conversation, developerIdea, review and embedding. Canonical runtime validation lives in `packages/core/src/index.ts`; do not maintain a second divergent schema.

Entries preserve `originalContent` for their entire lifetime. User/AI-assisted title/content edits snapshot the previous content with timestamp/author and retain up to 500 prior revisions. Metadata changes do not add content revisions. Tags and collections are optional; projectId is optional. Attachments include a stable ID, original filename, MIME, size and data URI. Capture accepts files up to 4 MB; total server request limit is 20 MB. Extremely large batches may require smaller exports; attachment chunking is not implemented.

Projects contain a status and tasks with ID/title/priority/optional due date/completion timestamp. Collections use membership IDs on entries. Relationships contain explicit source/target IDs, type, manual/suggested provenance and explanation. Evolution displays only recorded creation/revisions and confirmed continuity/inspiration links.

JSON backup: `{schemaVersion:1,application:"it.openrecode.echo",exportedAt,records:[...]}`. Exports include tombstones, attachments and conversation history; they exclude sessions, provider credentials and local drafts/preferences. The format is plaintext. Markdown exports are text-only; use JSON for lossless attachment/relationship/project backup.

Import validates the whole input before mutation, rejects duplicate IDs inside a file, shows counts for new/identical/conflicting records, and defaults to importing only new IDs. Existing conflicting records are preserved. Unknown schema versions are rejected, never guessed. No migration before schema v1 exists. A schema change must add an explicit version migration; do not clear storage on failure.

SQLite native migration creates `records`, `meta`, kind/date index and sets user_version=1. Browser IndexedDB v1 creates `records` and `meta` stores. The API schema creates users, sessions, account-scoped records/operations and a monotonic sequence counter. Server counters and idempotency receipts survive restarts. Back up SQLite using the SQLite online backup API/tool or stop the API and copy its entire database directory including WAL; copying a live .db file alone is unsafe.

Deleted entries stay in recoverable Trash indefinitely in this preview. Server account deletion cascades owned records/sessions/receipts; local copies and external backups remain. Permanent local erasure/retention policy UI is pending.

Browser concurrency is intentionally single-writer: Web Locks prevent stale tabs from replacing another tab's local snapshots or mutation queue. Secondary tabs are read-only snapshots. Close the writer and reload a secondary tab to edit. The lock is origin-specific, so transferring between ports/devices still requires export/import or configured sync.
