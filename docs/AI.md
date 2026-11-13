# AI and retrieval

AI defaults to disabled. Manual mode requires selected context and per-request consent. Local-only mode additionally checks that the configured provider endpoint uses the API server's loopback address. This means server-local inference, not necessarily inference on the phone. No model runtime is bundled or installed. Automatic AI processing is not implemented.

## Configure

Copy `.env.example` to `.env`. Set `AI_PROVIDER=ollama` with `AI_ENDPOINT=http://localhost:11434` and the exact `AI_MODEL` already installed in your runtime. Configure a dedicated `AI_EMBEDDING_MODEL` for embeddings if your generation model does not support them. Alternatively `AI_PROVIDER=compatible` uses `/chat/completions` and `/embeddings` relative to `AI_ENDPOINT`; configure `AI_API_KEY` only on the server. Provider endpoints are administrator-configured, never arbitrary request parameters. Remote endpoints must use HTTPS. Native clients on another device must use the API server's actual HTTPS address, not their own localhost.

Start the backend with `node --env-file=.env --import tsx apps/api/src/main.ts`. Sign in from Settings, enable manual or local-only AI, open Develop or Ask Echo, choose entries, review context, authorize and submit. Ollama calls `/api/chat` and `/api/embed`. Compatible providers must implement those compatible endpoints and JSON-output requests; vendor-native Anthropic/Gemini adapters are not implemented.

## Privacy boundaries

Request validation rejects excluded/deleted records, missing consent, empty scopes, more than 12 entries or more than 48,000 content characters. Attachments are never sent. Only text, selected titles, IDs and creation times reach the model. Conversations retain model identity, selected sources and output locally. The server does not retain AI request bodies or log provider keys/content. The chosen provider may have its own retention policy.

Analysis outputs require validated title, summary, tags, questions and steps. They are suggestions, never automatic edits. Accepting content changes creates a recoverable revision. Development outputs can be saved separately or explicitly appended. Ask Echo retrieves candidate entries locally with keyword/metadata filters, lets the user select the scope, and validates cited IDs on every returned claim; interpretation flags are shown. This validates references, not semantic truth of a model's claim.

Embedding requests store vectors with model and content timestamp. Current index construction is implemented; vector-based query retrieval and clustering are not complete. Ordinary related-entry suggestions are labeled **keyword matches**, never semantic similarity. Model changes require rebuilding the index. No hidden personal profile or automatic diary-wide processing exists.

Provider requests have timeouts, bounded outputs and limited retry with exponential backoff for 429/5xx. Usage is displayed when the provider supplies token counts; unavailable fields stay unknown. Streaming, durable jobs, provider request cancellation UI and cumulative cost accounting are pending. No genuine provider inference was available during validation; HTTP mocks are labeled as such in tests.

## Official references consulted

- [Ollama API](https://docs.ollama.com/api)
- [Expo SDK 58 SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/)
- [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)

Installed versions, rather than search-result examples, are authoritative for dependency selection.
