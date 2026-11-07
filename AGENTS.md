# Echo agent context

Read docs/INDEX.md, docs/ARCHITECTURE.md, docs/ROADMAP.md and docs/IDEAS.json before substantial changes. The supplied requirements are in docs/PRODUCT_SPECIFICATION.md; apply the user's Universal Application Development Standards. Do not interpret the roadmap as implemented features.

Use testing → beta → main; Conventional Commits. No automatic builds/releases on testing. Preserve local data, IDs, revisions and signing identities. Original code is AGPL-3.0-only. Never publish or deploy without scoped authorization.

## Ideas workflow

Read docs/IDEAS.json. Count Pending, Approved and Deferred ideas, identify new entries and compare related ideas with existing functionality. Summarize actionable ideas and ask whether relevant ones should be implemented now or later, without repeatedly interrupting an existing task. Never automatically implement unrelated ideas. Update statuses only after verification; record commit/version/changelog references. Running-device Ideas must be exported and explicitly imported into this file; no automatic device access exists.

## Checks

`npm ci`, `npm run typecheck`, `npm test`, `npm run build:web`. Browser tests use installed Chrome: `npm run test:e2e`. Never describe mocks as real AI verification. Never describe Web checks as native checks. Update relevant docs and docs/reports for meaningful changes.

Storage records, queues, sessions and imported files are untrusted. Do not log content or secrets. Keep exports credential-free. Sync conflicts must remain recoverable. Do not bypass account binding or server-origin checks.

## UADS section 36

- Reuse `Xarber/Echo`; never create a duplicate repository. Preserve master/history and the original MIT-licensed Expo starter. New Echo source remains AGPL-3.0-only; see LICENSE for the scoped notices.
- Hardware-backed signing is preferred. If the configured hardware key is unavailable, create unsigned Conventional Commits without changing signing settings or substituting a software key. Report unsigned commits. Never rewrite/force-push history to re-sign without explicit authorization.
- X-Center is the default hosting target. Keep private staging loopback-only and isolated; preserve existing services/data. Public source, DNS/routing and releases require scoped authorization.
- Maintain the distinct `/welcome` product/installation/docs presence and the existing diary routes/PWA identity.
- Read relevant available design/motion skills before UI changes. Use shared motion tokens, reduced-motion/transparency fallbacks, meaningful icons and contrast checks. Native motion/material quality requires actual native verification.
