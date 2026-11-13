# Echo implementation plan

Empty workspace confirmed 2026-11-06. No existing code, repository, or Ideas collection was present.

## Validated architecture

- One Expo SDK 58 application for iOS, Android and Web; React Native components and Expo Router.
- Shared strict TypeScript/Zod contracts and pure domain functions.
- SQLite native and IndexedDB browser adapters, atomic local record/queue writes; recoverable local drafts.
- Optional Fastify 5 backend on Node 24 with SQLite WAL, scrypt password hashes, hashed bearer sessions and account-scoped revision sync.
- Server-configured provider adapters for Ollama and OpenAI-compatible endpoints. No provider credentials in client configuration.
- No publication/deployment. Prepare private source repository and manual build infrastructure.

## Implementation order / acceptance

1. Offline diary, drafts, revisions and import/export: preserve original content, reload and recover locally.
2. Projects, tasks, collections, relationships, graph, factual evolution and reflection.
3. AI consent/scope, analysis validation, development, cited retrieval and versioned embeddings.
4. Authenticated self-hosted sync, preserve both sides of conflicts; verify account isolation.
5. PWA, branding, developer Ideas, documentation, automated and browser checks.

## Risks / limits

Native platform verification requires native runtimes; compilation alone proves neither device behavior nor integration availability. No false E2EE or local-device model claims. Advanced native capture integrations, automatic AI, complete account recovery and direct application updating must remain explicitly tracked if unfinished. Signing identities must not be invented or replaced.

## Remote discovery after local implementation

`Xarber/Echo` already exists publicly on branch master, with a generic create-expo-app starter, two commits and Expo 57 dependencies. README, AGENTS, package/app configuration, source tree and recent history were inspected. No diary, AI, persistence or synchronization implementation was found in that tree. It has not been modified or connected as this checkout's push remote. The user's publication prohibition means this new source must not be pushed to that public destination without approval. A private destination/local-only choice is pending.

The global Git configuration requires SSH hardware-key commit signatures. Commit creation failed because that hardware key was unavailable. Signing configuration was left unchanged; unsigned commits require the user's current decision.
