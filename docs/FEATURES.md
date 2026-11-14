# Feature status — initial development preview

| Area | Implemented | Remaining / verification limit |
| --- | --- | --- |
| Capture | Text/Markdown source, optional title/type/tags/mood, file attachments, draft autosave | Voice, transcription, native share extensions, widgets, clipboard action and full rich-text preview |
| Journal | Daily grouping, local keyword/metadata search, date filter, pins, favorites, archive, recently edited/revisited | Database full-text indexing and large-library performance validation |
| Editor | Preserved original, version snapshots, compare/restore, duplicate, Markdown export, Trash recovery | Configurable deletion retention and permanent local erasure UI |
| Projects | Create/edit/status, linked entries, task priorities/dates/completion, project JSON export | Milestones, subtasks, separate decision/file entities |
| Collections | Create/delete, multi-membership, filtered exploration | Rename/manual ordering |
| Relationships | Typed manual links, removal, keyword candidate explanation | Editing link type after creation, semantic suggestions/clustering |
| Graph | Bounded 60-node SVG, layout/zoom/directional pan, node opening, accessible list, filters | Touch-drag/pinch, cluster collapse, concept/tag/project nodes, large-library benchmarks |
| Evolution | Actual creation history, revision navigation, manually linked continuation/inspiration stages | AI path proposal/correction workflow |
| Reflection | Prompts, saved counts/topics/questions over 7/30 days, old-entry resurfacing | AI period summaries, reminders/notifications |
| AI | Disabled/manual/server-local-only modes, optional provider adapters, scoped consent, validated analysis, development, cited Ask Echo, conversations and embeddings | Genuine provider validation, automatic mode, query-vector retrieval, streaming, durable jobs, cancellation UI, cumulative usage/cost, full conversation management |
| Sync | Account registration/login, hashed password/sessions, manual idempotent record sync, tombstones/cursors/conflicts | Email verification/reset/passkeys, refresh/session/device UI, automatic/background/P2P, chunked attachments, E2EE |
| Data | Versioned complete JSON/Markdown/project export, whole-input validation and merge preview | Advanced import conflict resolution and older-schema migration once formats evolve |
| Developer | Triple tap/expiry, separate Ideas CRUD/duplicates/history/filter/batch delete/JSON import/export, redacted diagnostics | Automatic repository/device Ideas retrieval, full batch organization, screenshots, automated changelog references |
| Web/PWA | Production export, manifest/icons, text Share Target preview, service worker/cache lifecycle, staged-version notes, offline navigation and data, light/dark responsive layout | Platform install acceptance on iOS/Android/Desktop; text Share Target installed-OS validation |
| Updates | Service-worker new-build detection, Settings check, staged-release notes and user-controlled activation | GitHub release discovery, native updater/download/signature checks, OTA, distribution sources |
| Distribution | Build instructions and four-job parallel CI definitions, no public publishing | Compiled native artifacts, package validation, signing identity, release manifests and release automation |

See reports/VALIDATION.md for actual executed tests. This table does not promote an implemented feature to device-tested or production-ready status.

The entry editor offers two offline writing prompts, for reflecting on today
and looking back across recent days. Selecting a prompt leaves the draft intact.
These prompts are fixed questions. Native model-generated prompts and summaries
of recent entries remain future work.
