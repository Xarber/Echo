# PROJECT 02 — ECHO
## Complete Full-Stack Application Development Specification

**Working name:** Echo  
**Tagline:** Every thought deserves an echo.  
**Parent initiative:** OpenRecode  
**Application type:** AI-powered ideas diary and personal knowledge management system  
**Target platforms:** iOS, Android, and Web/PWA  
**Status:** New project — implement from the ground up

---

# 1. YOUR ROLE AND MISSION

Act as a complete senior software engineering team consisting of:

- Product architect and technical lead.
- Senior React Native / Expo developer.
- Senior backend and database engineer.
- Artificial intelligence and retrieval systems engineer.
- UI/UX and interaction designer.
- Security and privacy engineer.
- Local-first synchronization engineer.
- Quality assurance and testing engineer.
- DevOps and open-source infrastructure engineer.

Your mission is to **design, implement, test, document, and deliver a functional application**.

Do not stop after creating a product specification, interface mockup, architecture document, or collection of placeholder screens.

Create the actual application and its underlying functionality.

Inspect the existing workspace before beginning.

If an Echo project already exists, inspect it and build upon the existing implementation instead of replacing it unnecessarily.

If no project exists, initialize a properly structured project.

If my Universal Application Development Standards (UADS) document is accessible, read it and follow it. Preserve its requirements concerning architecture, code quality, developer options, Ideas, changelogs, and project maintenance.

If the document is unavailable, apply the equivalent standards defined in this specification.

Do not modify unrelated projects or publish source code, user data, or deployments without authorization.

Make reasonable decisions independently, prioritize working software, and document important architectural choices.

# 2. PRODUCT VISION

Echo is a private, intelligent, open-source application for capturing, organizing, exploring, and developing ideas.

People constantly have thoughts worth remembering:

- Application concepts.
- Personal reflections.
- Development ideas.
- Creative writing.
- Inventions.
- Problems worth solving.
- Daily observations.
- Questions.
- Sudden realizations.
- Plans.
- Unfinished thoughts.
- Interesting connections between unrelated concepts.

Most ideas disappear because recording them takes too much effort or because they become buried among hundreds of notes.

Echo solves both problems.

It allows users to capture an idea immediately and return to it later with the help of a context-aware AI.

The application should act as an organized extension of the user's thinking, not as a replacement for their judgment.

## Product Philosophy

**Capture effortlessly. Think freely. Connect intelligently.**

Core principles:

1. An idea should never require perfect formatting.
2. Capturing a thought must be extremely fast.
3. Organization should be available without becoming mandatory.
4. AI should assist thinking, not dominate it.
5. The user owns their thoughts and data.
6. All core non-AI functionality must work offline.
7. Cloud AI must be optional and transparent.
8. The user must control what the AI can access.
9. No advertisements, intrusive engagement mechanics, or unnecessary subscriptions.
10. The application must remain open-source, extensible, and self-hostable.

The product should feel like a combination of a personal journal, an idea inbox, a creative workspace, and a personal knowledge graph.

Do not simply create another generic notes app with an AI chat tab.

The relationship between ideas must be central to the experience.

# 3. PRIMARY PRODUCT EXPERIENCE

Echo should have five primary functional areas.

## 3.1 Capture — Record Anything

A rapid-entry interface for recording thoughts immediately.

## 3.2 Journal — Personal Timeline

A chronological record of ideas, thoughts, and reflections.

## 3.3 Explore — Discover Connections

A knowledge graph, topic collections, and intelligent relationships between entries.

## 3.4 Develop — Transform Ideas

An AI-assisted workspace for expanding, evaluating, combining, and refining thoughts.

## 3.5 Reflect — Rediscover and Review

A system that helps the user revisit important ideas, identify progress, and discover patterns.

All five areas must be integrated around a shared underlying data model.

# 4. RAPID IDEA CAPTURE

The capture experience is the most important interaction in the application.

A user must be able to open Echo and save a thought with minimal friction.

## 4.1 Quick Capture

Implement a prominent capture button.

The workflow should be:

1. Open Echo.
2. Tap New Thought.
3. Type, dictate, or paste the thought.
4. Save immediately.
5. Continue with the day.

Do not require a title, folder, category, or tag before saving.

Generate a title automatically only when appropriate and enabled.

Preserve the original entered text.

## 4.2 Supported Input Types

Support:

- Plain text.
- Rich text or Markdown.
- Voice recordings.
- Speech-to-text transcription.
- Images.
- Screenshots.
- Files.
- URLs.
- Code snippets.
- Checklists.
- Embedded links to other Echo entries.

Design the architecture to accommodate future input types such as sketches, drawings, and handwritten notes.

Avoid building a completely custom rich-text engine when a reliable maintained solution is available.

Ensure the chosen editor behaves correctly on both mobile and Web.

## 4.3 Quick Capture Integrations

Implement where feasible:

- iOS share extension.
- Android share intent.
- Web Share Target support for the installed PWA.
- Clipboard import.
- Mobile home-screen widgets.
- Quick Actions / application shortcuts.
- Deep links that open the composer.
- Draft recovery after app termination.

Platform-specific functionality must be properly integrated rather than represented by decorative controls.

If an integration cannot be implemented in the available environment, document the limitation and preserve a clean extension point.

## 4.4 Drafts and Autosaving

Implement:

- Automatic draft saving.
- Crash recovery.
- Offline draft persistence.
- Unsaved-change protection.
- Correct handling of attachments.
- Reliable save-status indicators.
- Conflict handling between devices.

A typed thought should not disappear when the user switches applications or loses connectivity.

# 5. ENTRIES AND JOURNAL SYSTEM

Every captured thought becomes an Echo Entry.

## 5.1 Entry Data Model

An entry may contain:

- Stable unique ID.
- User ID.
- Optional title.
- Original content.
- Editable content.
- Content format.
- Creation timestamp.
- Last modification timestamp.
- User-defined entry type.
- Optional tags.
- Optional collection.
- Optional attachments.
- Optional mood label explicitly supplied by the user.
- Related entries.
- AI-generated suggestions.
- Favorite/pinned status.
- Archive status.
- Processing state.
- Revision history.

Allow entries to remain completely unclassified.

## 5.2 Entry Types

Provide optional entry types:

- Idea.
- Thought.
- Journal.
- Question.
- Project.
- Observation.
- Task.
- Note.
- Reflection.

Do not force users to choose a type when capturing.

Users should be able to create custom types.

## 5.3 Journal Timeline

Create an elegant chronological timeline.

Features:

- Daily grouping.
- Calendar navigation.
- Search.
- Filters.
- Sorting.
- Pinned entries.
- Favorites.
- Archive.
- Recently edited.
- Recently revisited.
- Entry previews.

Support both compact and expanded layouts.

## 5.4 Entry Editor

Provide:

- Distraction-free writing.
- Markdown support where appropriate.
- Basic text formatting.
- Checklists.
- Embedded attachments.
- Inline links to related entries.
- Tags.
- Favorites.
- Archive controls.
- AI assistance.
- Version history.
- Export.
- Duplicate.
- Delete.

Use a visually clean editor without excessive toolbars.

## 5.5 Entry History

Preserve meaningful revisions.

Support:

- View previous versions.
- Compare revisions.
- Restore an earlier version.
- Identify user-made versus AI-assisted changes.
- Prevent accidental overwriting.
- Recover deleted entries within a configurable retention period.

Do not silently replace an original idea with an AI-generated rewrite.

# 6. AI ARCHITECTURE

AI is Echo's defining enhancement, but it must not be required for ordinary note-taking.

Design a provider-independent AI architecture.

## 6.1 AI Provider Abstraction

Support multiple compatible providers through a unified interface.

Potential options:

- OpenAI.
- Anthropic.
- Google Gemini.
- OpenAI-compatible self-hosted endpoints.
- Ollama or equivalent local model infrastructure.
- Other providers through modular adapters.

Research current APIs, capabilities, license conditions, and SDK compatibility during implementation.

Do not hardcode a single model vendor into the application's business logic.

## 6.2 AI Configuration

Provide settings for:

- Enable or disable AI.
- Select provider.
- Select model.
- Configure credentials.
- Configure custom endpoint.
- Configure request limits.
- Set maximum context size.
- Review estimated usage.
- Disable specific AI features.
- Choose automatic or manual analysis.
- Control which entries may be processed.

Use secure credential storage.

Never expose provider API keys in application logs, exported notes, or public repositories.

For BYOK configurations, ensure keys are not distributed as shared client-side secrets and clearly document whether requests go directly to a provider or through a self-hosted proxy.

## 6.3 Processing Rules

AI processing must be permission-aware.

Before sending data to a remote provider, the application must know:

- Which provider is selected.
- Which entries are included.
- Which attachments are included.
- What the requested operation is.
- Whether the user has authorized this processing.

Allow users to define entries or collections that are always excluded from remote AI processing.

Do not send the entire diary to a provider merely because the user asks a question about one entry.

Minimize disclosed context.

## 6.4 Privacy-Aware AI Modes

Implement at least:

**Manual Mode:** AI processes only content explicitly selected by the user.

**Opt-in Automatic Mode:** AI may automatically process new entries according to clearly configured rules.

**Local-Only Mode:** No diary content is sent to external AI services. Local model processing is available only where a compatible model runtime has genuinely been configured.

**AI Disabled:** The entire application remains usable without any model.

Do not claim local AI processing if the model is actually running on a remote server.

# 7. AI FEATURE — IDEA UNDERSTANDING

Create an analysis system that can help users understand and structure entries.

Potential outputs:

- Suggested title.
- Concise summary.
- Suggested tags.
- Suggested category.
- Important concepts.
- Actionable next steps.
- Relevant questions.
- Related existing ideas.
- Possible project associations.

AI-generated suggestions must be distinguishable from user-authored content.

The user should be able to:

- Accept.
- Reject.
- Edit.
- Regenerate.
- Disable.

Avoid silently modifying entries.

Use structured, schema-validated AI outputs wherever possible.

Handle malformed model outputs and transient API failures gracefully.

# 8. AI FEATURE — RELATED IDEAS

Implement semantic relationships between entries.

Example:

January:
"I want to build a video calling application."

February:
"I think it would be interesting if friends could ring a virtual doorbell."

March:
"Maybe messaging should be integrated with video calls."

Echo should recognize that these thoughts may belong to the same broader concept.

The application should suggest connections and explain them.

## 8.1 Similarity Detection

Implement:

- Semantic embeddings.
- Similarity search.
- Duplicate suggestion.
- Topic clustering.
- Related-entry recommendations.

Use maintained embedding providers or local embedding models.

Track embedding model versions.

Support recomputation when the model changes.

Provide keyword-based fallback search when embeddings are unavailable.

## 8.2 Connection Types

Support manual and suggested relationships:

- Related to.
- Inspired by.
- Continuation of.
- Contradicts.
- Solves.
- Depends on.
- Part of project.
- Duplicate of.

Users should be able to create, remove, and modify relationships manually.

The system must distinguish manually confirmed links from AI suggestions.

## 8.3 Similarity Explanation

Do not merely say that two entries are related.

Explain the connection using the actual content of both entries.

Avoid invented relationships or unsupported conclusions.

# 9. AI FEATURE — IDEA EVOLUTION

Introduce a distinctive **Evolution** view.

The purpose is to show how an idea develops across time.

Example:

Version 1:
"Build a messaging app."

Version 2:
"Make messaging more personal and authentic."

Version 3:
"Introduce a virtual doorbell for spontaneous conversations."

Version 4:
"Build Unmasked with integrated Portal calling."

Echo should help users visualize these stages as one evolving idea.

## Evolution Features

- Idea origin.
- Related entries over time.
- Major changes.
- Important decisions.
- Current status.
- Open questions.
- Next possible steps.
- Links to projects.
- Timeline of revisions.

Distinguish genuine history from AI interpretation.

Do not invent events, decisions, or development progress.

Allow users to correct suggested evolution paths.

# 10. AI FEATURE — DEVELOP AN IDEA

Create an AI-assisted development workspace.

The user selects an entry and chooses Develop.

Echo offers tools such as:

- Expand the idea.
- Brainstorm alternatives.
- Find weaknesses.
- Identify obstacles.
- Generate implementation steps.
- Explore possible use cases.
- Compare alternatives.
- Simplify the concept.
- Turn into a project.
- Generate a checklist.
- Generate a specification.
- Ask useful questions.

## Interactive AI Workspace

Provide a contextual AI conversation associated with the selected idea or project.

The assistant should understand:

- The current entry.
- Related entries authorized by the user.
- Relevant project context.
- User-selected goals.

It should not automatically retrieve every private entry.

## Outputs

Users should be able to:

- Save an AI response as a new entry.
- Append a selected section to an entry.
- Turn suggestions into tasks.
- Create a project from a conversation.
- Link generated content to its source.
- Export generated specifications.
- Undo accepted edits.

Never overwrite original content without an explicit user action.

## AI Conversation History

Persist AI-assisted development sessions locally or through the configured synchronization backend.

Provide deletion and export options.

Make model identity and processing mode visible.

# 11. AI FEATURE — ASK ECHO

Implement a natural-language interface for searching and reasoning over the user's own knowledge base.

Example questions:

"What application ideas have I had recently?"

"Which projects have I abandoned?"

"Have I thought about something similar before?"

"Show all ideas related to artificial intelligence."

"What are the unresolved problems in my School Manager project?"

"What have I been working on most frequently this month?"

"Which of my ideas could be combined?"

## Retrieval-Augmented Generation

Implement a retrieval pipeline using:

- Full-text search.
- Metadata filtering.
- Semantic search when available.
- User-defined scope.
- Relevant context selection.
- Model response generation.

Use only authorized entries.

## Source Attribution

Responses must reference the actual entries used.

Provide clickable source references.

For each relevant claim about the user's history, link to the underlying entry.

If Echo cannot find enough evidence, it must say so rather than fabricate details.

Differentiate:

- Directly supported observations.
- AI interpretations.
- Speculative suggestions.

## Search Scopes

Support searching:

- All permitted entries.
- A selected project.
- A collection.
- A date range.
- Selected tags.
- One specific entry and its relationships.

Allow users to inspect or modify the selected scope before asking questions.

# 12. KNOWLEDGE GRAPH

Create an interactive visual graph showing relationships between ideas.

This is one of Echo's signature interfaces.

## Graph Nodes

Nodes can represent:

- Entries.
- Projects.
- Collections.
- Concepts.
- Tags.

## Graph Edges

Edges represent relationships between nodes.

Use different visual treatments for:

- Manually created relationships.
- AI-suggested relationships.
- Project membership.
- Evolution links.

## Interactions

Users should be able to:

- Zoom.
- Pan.
- Select nodes.
- Open entries.
- Expand related ideas.
- Collapse clusters.
- Filter by topic.
- Filter by time.
- Search the graph.
- Create relationships.
- Remove relationships.
- Switch layouts.

Provide accessible alternatives to graph-only navigation.

The visualization must perform reasonably with large collections of notes.

Use virtualization, clustering, selective rendering, or other appropriate techniques.

Do not render thousands of expensive interactive components unnecessarily.

On mobile, adapt the layout for touch interaction.

# 13. PROJECTS AND COLLECTIONS

Echo must support developing groups of ideas into actual projects.

## Projects

A project can contain:

- Name.
- Description.
- Icon.
- Accent color.
- Status.
- Linked entries.
- Tasks.
- Milestones.
- Relevant files.
- Decisions.
- AI conversations.
- Creation and modification timestamps.

Suggested statuses:

- Concept.
- Exploring.
- Planned.
- In progress.
- Paused.
- Completed.
- Archived.

## Project Workspace

Create a project dashboard showing:

- Overview.
- Related ideas.
- Development timeline.
- Tasks.
- Important decisions.
- Outstanding questions.
- Recent activity.
- AI recommendations.

## Tasks

Allow users to convert ideas into actionable tasks.

Support:

- Title.
- Description.
- Status.
- Priority.
- Optional due date.
- Linked source entries.
- Optional subtasks.
- Completion history.

Keep task management simple.

Echo is primarily an ideas application, not a replacement for an enterprise project management platform.

## Collections

Implement custom collections independent of formal projects.

An entry may belong to multiple collections.

Support manual ordering where useful.

# 14. JOURNALING AND REFLECTION

In addition to idea management, Echo should support ordinary personal journaling.

Users should be able to record daily experiences, observations, and reflections.

Do not force every journal entry to become a project.

## Daily Journal

Features:

- Date-based entries.
- Multiple entries per day.
- Optional prompts.
- Optional mood labels.
- Optional attachments.
- Calendar navigation.
- Private reflection mode.
- Search across entries.

## Reflection Assistant

Offer optional prompts such as:

- "What was worth remembering today?"
- "What idea keeps coming back to you?"
- "Did anything change your perspective?"
- "Is there something you want to revisit?"

Do not turn journaling into a mandatory habit.

No forced streaks, guilt-driven reminders, or manipulative engagement mechanisms.

## Weekly and Monthly Reviews

Generate optional summaries based on authorized entries.

Potential sections:

- Ideas captured.
- Projects progressed.
- Questions left unanswered.
- Frequently revisited topics.
- Important personal reflections.
- Potential connections.
- Next steps.

These summaries must be grounded in real entries.

Avoid unsupported psychological claims or mental health diagnoses.

Do not infer sensitive personal attributes from journal entries without a clear user-directed purpose.

## Memory and Continuity

The assistant should use explicitly selected or authorized historical entries as context.

Allow users to correct or remove AI-generated interpretations.

Do not maintain an inaccessible hidden personal profile.

# 15. REMINDERS AND IDEA REDISCOVERY

Implement optional systems for rediscovering forgotten ideas.

## Resurface

Suggest older entries that may be useful.

Examples:

- Ideas related to a current project.
- Old entries that were never developed.
- Notes marked for later.
- Ideas recently made relevant by new entries.

## Reminders

Support:

- One-time reminders.
- Recurring reminders.
- Remind me later.
- Project follow-ups.
- Optional daily journal prompts.
- Weekly reviews.

Notifications must be user-configurable.

Do not send sensitive diary content in notification previews unless explicitly allowed.

## Contextual Rediscovery

Example:

A user records an idea about mobile application authentication.

Echo notices an existing project with unresolved authentication tasks.

It may suggest linking the idea to that project.

The suggestion should be non-intrusive and dismissible.

Do not create tasks or modify projects automatically without permission.

# 16. LOCAL-FIRST ARCHITECTURE

Echo must work as a complete non-AI ideas diary without internet access.

Local-first behavior is a central requirement.

## Offline Capabilities

Without internet access, users must be able to:

- Create entries.
- Edit entries.
- Read existing locally available entries.
- Search locally.
- Organize collections.
- Edit projects.
- Create links.
- View cached relationships.
- Export local data.
- Use non-cloud features.

Changes should synchronize when connectivity returns, if synchronization is enabled.

## Local Storage

Use a suitable structured local database.

Potential choices:

- SQLite on iOS/Android.
- IndexedDB or another reliable browser persistence layer on Web.

Evaluate current platform support and compatibility.

Avoid treating AsyncStorage as the primary database for the entire knowledge base.

## Offline Synchronization

Design a reliable synchronization layer supporting:

- Stable record identifiers.
- Mutation queues.
- Idempotent operations.
- Revision tracking.
- Deletion tombstones.
- Retry policies.
- Sync cursors.
- Incremental synchronization.
- Conflict detection.
- Conflict resolution.

Do not silently discard one device's changes in favor of another.

For genuinely conflicting edits, preserve recoverable versions and provide an understandable resolution interface.

A full CRDT implementation may be considered if justified, but do not introduce unnecessary complexity without an implementation benefit.

## Synchronization Modes

Support:

1. Local-only storage.
2. Self-hosted synchronization.
3. Optional hosted synchronization in the future.

Local-only use must not require account creation.

Provide a documented method for moving from local-only to a synchronized account without data loss.

# 17. ACCOUNT AND AUTHENTICATION SYSTEM

Account registration is optional for local-only use.

For synchronization, implement secure authentication.

Features:

- Email registration.
- Secure password hashing.
- Email verification.
- Password reset.
- Passkeys where supported.
- Multi-device sessions.
- Device management.
- Session revocation.
- Secure refresh-token handling.

Apple/Google sign-in may be added when correctly configured.

Do not invent working third-party authentication without valid credentials.

Provide a clear separation between offline accounts and authenticated synchronized accounts.

# 18. PRIVACY, DATA OWNERSHIP, AND ENCRYPTION

Echo may contain highly personal information.

Treat privacy as a foundational architectural requirement.

## Privacy Requirements

- No advertising trackers.
- No sale of user data.
- No hidden AI processing.
- No mandatory cloud storage.
- No automatic sharing between users.
- No public entries by default.
- No sensitive content in analytics events.
- No unnecessary retention of AI requests.
- No production logging of diary contents.
- No provider credentials in logs or exports.

## Local Data Protection

Use appropriate platform storage protection and secure key management.

Investigate application-level local encryption where feasible.

Document its actual protections and limitations.

## Cloud Synchronization

Encrypt communications in transit.

Protect stored data using strong access controls and appropriate encryption.

Consider optional end-to-end encryption or client-side encryption for synchronized entries.

If implemented, carefully distinguish:

- Encryption in transit.
- Server-side encryption at rest.
- True client-side end-to-end encryption.

A genuinely end-to-end encrypted sync server should not be able to read entry contents.

If server-side AI or search requires plaintext, make the tradeoff explicit.

Do not claim both server-inaccessible content and unrestricted server-side AI processing without an actual secure architecture that supports them.

## Key Management

For encrypted synchronization, document:

- Key generation.
- Device provisioning.
- Recovery.
- Key rotation.
- Account reset.
- Lost-key consequences.
- Encrypted backup restoration.

Never build custom cryptographic primitives.

Use established libraries and well-understood protocols.

## Data Export and Deletion

Users must be able to:

- Export all entries.
- Export selected projects.
- Export attachments.
- Export AI conversations.
- Export relationships.
- Export account settings.
- Delete individual entries.
- Delete collections.
- Delete account data.
- Clear local caches.
- Reset AI indexes.
- Revoke synchronization sessions.

Document backup retention and deletion behavior.

Design with GDPR-oriented privacy principles without claiming formal legal compliance absent review.

# 19. IMPORT AND EXPORT

Portability is mandatory.

## Export Formats

Support:

- JSON.
- Markdown.
- ZIP archive containing entries and attachments.
- Human-readable project export.

Preserve stable identifiers and relationship metadata in complete backups.

## Import Formats

Support:

- Echo JSON backups.
- Markdown files.
- Plain-text files.
- ZIP archives in the documented Echo format.

Consider future adapters for other notes systems, such as Obsidian-compatible Markdown collections.

## Import Requirements

Implement:

- Format validation.
- Schema versioning.
- Duplicate detection.
- Import preview.
- Progress display.
- Safe error handling.
- Relationship restoration.
- Attachment validation.
- Rollback or recoverable import behavior.

Do not execute imported code or trust imported HTML.

Protect against path traversal, oversized archives, and malformed files.

# 20. TECHNICAL ARCHITECTURE

Prefer TypeScript across frontend and backend.

## Frontend

Preferred stack:

- React Native.
- Expo.
- Expo Router.
- React Native Web.
- TypeScript.
- TanStack Query for remote state.
- Zustand or an equivalent lightweight state library.
- SQLite for supported native platforms.
- Browser persistence abstraction for Web.
- A well-supported accessible UI component foundation.
- Platform-specific native integrations when necessary.

Support:

- iOS.
- Android.
- Desktop browsers.
- Mobile browsers.
- Installable PWA.

Use native development builds for features requiring native extensions or plugins.

## Backend

Preferred:

- Node.js.
- TypeScript.
- Fastify or NestJS.
- PostgreSQL.
- Prisma or a comparable mature database library.
- pgvector for optional server-side semantic retrieval.
- S3-compatible storage for attachments.
- Background jobs for asynchronous processing.

Evaluate current maintained libraries before selecting exact versions.

## AI Infrastructure

Use modular adapters for:

- Text generation.
- Structured output.
- Embedding generation.
- Speech transcription.
- Optional local inference.

Keep model-specific implementations separate from application business logic.

Implement:

- Retry with exponential backoff.
- Cancellation.
- Timeouts.
- Usage accounting.
- Error normalization.
- Rate limiting.
- Streaming where supported.
- Context size enforcement.
- Output schema validation.

Provide a way to disable AI processing entirely.

## Monorepo Structure

Suggested layout:

/apps/mobile  
/apps/web  
/apps/api  
/apps/worker  
/packages/ui  
/packages/shared  
/packages/contracts  
/packages/ai  
/packages/database  
/packages/sync  
/packages/config  
/infra  
/docs

Adapt this architecture where a unified Expo app provides a cleaner implementation.

Do not create unnecessary packages solely to mimic a monorepo diagram.

# 21. DATABASE DESIGN

Create a properly normalized schema.

Suggested entities:

- User
- UserSettings
- AuthSession
- Device
- Entry
- EntryRevision
- EntryAttachment
- EntryTag
- Tag
- Collection
- CollectionEntry
- Project
- ProjectEntry
- ProjectTask
- IdeaRelationship
- RelationshipSuggestion
- EntryEmbedding
- AIProviderConfiguration
- AIConversation
- AIMessage
- AIAnalysis
- AIUsageRecord
- Reminder
- JournalReview
- SyncOperation
- SyncCursor
- DeletedRecord
- ImportJob
- ExportJob
- AuditEvent

Adapt the model according to the implementation.

## Important Constraints

Implement:

- Stable record identifiers.
- Unique ownership constraints.
- Efficient date-based queries.
- Full-text search indexes.
- Relationship indexes.
- Project membership indexes.
- Embedding indexes where supported.
- Referential integrity.
- Soft deletion where appropriate.
- Appropriate retention policies.
- Version-aware schema migrations.

Do not store encrypted provider credentials in a format recoverable by an unauthorized client.

Do not use database row ownership alone as proof of authorization; enforce access controls within the application.

# 22. API DESIGN

Create typed API contracts.

Illustrative endpoints:

## Entries

GET /entries  
POST /entries  
GET /entries/:id  
PATCH /entries/:id  
DELETE /entries/:id  
GET /entries/:id/revisions

## Projects

GET /projects  
POST /projects  
GET /projects/:id  
PATCH /projects/:id  
GET /projects/:id/entries

## Relationships

GET /entries/:id/relationships  
POST /relationships  
DELETE /relationships/:id

## AI

POST /ai/analyze-entry  
POST /ai/suggest-links  
POST /ai/develop  
POST /ai/ask  
POST /ai/transcribe

## Search

GET /search  
POST /search/semantic

## Sync

POST /sync/push  
GET /sync/pull

## Data Portability

POST /import  
POST /export

## Account

GET /account  
PATCH /account  
DELETE /account

These are examples, not an exhaustive endpoint contract.

Provide server-side schema validation, authorization, consistent errors, and API documentation.

For long-running AI tasks, use a suitable asynchronous job mechanism.

Do not block ordinary entry saving on AI availability.

# 23. USER INTERFACE DESIGN

The interface must be modern, calm, elegant, and highly polished.

Echo should feel like a personal creative workspace rather than an enterprise productivity dashboard.

## Visual Identity

Working accent color: **#6269F5**.

Use:

- Minimal visual clutter.
- Strong typography.
- Comfortable whitespace.
- Elegant cards.
- Subtle animations.
- Restrained glass/translucency where appropriate.
- Carefully designed empty states.
- Consistent iconography.
- Soft visual emphasis for AI functionality.

Support:

- Light theme.
- Dark theme.
- System theme.
- Accessible contrast.
- Dynamic text sizing.
- Reduced motion.
- Keyboard navigation.
- Screen readers.
- Responsive layouts.

## Required Screens

### Welcome

Explain the application's purpose without excessive onboarding.

Offer:

- Get Started Locally.
- Configure Synchronization.
- Sign In.

### Home

Show:

- Quick Capture.
- Recent Thoughts.
- Continue Developing.
- Suggested Connections.
- Active Projects.
- Optional reminders.

The homepage should remain useful without AI.

### Capture

Provide an extremely fast thought composer.

### Journal

Chronological entries, calendar navigation, and filters.

### Entry Detail

Full content, attachments, relationships, revisions, and optional AI actions.

### Explore

Knowledge graph, topic clusters, collections, and semantic search.

### Develop

AI-assisted idea workspace.

### Ask Echo

Conversational natural-language exploration with source links.

### Projects

Project directory and individual project workspaces.

### Reflection

Daily/weekly/monthly review interface.

### Search

Full-text, metadata, and optional semantic search.

### Settings

Account, sync, AI providers, privacy, appearance, notifications, exports, and security.

### Developer Options

Ideas, changelog, diagnostics, model usage, and debug controls.

## Navigation

Use predictable native navigation.

Support deep links and browser history.

Test direct navigation to nested routes in Expo Router Web.

Avoid navigation bugs where the back button disappears after refreshing or entering a nested route directly.

# 24. SIGNATURE INTERACTIONS

Implement polished interactions that make Echo distinctive.

## Floating Capture Button

A prominent capture action accessible from the main interface.

## AI Suggestion Chips

Contextual actions such as:

- Develop.
- Connect.
- Summarize.
- Turn into Project.
- Ask Echo.

## Idea Connections

Allow users to connect two entries with an intuitive interaction.

## Evolution Timeline

Visualize an idea's history.

## Resurface Cards

Offer optional reminders of old thoughts that may be relevant.

## AI Source References

Tapping a source reference opens the exact underlying entry.

## Draft Protection

Preserve writing when changing screens.

Use restrained animations and maintain good accessibility.

# 25. DEVELOPER OPTIONS — UADS COMPLIANCE

Every OpenRecode application must contain developer options.

For Echo, include:

- Application version.
- Build identifier.
- Environment.
- Database information.
- Sync status.
- Pending operations.
- Local cache information.
- AI provider status.
- Model information.
- Embedding index status.
- AI request diagnostics.
- Changelog.
- Developer Ideas page.

Never reveal secrets in diagnostics.

## Developer Ideas Page

This is separate from Echo's ordinary personal ideas.

The developer Ideas page is specifically for collecting improvements and fixes for the Echo application itself.

Each developer idea should include:

- ID.
- Title.
- Description.
- Category.
- Priority.
- Status.
- Created timestamp.
- Updated timestamp.
- Optional screenshot.
- Related application feature.
- Implementation notes.

Support:

- Create.
- Edit.
- Delete.
- Search.
- Filter.
- Export JSON.
- Import JSON.
- Duplicate handling.
- Linking completed ideas to changelog entries.

Statuses:

- New.
- Under consideration.
- Approved.
- In progress.
- Implemented.
- Deferred.
- Rejected.

This page should match the UADS Ideas standard.

## Changelog

Maintain a structured application changelog.

Include meaningful additions, changes, fixes, security updates, and removals.

Link implemented developer ideas to changelog entries.

# 26. OPENRECODE STANDARDS

Echo belongs to the OpenRecode initiative.

The project must be:

- Open-source.
- Self-hostable.
- Free of advertisements.
- Free of mandatory commercial service dependencies.
- Accessible to community contributors.
- Forkable.
- Documented.
- Reproducibly buildable.
- Independent of proprietary AI providers for its core features.

Consider AGPLv3, subject to dependency and legal compatibility, and document the chosen license.

Do not copy proprietary products, branding, or code without permission.

## Required Files

README.md  
LICENSE  
CONTRIBUTING.md  
CODE_OF_CONDUCT.md  
SECURITY.md  
CHANGELOG.md  
.env.example  
docs/ARCHITECTURE.md  
docs/AI.md  
docs/PRIVACY.md  
docs/API.md  
docs/SYNCHRONIZATION.md  
docs/DEPLOYMENT.md  
docs/DATA_FORMAT.md  
docs/ROADMAP.md

Document:

- Local development.
- Self-hosting.
- Model configuration.
- Offline mode.
- Backup restoration.
- Data deletion.
- Privacy limitations.
- Contributing guidelines.

Do not make a paid AI API key mandatory to start Echo.

# 27. INTEROPERABILITY WITH OTHER OPENRECODE APPLICATIONS

Design optional interoperability with the broader OpenRecode ecosystem.

Potential future integrations:

**Unmasked:** Users may explicitly save selected conversation thoughts or personal notes into Echo.

**Persona:** Users may develop portfolio descriptions and project narratives in Echo, then explicitly export them.

**School Manager:** Students may save educational ideas, learning plans, or project notes.

**Tempo:** Users may link focus sessions to Echo projects.

**Pathway:** Users may save trip ideas or plans.

These are future extensions.

Do not automatically access data from other applications.

Do not require the other applications to be installed.

Use versioned, permission-aware import/export contracts.

Keep Echo independently functional.

# 28. PERFORMANCE REQUIREMENTS

Aim for:

- Very fast capture.
- Reliable offline storage.
- Smooth scrolling.
- Efficient full-text search.
- Responsive mobile interactions.
- Fast entry loading.
- Incremental background indexing.
- Efficient attachment handling.
- Bounded AI context usage.
- Memory-efficient graph visualization.
- Graceful degradation without AI or internet.

Avoid blocking the UI during AI processing.

Use background jobs where appropriate.

Do not claim measured performance targets without real benchmarks.

# 29. TESTING REQUIREMENTS

Implement a meaningful automated test suite.

## Unit Tests

Cover:

- Entry creation.
- Draft management.
- Entry versioning.
- Tag and collection operations.
- Relationship logic.
- Import/export parsing.
- AI output validation.
- Provider configuration.
- Permission checks.
- Sync conflict resolution.

## Integration Tests

Cover:

- Local entry persistence.
- Account authentication.
- Data synchronization.
- Multi-device updates.
- Entry attachments.
- AI job execution.
- Semantic search with test fixtures.
- Data exports.
- Data imports.
- Account deletion.
- Authorization failures.

## End-to-End Tests

Test realistic flows:

- Capture a thought offline.
- Close and reopen the app.
- Find the thought.
- Edit it.
- Link it to another entry.
- Create a project.
- Add the entry to the project.
- Configure AI.
- Request idea development.
- Accept selected suggestions.
- Export the project.

Use deterministic fixtures and mocked model responses for repeatable tests.

Where credentials and network access permit, separately test at least one genuine provider integration.

Do not label mocked AI output as proof that a real model integration works.

## Privacy Tests

Ensure:

- AI-disabled mode sends no content to AI providers.
- Excluded entries remain excluded.
- Unauthorized accounts cannot retrieve entries.
- Exported data excludes secrets.
- Logs do not expose personal content.
- Deleted data follows documented deletion behavior.

# 30. IMPORTANT USER SCENARIOS

## Scenario A — Instant Idea Capture

A user suddenly thinks:

"What if there was a website that lets people generate portfolios without writing code?"

They open Echo.

They press New Thought.

They enter the idea.

The entry saves immediately.

Later, Echo suggests:

"This may be related to your Persona project."

The user can accept or reject the relationship.

Nothing is linked automatically without the appropriate configured behavior.

## Scenario B — Developing an Idea

A user selects an old idea.

They press Develop.

The AI asks clarifying questions and suggests implementation strategies.

The user chooses Generate Project Plan.

Echo produces a structured proposal.

The user saves selected sections and creates a project.

The original idea remains unchanged.

## Scenario C — Connected Thoughts

The user has several scattered entries about a messaging platform.

Echo identifies possible connections.

The user opens Explore.

They see a cluster of related ideas.

They choose to combine them into a project.

Echo generates a suggested outline.

The user reviews and accepts it.

## Scenario D — Offline Capture and Sync

The user creates entries without internet.

They edit an existing entry.

They later reconnect.

Changes synchronize.

If another device independently edited the same content, Echo preserves both recoverable versions and presents a conflict-resolution workflow.

No thought is silently lost.

## Scenario E — Private AI

A user disables remote AI processing.

They create several personal diary entries.

The entries remain available through ordinary local search.

No content is sent to a cloud AI provider.

The user may later configure an optional self-hosted AI model.

The interface clearly displays which processing mode is active.

## Scenario F — Personal Knowledge Search

The user asks:

"What were my ideas for School Manager last month?"

Echo retrieves relevant authorized entries.

It summarizes the ideas.

Each statement links to its source entry.

If no matching entries exist, Echo says so.

It must not fabricate past ideas.

# 31. IMPLEMENTATION PHASES

Execute the project in the following order.

## Phase 1 — Foundation

- Inspect existing environment.
- Initialize the application.
- Establish architecture.
- Configure TypeScript.
- Create design system.
- Implement local storage.
- Configure navigation.
- Configure development tooling.
- Create database schema and migrations.

Deliver a functioning application shell.

## Phase 2 — Functional Diary

- Quick Capture.
- Entry creation.
- Entry editing.
- Local persistence.
- Autosave.
- Journal timeline.
- Search.
- Tags.
- Collections.
- Favorites.
- Archive.
- Entry revisions.

This must produce a useful offline application even if AI is never configured.

## Phase 3 — Projects and Relationships

- Projects.
- Tasks.
- Entry relationships.
- Project workspaces.
- Link navigation.
- Manual idea organization.
- Basic graph visualization.

## Phase 4 — AI Foundation

- Provider abstraction.
- Secure configuration.
- AI analysis.
- Summaries.
- Tag suggestions.
- Title suggestions.
- Idea development.
- Structured response validation.
- Usage visibility.

## Phase 5 — Intelligent Knowledge

- Semantic embeddings.
- Similarity recommendations.
- Related ideas.
- Ask Echo.
- Retrieval-augmented generation.
- Source attribution.
- Knowledge graph enhancements.
- Idea evolution.

## Phase 6 — Reflection and Capture Extensions

- Weekly/monthly reviews.
- Rediscovery.
- Reminders.
- Voice capture.
- Transcription.
- Attachments.
- Share extensions where feasible.

## Phase 7 — Sync and Self-Hosting

- Account system.
- Multi-device synchronization.
- Conflict resolution.
- Docker deployment.
- Self-hosted infrastructure.
- Backup and restore.

## Phase 8 — Production Readiness

- Security hardening.
- Accessibility.
- Performance optimization.
- Automated tests.
- Documentation.
- Open-source preparation.
- Release builds.

Build complete vertical slices.

If all phases cannot be finished in the available execution, prioritize the functional offline diary, then the AI foundation, then advanced intelligence and synchronization.

Maintain an accurate record of unfinished features.

# 32. FINAL DELIVERABLES

Deliver:

1. Functional source code.
2. iOS/Android/Web application.
3. Local-first entry storage.
4. Functional journal and entry editor.
5. Projects and organization.
6. Idea relationship system.
7. Configurable AI integration.
8. AI-assisted idea development.
9. Search and source attribution.
10. Knowledge graph.
11. Import/export.
12. Backend and synchronization infrastructure.
13. Docker-based self-hosting.
14. Developer options.
15. Ideas and changelog integration.
16. Automated tests.
17. Documentation.
18. Build instructions.
19. Known limitations.
20. Remaining roadmap.

Provide exact commands for:

- Installing dependencies.
- Starting development.
- Running Web.
- Running iOS.
- Running Android.
- Running database migrations.
- Running tests.
- Configuring AI providers.
- Building production versions.
- Starting the self-hosted stack.

Clearly identify features requiring credentials, Apple signing, external services, or physical hardware.

# 33. DEFINITION OF DONE

Echo must function as a real ideas diary.

The minimum acceptance criteria are:

- A user can create and edit entries.
- Entries persist after restarting.
- Entries can be searched and organized.
- Offline use works.
- Users can create projects.
- Entries can be linked to projects.
- AI can analyze an entry when configured.
- AI can help develop an idea.
- AI-generated changes require appropriate user approval.
- Search respects privacy settings.
- User data can be exported.
- The application is buildable.
- The codebase has meaningful tests.
- Self-hosting is documented and implemented for features that require the backend.
- AI is optional.
- No unsupported privacy or encryption claims are made.

Do not report incomplete functionality as finished.

Provide a truthful final report distinguishing:

- Implemented and tested.
- Implemented but not fully tested.
- Partially implemented.
- Not implemented.
- Blocked by external requirements.

# 34. EXECUTION DIRECTIVE

Begin implementation immediately.

Inspect the workspace and select the final architecture.

Create the project and implement the core diary first.

Verify local persistence and offline behavior before adding advanced AI functionality.

Then build the idea relationships, project workspace, AI integrations, and knowledge features.

Run tests, correct failures, and document the result.

Do not stop after planning.

Do not substitute static mockups for working functionality.

Do not require paid services for the core experience.

The final product should be practical to use daily, technically maintainable, and suitable for eventual publication under OpenRecode.

**Final objective: create a polished, private, open-source thinking environment that captures ideas effortlessly, preserves them reliably, discovers meaningful connections, and helps users turn unfinished thoughts into real projects.**