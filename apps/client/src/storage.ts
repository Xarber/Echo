// SPDX-License-Identifier: AGPL-3.0-only
export interface Storage {
  load(): Promise<{
    records: unknown[];
    meta: Record<string, unknown>;
    readOnlyReason?: string;
  }>;
  commit(
    records: { id: string }[],
    meta: Record<string, unknown>,
  ): Promise<void>;
}
export { storage } from "./storage.native";
