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

## Public X-Center deployment

Build from the intended Git commit with `EXPO_PUBLIC_ECHO_PRODUCTION=true`,
`EXPO_PUBLIC_ECHO_API_URL=https://echo.xcenter.it/api` and
`EXPO_PUBLIC_BUILD_COMMIT` set to that commit. Expo embeds these public values
at build time. Never use an `EXPO_PUBLIC_*` variable for secrets. The
production flag disables Developer Options and direct access to its route.
A configured API URL locks the server selector on Web and native. Existing
diaries bound to another origin require an explicit sync reset before connecting.

Copy the production export into `web/` in the deployment checkout and include
the exact source archive and LICENSE. Start the isolated Web and API services
with `BUILD_COMMIT=<sha> docker compose -p echo -f infra/xcenter.compose.yaml up -d`.
The appliance's existing HTTPS Nginx includes the dedicated Echo virtual host
from `infra/echo.xcenter.nginx.conf`. API and Web use loopback ports 18841
and 18840 respectively. SQLite uses Echo's dedicated persistent volume.
Registration can be disabled with `ALLOW_REGISTRATION=false`. AI is unavailable
until a provider is intentionally configured.

Before updating, retain the prior Web export, API image and a consistent SQLite
backup. Check both loopback services before promotion. Run `nginx -t` before
gracefully reloading the proxy. Verify `/deployment.json`, `/api/health`, and
an authenticated sync over public HTTPS. For rollback restore the prior Web
export and image, retaining the data volume. To withdraw a first deployment,
remove Echo's virtual host, validate and reload Nginx, and stop only Echo's
containers. Do not remove its data volume.

The first public deployment serves Echo 0.1.0 at commit
`de67c240af4527c75f2208c97aaa8ee9e6be84ea`. Live Chrome verified first
entry, production Settings, direct routes and offline draft recovery. The
live API passed registration, sign-in, upload and retrieval in a fresh session.

The first native workflow produced both iOS artifacts. Its Android APK and
AAB jobs stopped at release signing because the repository has no configured
keystore. The iOS startup crash reported afterward was traced to a raw CSS
timing string in shared press feedback. Use Reanimated's typed cubic Bézier
factory so the same curve works with the native transition parser.
