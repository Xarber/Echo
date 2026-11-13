# Testing

`npm run typecheck` validates strict contracts. `npm test` runs Node test-runner domain, fake IndexedDB persistence and in-process real Fastify/SQLite integration tests. Provider HTTP fixtures test adapter contracts without real model inference. These are intentionally separate evidence levels.

`npm run build:web` creates a production export. `npm run test:e2e` starts a local production preview and uses existing Google Chrome. It covers actual UI capture/edit/reload, originals/revisions, links/projects/tasks, service-worker offline navigation and writes, JSON export, recovered drafts, narrow responsive viewport, nested routes, and AI-disabled zero provider requests. CI selects Chromium with ECHO_CI_BROWSER=chromium and installs it explicitly.

Generated traces/download artifacts remain under ignored artifacts/. Do not commit test diaries, session credentials or private screenshots. Any saved test data is synthetic and stays in isolated browser test contexts, never production data.

Native JS export is only a bundle check. Native compilation is a separate CI workflow. Simulator/emulator and physical-device checks remain separate and must be reported as unverified until performed. A successful container configuration file is not a container test. A provider mock is not genuine inference. See reports/VALIDATION.md for executed checks.

Additional production-browser tests cover exact attachment export bytes/JSON round-trip, scoped mocked AI with explicit acceptance/source linkage, text Share Target draft protection, synthetic staged PWA update notes/activation, unreadable-record write protection, and multiple-tab writer locking.
