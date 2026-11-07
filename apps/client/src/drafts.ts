// SPDX-License-Identifier: AGPL-3.0-only
import { getState, preferences } from "./store";
// Separate local draft metadata; excluded from backup and sync.
type EditDraft = { title: string; text: string; tags: string; type: string };
export async function getEditDraft(id: string): Promise<EditDraft | null> {
  return (
    (
      getState().meta.preferences as unknown as {
        editDrafts?: Record<string, EditDraft>;
      }
    ).editDrafts?.[id] || null
  );
}
export async function saveEditDraft(id: string, draft: EditDraft) {
  const current =
    (
      getState().meta.preferences as unknown as {
        editDrafts?: Record<string, EditDraft>;
      }
    ).editDrafts || {};
  await preferences({ editDrafts: { ...current, [id]: draft } } as never);
}
export async function deleteEditDraft(id: string) {
  const current = {
    ...(
      getState().meta.preferences as unknown as {
        editDrafts?: Record<string, EditDraft>;
      }
    ).editDrafts,
  };
  delete current[id];
  await preferences({ editDrafts: current } as never);
}
