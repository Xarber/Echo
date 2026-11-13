<p align="center"><img src="assets/branding/echo-master.svg" width="100" alt="Echo icon" /></p>
<h1 align="center">Echo</h1>
<p align="center">Every thought deserves an echo.</p>

A private, local-first ideas diary from **OpenRecode**. Capture an unfinished thought, connect it to another, grow it into a project, and return to it later. AI is optional; accounts are optional for local use.

**Development preview v0.1.0, not a production release.** Web flows are tested; native binaries/device behavior, real model inference and container execution have not yet been verified. See [validation](docs/reports/VALIDATION.md) and [remaining work](docs/ROADMAP.md).

## What works

- Untitled text/Markdown capture with persistent drafts and file attachments (4 MB per file).
- Offline journal, search/filtering, custom types, user-supplied mood, favorites, pins and archive.
- Editing with preserved originals, revision comparison/restoration, recoverable Trash.
- Projects, simple tasks, collections and typed manual idea relationships.
- Bounded interactive graph, recorded idea evolution and local keyword suggestions.
- Reflection prompts and actual saved-entry counts; no simulated personal history.
- Versioned JSON backups, safe import previews, Markdown and project export.
- Optional scoped AI analysis/development, cited Ask Echo and versioned embedding storage.
- Optional authenticated self-hosted sync with idempotency and recoverable conflicts.
- Developer Options, separate Developer Ideas with JSON interchange and structured changelog.
- Responsive light/dark Web/PWA with offline shell, text Share Target previews, staged update notes and manual activation.

## Start locally

Requires Node **24**, npm, and no paid services.

```sh
npm ci
npm run web
```

Expo opens the Web development server, normally at `http://localhost:8081`. Local diary use needs neither a backend nor an API key. For an offline-capable production preview:

```sh
npm run build:web
npm run preview
```

Open `http://localhost:4173`. Wait for initial service-worker installation before going offline. Browser storage is origin-specific; port 8081 and port 4173 are separate diaries. Export/import to transfer between them.

## Native development

Use existing Xcode/Android SDK installations; these commands can generate native projects and compile on your machine.

```sh
npm run ios
npm run android
```

Alternatively `npm run dev` starts Expo for a compatible installed development client. Android/iOS support is implemented through the shared code and native storage adapters; it is **not yet device-validated**. Native share extensions, widgets, voice capture and background synchronization remain on the roadmap.

## Backend and AI

```sh
cp .env.example .env
npm run db:migrate
node --env-file=.env --import tsx apps/api/src/main.ts
```

Set `ALLOW_REGISTRATION=true` only while creating approved accounts. In Echo Settings, save the server URL, register/sign in, then choose **Sync now**. Remote servers require HTTPS. Default: local-only diary, manual sync, AI disabled.

For Ollama, install/configure your own runtime separately, choose an actually installed model and set `AI_PROVIDER=ollama`, `AI_ENDPOINT=http://localhost:11434`, `AI_MODEL=<installed-model>`. For OpenAI-compatible services, use `AI_PROVIDER=compatible`, an HTTPS API base such as `https://your-provider.example/v1`, and server-only `AI_API_KEY`. See [AI configuration](docs/AI.md). No runtime/model is installed automatically.

## Verification

```sh
npm run typecheck
npm test
npm run build:web
npm run test:e2e
```

Local E2E tests use an existing Google Chrome installation. CI installs Chromium explicitly. `npm run assets:generate` reproducibly exports branding from the layered SVG.

## Self-hosting and distribution

```sh
docker compose --env-file .env up --build -d
```

This binds Web to `127.0.0.1:8080` and API to `127.0.0.1:4280`. Configure an HTTPS reverse proxy for remote access. Container builds require an existing Docker installation and remain unexecuted in this environment. See [deployment](docs/DEPLOYMENT.md), [release builds](docs/RELEASES.md), [privacy](docs/PRIVACY.md) and [API](docs/API.md).

## Contributing and license

Original code: **AGPL-3.0-only**, copyright © 2026 OpenRecode contributors. See [LICENSE](LICENSE), [CONTRIBUTING](CONTRIBUTING.md), [security](SECURITY.md) and [documentation index](docs/INDEX.md). Source availability obligations apply to modified network deployments. No public distribution, deployment or official store submission has been authorized by this implementation.
