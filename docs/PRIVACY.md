# Privacy

Echo has no advertising, trackers, analytics SDK or mandatory cloud account. Ordinary diary operations do not access the network. AI starts disabled and only selected, permitted text is sent after explicit consent. Provider credentials are server-only; sessions and credentials are excluded from backups and diagnostics.

Native local records use application SQLite and operating-system application protections; there is no application-level database encryption. Web uses origin-scoped IndexedDB and may be cleared by browser eviction/profile deletion. Data can be read by someone with access to the device/browser profile. Export backups regularly. Browser storage durability is not guaranteed by a successful write alone.

Self-hosted synchronization stores plaintext content in the server database. HTTPS protects transit when configured by the administrator. No end-to-end encryption, formal GDPR certification, secure erasure or production security audit is claimed. The administrator can read synchronized content. AI providers may retain content under their policies.

Backups include private content, attachments, conversation history and Trash in plaintext. Keep them on trusted storage. Markdown exports omit structured attachments/relationships. Deleting the server account removes live server records and sessions, not external backups or the local copy. Deleted entries remain recoverable until restored; configurable purging and a permanent local reset workflow remain pending.
