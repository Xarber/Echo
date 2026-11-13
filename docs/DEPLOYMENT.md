# Self-hosting and recovery

No deployment is performed by creating these files.

## Local services

1. `npm ci`; `cp .env.example .env`.
2. Configure ALLOW_REGISTRATION/CORS_ORIGINS/provider variables.
3. `npm run db:migrate`; `node --env-file=.env --import tsx apps/api/src/main.ts`.
4. `npm run build:web`; `npm run preview`.
5. Verify `/health`; save server URL in Settings; register/sign in; explicitly synchronize.

## Docker

With an existing Docker installation: `docker compose --env-file .env up --build -d`. Web is bound only on localhost:8080; API only localhost:4280. The API container persists `/data` in `echo-data`. Registration defaults off; enable only to provision approved users. The API and Web containers use non-root users.

Compose does not include a model runtime. In a container, localhost refers to that container; configure the explicitly trusted model host appropriately. Do not describe a remote model as phone-local AI. HTTPS endpoints are required for remote providers; the optional Docker hostname `ollama` is allowed only when the operator actually configures that trusted network service.

Remote deployment requires an HTTPS reverse proxy, explicit CORS origins, backups and monitoring. Respect AGPL source availability obligations. No public site/source, store listing or distribution endpoint is activated. Container execution was unavailable during initial validation; do not treat this file as proof of successful self-hosting.

## Staging / rollback

Record current version and BUILD_COMMIT before a future deployment. Back up the complete stopped SQLite directory/volume or use a proper online SQLite backup. Build a new image tagged by commit, stage with a separate database copy, test health/auth/two-device sync/AI-disabled behavior, then promote. Keep the previous image/config/database backup. Verify the served version/commit and essential service handshakes. Roll back to the previous image/config if validation fails; do not blindly restore an older database over newer user data.

No production service or unrelated infrastructure was modified. No database-destructive migration exists in schema v1.
