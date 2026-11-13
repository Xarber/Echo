# Prepared extension points

The domain package exposes ExtensionRegistry, version-1 manifests and explicit host-approved capabilities for capture/navigation actions. Registration rejects duplicate IDs, incompatible API versions and permissions outside the host approval set. The host owns actions, rendering and data access; nothing grants raw storage or secrets.

This is a code-level extension seam, not a distributable plugin runtime, sandbox or marketplace. No untrusted plugin code is loaded, and no extension installation UI exists. Any future runtime requires actual isolation, fine-grained permissions, revocation and store-compatible build separation before accepting third-party code.
