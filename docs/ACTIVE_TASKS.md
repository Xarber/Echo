# Echo active task queue

Scope from the November 14–15 requests and subsequent continuation. The order
groups dependent work. Release operations follow implementation and validation.

| ID | Requested outcome | State | Evidence or next action |
|---|---|---|---|
| E01 | Android build recovery | Blocked for signed distribution | Run 43584716740 failed at release signing. Existing release identity is unavailable. Add separate compile verification. |
| E02 | Native tabs, safe areas and coherent layout | Implemented | Primary destinations use Expo Router NativeTabs on mobile. The tab container owns the bottom inset. Build and device verification remain pending. |
| E03 | On-device daily prompts and multi-day reflection | Queued | Offline fixed prompts landed in 63fe6f3. Add an Apple Foundation Models adapter, availability checks and explicit journal context selection. |
| E04 | Introduction and genuine screenshots | Implemented in part | 0d432db adds guide completion, skip and replay. Generate real captures per browser/device category and integrate them. |
| E05 | Developer screenshot tools and isolated sample data | Queued | Render the actual screens with a separate read-only fixture source and add export. |
| E06 | Developer server switcher and production behavior | Implemented | 36f295d rejects missing or invalid production endpoints. Switcher probes health without credentials and requires an unbound diary. Browser and native switching verification remain pending. |
| E07 | Release downloads and install options | Implemented in part | d2b36d0 adds stable discovery and PWA prompt. Validate against real release assets and add applicable alternative installers. |
| E08 | UADS quality, evidence, release and operations | Implemented in part | a292ccf adds initial declarations and validator. Expand enforceable gates, recovery evidence and release automation. |
| E09 | Build, publication and X-Center deployment | Queued | Validate eligible artifacts and stage deployment. Prior X-Center connection failed; recheck independently. |

E06 addresses the credential boundary before adding developer controls.
Repository Ideas has zero pending, approved or deferred entries.
