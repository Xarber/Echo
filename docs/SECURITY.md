# Security architecture

Server passwords: per-user random salt, Node scrypt, constant-time comparison. Sessions: 256-bit opaque random bearer tokens, SHA-256 hashes in the database, 30-day expiration, revocation on logout/account deletion. Never embed long-lived GitHub/provider credentials in clients. API secrets live only in environment variables. Native client sessions use Expo SecureStore; Web uses memory.

Every protected route resolves ownership from the token. All record queries include that ownership. Push validates the entire record batch and uses a SQLite transaction. Parameterized SQL prevents SQL-string injection. Body/context/attachment limits bound common amplification paths; AI routes are separately rate-limited. Requests are not content-logged.

Provider URLs are server configuration; no user-controlled network proxy. Remote endpoints must use HTTPS. Prompts identify entry data as untrusted, but prompt injection cannot be eliminated by an instruction alone. Cited entry IDs are validated before accepting Ask Echo results. Claims still require human judgment.

No arbitrary executable plugin loader exists. The extension registry is host-owned and validates declared capabilities/version. Do not load untrusted JavaScript into the process as a plugin. Export/import validation does not authorize executing content or opening arbitrary attachment MIME types.

Production gaps: email verification/reset/passkeys, comprehensive session/device controls, encrypted storage/E2EE, independent security review, disaster-recovery drills, Docker validation, platform update package signature verification and ongoing dependency review. See ROADMAP.md and validation report.
