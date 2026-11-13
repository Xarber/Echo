# ADR 0001 — Unified Expo and a small optional server

Status: accepted for initial development preview, 2026-11-06.

An empty workspace and a large product specification favor completed local-first vertical slices over disconnected service scaffolds. One Expo application avoids a second Web UI. IndexedDB is used for Web rather than experimental SQLite/WASM deployment headers; native uses SQLite. Shared record schemas centralize validation and keep the local diary independent of a server.

The optional backend uses Node's built-in SQLite rather than PostgreSQL/Prisma/pgvector in this preview. This keeps self-hosting free and small while delivering real authenticated record synchronization. Tradeoffs: not a normalized multi-tenant scale architecture; no database FTS/pgvector/worker/S3. Inline bounded attachments and whole-record local snapshots will need replacement for large libraries. These are explicit limitations, not completed enterprise infrastructure.

AI adapters use configured provider HTTP contracts and validated structured output. AI keys remain on a trusted server. True E2EE, full native integrations and direct package updates are not represented as finished.
