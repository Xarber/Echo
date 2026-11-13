# Development

Node 24 and npm workspaces. Run `npm ci` in repository root. `npm run web` starts Expo Web; `npm run dev` starts Expo; `npm run ios` / `npm run android` invoke native generation/builds and require existing platform SDKs. Do not install toolchains without authorization.

`npm run api` starts the backend watcher but does not itself load `.env`; for configured development use `node --env-file=.env --import tsx apps/api/src/main.ts`. `npm run db:migrate` creates/upgrades the default SQLite schema; use `DATABASE_PATH=/your/path/echo.db npm run db:migrate` for a custom path. Schema creation also runs on API startup.

`npm run build:web` exports production Web and generates the PWA; `npm run preview` serves it at port 4173 with nested-route fallback. Do not test offline functionality against the Expo development server. `npm run assets:generate` regenerates icons from the layered SVG.

Use testing → beta → main and Conventional Commits. Do not run automatic full builds/releases from testing. Temporary worktrees are optional; none were needed for initial implementation. Read docs/IDEAS.json at session start. Keep docs/reports/VALIDATION.md and ROADMAP.md honest. Changes to persistence require a migration and recovery plan.

Formatting: `npx prettier --write apps packages scripts tests '*.json' '*.ts' '.github/**/*.yml'` after installing declared development dependencies. No build artifact is source. Keep credentials, database files and generated native projects ignored. E2E uses its own default port 4373 and refuses to reuse unrelated servers; override ECHO_TEST_PORT to select another unused port.
