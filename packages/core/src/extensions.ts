// SPDX-License-Identifier: AGPL-3.0-only
/** Host-owned extension points only. No downloaded/executable plugin runtime. */
export type ExtensionCapability = "capture" | "navigation";
export type ExtensionManifest = {
  id: string;
  apiVersion: 1;
  name: string;
  permissions: ExtensionCapability[];
};
export type ExtensionAction = {
  id: string;
  label: string;
  run: () => Promise<void>;
};
export class ExtensionRegistry {
  private extensions = new Map<
    string,
    { manifest: ExtensionManifest; actions: ExtensionAction[] }
  >();
  register(
    manifest: ExtensionManifest,
    actions: ExtensionAction[],
    approved: ExtensionCapability[],
  ) {
    if (manifest.apiVersion !== 1) throw new Error("Unsupported extension API");
    if (this.extensions.has(manifest.id))
      throw new Error("Duplicate extension");
    if (manifest.permissions.some((p) => !approved.includes(p)))
      throw new Error("Extension permission not granted");
    this.extensions.set(manifest.id, { manifest, actions });
    return () => this.extensions.delete(manifest.id);
  }
  actions() {
    return [...this.extensions.values()].flatMap((e) =>
      e.actions.map((a) => ({ ...a, id: `${e.manifest.id}:${a.id}` })),
    );
  }
  async invoke(id: string) {
    const action = this.actions().find((a) => a.id === id);
    if (!action) throw new Error("Unknown extension action");
    await action.run();
  }
}
