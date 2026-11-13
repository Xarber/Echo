# Architecture

## Modules

`apps/client`: unified Expo SDK 58 / React Native application, Expo Router file routes, responsive UI. `src/App.tsx` owns the shell and navigation; `entries.tsx` capture/editor/history; `workspaces.tsx` projects/explore/reflection/evolution; `AIWorkspace.tsx` scoped AI; `Settings.tsx` configuration and developer feedback. `ui.tsx` supplies the theme and common accessible controls. Root routing uses Slot to avoid duplicating full application shells in retained stack screens. Direct nested routes always include an explicit path back to the journal.

`packages/core`: strict Zod record contracts, entry revision logic, scoped keyword retrieval, backup validation, relationship validation, cosine similarity and host-controlled extension registry. No React, provider SDK or database dependency in the domain layer.

`apps/client/src/store.ts`: observable local state, serialized mutations, atomic persistence with mutation queue, preferences/drafts, authenticated API client and manual synchronization. `storage.native.ts` uses SQLite WAL and transactions; `storage.web.ts` uses IndexedDB transactions. Secrets use SecureStore on native and memory-only Web sessions. Local drafts/preferences are not synchronized or exported. Web Locks enforce one writable tab per origin; additional tabs show a readable snapshot and cannot overwrite the writer’s queue or drafts. Close the writable tab and reload another tab to transfer ownership. Unsupported/insecure browser contexts are read-only. A failed database read blocks subsequent writes and complete-backup export rather than replacing data with an empty state. React is pinned consistently to the SDK-required 19.3.0 across the workspace to avoid duplicate renderer versions.

`apps/api`: Fastify 5, Node 24 built-in SQLite, account-scoped typed records, scrypt password hashes, hashed expiring sessions, revision sync and AI adapters. No account is required for local diary use. `infra/` contains container and static-server configuration.

## Data flow

Capture → Zod validation → serialized store mutation → record + queue committed together → UI notification. Sync is explicitly initiated later. Entry saving never contacts a model or server. AI receives only selected permitted text after explicit per-request consent. Suggestions require an accept action and content edits preserve a revision.

Attachments are currently inline data URIs within records/JSON backups. This is deliberately bounded and simple; a dedicated content-addressed attachment store is required before large-file production use. Graph rendering is capped at 60 filtered nodes and journal results at 200. Search currently scans local records; no database FTS index is claimed.

## Version constraints

Exact dependency versions are captured in package-lock.json. Expo native modules were selected by `expo install` for SDK 58. Node 24 supplies `node:sqlite` (experimental status warning in this runtime). Package ownership is enforced in every server query, not inferred from a user ID supplied by a client.

## Limitations

The backend stores validated typed documents rather than a fully normalized PostgreSQL/pgvector schema. No background worker, CRDT, E2EE, plugin runtime, full editor engine or automatic sync is claimed. See ROADMAP.md.
