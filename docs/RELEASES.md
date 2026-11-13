# Build and release process

New project branches: testing (development), beta (feature-complete prerelease candidates), main (stable). Initial implementation remains on testing; beta/main remain foundation placeholders until validation warrants promotion. No release publication is authorized or activated.

`Validate Echo` is manual or pull-request triggered: typecheck, domain/API tests, production Web and Chromium E2E. `Mobile distribution builds` runs manually or on beta/main, with four independent jobs: iOS unsigned device IPA, iOS simulator app.zip, signed Android universal APK and signed Android AAB. fail-fast is disabled so successful artifacts survive another job's failure. Artifacts include version/channel/commit; SHA-256 files are generated. Native configuration is generated from the pinned Expo project.

Android release jobs require an existing approved signing identity in repository secrets: ECHO_KEYSTORE_BASE64, ECHO_KEYSTORE_PASSWORD, ECHO_KEY_ALIAS, ECHO_KEY_PASSWORD. Never substitute a debug key or rotate the signing identity. These secrets are not created by this implementation. Native jobs have not been claimed successful without run evidence.

Run from GitHub Actions UI or `gh workflow run mobile-build.yml --ref testing` for an explicitly requested manual check. Remote builds may incur runner costs. After submission, report the run URL/status and stop actively waiting when the build is expected to take more than three minutes. Do not cancel it merely because of this limit.

Device unsigned IPA requires signing before ordinary installation. Simulator bundles cannot be installed as physical-device IPA. AAB is a store artifact, not a directly installable APK. Before any release, verify native architectures/package IDs/version/build/signing, complete required artifacts, calculate checksums, match source commit, and validate actual download URLs.

Production publication automation, GitHub-generated client update manifests, native in-app download/install and store update flows are not complete. No AltSource/Obtainium endpoint or sources-v1.0 release exists. Do not expose failed/incomplete artifacts as updates. PWA service-worker update activation and staged-release notes are implemented and tested with an isolated synthetic build. Full native release-note/version integration remains tracked in ROADMAP.md.
