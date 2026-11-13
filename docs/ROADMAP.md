# Remaining work

The full product specification is larger than this initial execution. The functional offline diary is prioritized as explicitly allowed in specification Phase 31. This preview is useful source software, not a claim that every phase or UADS requirement is complete.

## Essential before a production release

1. Validate iOS/Android native compilation and native SQLite/SecureStore/file picking/sharing on simulator/emulator, then physical devices (rotation, large text, safe areas, keyboard, lifecycle/offline/recovery).
2. Supply an approved Android release signing identity; validate all four CI artifacts, architectures, package IDs, versions and signing. No existing key may be replaced.
3. Validate genuine Ollama/compatible-provider inference with explicitly selected synthetic fixtures, review consent failures and output quality, enforce end-to-end cancellation/time budgets and usage quotas.
4. Run Docker builds/containers and a real two-client self-hosting handshake; rehearse backups/restore/rollback and TLS/proxy configuration.
5. Implement permanent local erasure/configurable Trash retention, fuller account lifecycle (email verification/reset/passkeys/session controls), production security review and dependency mitigation. Current browser/native databases and server sync are not E2EE.
6. Integrate structured GitHub release/update metadata with complete pre-download release notes, native supported update/install flows, compatibility/checksum/signature verification and install result handling. No ordinary updater should offer a metadata-only release or incompatible variant.
7. Resolve current moderate Expo build-tool dependency audit findings with a supported compatible release; do not force an SDK downgrade or blindly override incompatible major dependencies.

## Complete the advanced product specification

- Native/browser audio capture, transcription, native share extensions, file Share Target, native quick capture widgets/shortcuts and platform background support. Text Web Share Target is implemented and browser-tested; installed OS handoff remains unverified.
- Rich Markdown rendering/editor preview and checklists, attachment opening/export improvements, large-file blob store/chunking and clear aggregate-size handling.
- Semantic query embeddings, similarity explanations/candidate review, duplicates/clustering, automatic opt-in analysis rules, durable cancellable AI jobs/streaming, cumulative usage and provider-native adapters.
- Graph drag/pinch/cluster navigation, large collections virtualization, concept/tag/project nodes, editable relationship types and AI evolution paths with user corrections.
- Milestones/subtasks/project decisions, collection rename/order, configurable notifications/reminders, persisted review summaries and full conversation export/deletion/continuation.
- Automatic recoverable foreground sync, retry/backoff scheduling, richer device management and encrypted P2P pairing/transfers where official platform support permits.
- Normalized/PostgreSQL/pgvector/S3 backend when scale warrants it; FTS indexing, import/export background jobs and strict reference integrity policies.
- E2EE and secure recovery only after an actual reviewed cryptographic design; do not promise simultaneous server-blind storage and unrestricted server-side inference.
- Developer Ideas review/merge UI, Markdown/single-idea sharing, status history display, automatic changelog/commit associations, explicit authorized repository synchronization and new-idea review timestamps.
- Full release publication/manifest generation, beta/stable channels, direct Android APK in-app downloads and PackageInstaller, managed-store flows, optional Expo OTA, authorized AltSources/Obtainium.
- Extend verified PWA staged-release notes/manual activation to full release/build history and verify installability and update behavior on actual supported browsers/devices.
- Full Apple layered Icon Composer assets, native splash branding, repository banner, actual product screenshots, accessibility contrast/screen-reader audits, localization and energy/performance measurements.

## Optional future integrations

Versioned, user-authorized exports to other OpenRecode applications; isolated plugin runtime only with actual sandboxing and store-compliant variants. No cross-app data access is currently performed.
