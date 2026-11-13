# Developer Options and Ideas

Tap the Settings version three times. Developer Options become available in that main section and expire on main-tab changes, backgrounding or 30 seconds of inactivity. Normal personal entries are never developer feedback by default.

Developer Ideas persist as separate developerIdea records. Fields: stable ID, title, description/reproduction notes, category, priority, current status, timestamps, implementation reference and status history. Statuses: Pending, Approved, Deferred, In Progress, Implemented, Rejected. The UI permits create/edit/duplicate/soft-delete, search/status filtering, batch delete, JSON export/import previews and implementation references. Status changes append history; a developer must only mark Implemented after appropriate verification.

Interchange: `{schemaVersion:1,application:"it.openrecode.echo",exportedAt,ideas:[...]}`. Imports validate all records before applying and preserve existing IDs by importing only new entries. Existing conflicting ideas remain untouched. Exports are plaintext. Deleted feedback is soft-deleted and retained in full diary backups.

`docs/IDEAS.json` is the repository collection and initially contains zero ideas. Agents must read it, summarize pending/approved/deferred and newly recorded relevant items, compare against implemented functionality and ask whether to work on relevant items now or later. Do not implement unrelated feedback automatically. The running app cannot silently write to a Git checkout: export Ideas JSON and deliberately merge it into docs/IDEAS.json. Automatic device retrieval or bidirectional repository sync is not implemented.

Implementation references can contain commit/version/changelog IDs, but automatic release-note generation from completed ideas is still pending. Never list Pending/In Progress ideas as delivered release highlights.
