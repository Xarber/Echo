# API v0.1

Default origin: `http://127.0.0.1:4280`; HTTPS is required for remote access. JSON requests/responses. Bearer sessions are opaque random credentials; send `Authorization: Bearer <session>` on protected routes. IDs in request payloads never select another account. CORS origins are explicitly configured; CORS is not authentication.

- `GET /health`: status, app version, BUILD_COMMIT (or development).
- `POST /auth/register`: `{email,password}`; administrator must enable registration. Minimum password length 12. Returns token/userId. No email verification/reset/passkey claim.
- `POST /auth/login`: same fields; returns token/userId. Generic invalid-credential error; throttled.
- `POST /auth/logout`: revoke current session.
- `GET /account`, `DELETE /account`: own metadata / destructive server account deletion.
- `GET /entries`, `/entries/:id`, `/projects`, `/projects/:id`, `/collections`, `/collections/:id`, `/relationships`, `/relationships/:id`: live own records.
- `POST /sync/push`: `{operations:[{operationId,baseRevision,record}]}`; maximum 200 operations. Returns `{accepted:[{operationId,id,revision}],conflicts:[{local,remote,revision}]}`. Writes are validated as a batch and committed transactionally. UI sends chunks of 100.
- `GET /sync/pull?cursor=0`: `{records:[{record,revision,sequence}],more}`; 200 record pages, monotonic sequence. Tombstones are returned.
- `GET /ai/config`: public provider capability metadata/model/locality, no keys.
- `POST /ai/run`: authenticated `{operation:"analyze"|"develop"|"ask"|"embed",prompt,entries,consent:true}`. Only permitted entry text is forwarded. Returns operation-specific output/model/provenance/available usage. See AI.md.

Record writes use sync rather than duplicate standalone POST/PATCH CRUD controllers. Client imports/exports are local; no server import/export job endpoint is claimed. Zod handles shape/content validation; invalid input yields 400, auth 401, missing/other-owner records 404, conflicts are structured successful push results. Provider failures return an error, never fabricated output. Generic internal failures do not expose diary content or credentials.

Global limit 120 requests/minute per IP; registration 5/minute, login and AI 10/minute. Proxy deployments must deliberately configure trusted forwarding before relying on per-client limits. No public unauthenticated AI endpoint is provided.
