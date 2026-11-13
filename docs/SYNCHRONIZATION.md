# Synchronization

Local-only is the default. The current implementation supports **manual self-hosted sync**, not continuous background or peer-to-peer sync.

Local changes atomically commit typed records and one pending operation per record. Each operation has a UUID and last acknowledged server revision. Saving repeatedly coalesces unsent changes while preserving the original base revision. Sync pushes bounded chunks; the server stores operation receipts for idempotent retries. It rejects divergent edits based on an outdated revision and returns both copies. Pull uses a persisted monotonic cursor and account-scoped pages; deletions travel as tombstones.

The UI keeps unresolved conflicts and offers Keep local, Keep server or Keep both. Both creates a separately identified record while retaining the local original; relationships are not automatically rewritten to refer to that duplicate. Resolving against a newer race can generate another conflict, preserving recoverability. No last-write-wins data loss policy is used.

Native sessions use SecureStore; Web sessions are intentionally memory-only and require sign-in after reload. Server token hashes expire after 30 days and logout revokes the current token. No refresh token or device-session management interface exists yet.

The local diary binds to a server origin/account after sign-in. Switching account/server requires a deliberate Settings reset. Reset preserves all local records, resets acknowledgements/cursors and queues the local collection for the next account. Export a backup first; never merge unrelated people's diaries casually.

The service is server-readable, not E2EE. TLS is the operator's responsibility for remote deployment. Peer-to-peer transports, encrypted pairing and resumable attachment blobs remain planned extension points; no platform is claimed to support unrestricted background P2P.
