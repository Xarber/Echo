// SPDX-License-Identifier: AGPL-3.0-only
import {
  configuredApiUrl,
  productionBuild,
  missingProductionEndpoint,
} from "./deployment";
import { useSyncExternalStore } from "react";
import {
  recordSchema,
  now,
  uid,
  exportData,
  planImport,
  type EchoRecord,
  type SyncOperation,
  type RemoteRecord,
  type Conflict,
} from "@echo/core";
import { storage } from "./storage";
import { getSession, saveSession, clearSession } from "./secrets";
export type Preferences = {
  theme: "system" | "light" | "dark";
  aiMode: "disabled" | "manual" | "local-only";
  apiUrl: string;
  welcome: boolean;
  lastVersion: string;
  autoCheck: boolean;
  draft: string;
  draftTitle: string;
  draftTags: string;
  draftAttachments: unknown[];
  draftType: string;
  draftMood: string;
  draftExcludeAI: boolean;
};
type Meta = {
  preferences: Preferences;
  queue: SyncOperation[];
  versions: Record<string, number>;
  cursor: number;
  conflicts: Conflict[];
  lastSync: string | null;
  accountId?: string;
  syncOrigin?: string;
};
const defaults: Preferences = {
  theme: "system",
  aiMode: "disabled",
  apiUrl: productionBuild
    ? configuredApiUrl
    : configuredApiUrl || "http://localhost:4280",
  welcome: false,
  lastVersion: "",
  autoCheck: true,
  draft: "",
  draftTitle: "",
  draftTags: "",
  draftAttachments: [],
  draftType: "Thought",
  draftMood: "",
  draftExcludeAI: false,
};
type Snapshot = {
  records: EchoRecord[];
  meta: Meta;
  loaded: boolean;
  error: string | null;
  syncing: boolean;
};
let state: Snapshot = {
  records: [],
  meta: {
    preferences: defaults,
    queue: [],
    versions: {},
    cursor: 0,
    conflicts: [],
    lastSync: null,
  },
  loaded: false,
  error: null,
  syncing: false,
};
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
let pending = Promise.resolve();
let persistenceReady = false;
let databaseReadable = false;
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = pending.then(fn);
  pending = next.then(
    () => {},
    () => {},
  );
  return next;
}
async function save(records: EchoRecord[], meta: Meta) {
  if (!persistenceReady)
    throw new Error(
      "The local database is unavailable. Existing data has not been changed.",
    );
  await storage.commit(records, meta);
  state = { ...state, records, meta, error: null };
  emit();
}
export async function initialize() {
  try {
    const loaded = await storage.load();
    const records = loaded.records.map((r) => recordSchema.parse(r));
    const meta = {
      ...state.meta,
      ...loaded.meta,
      preferences: {
        ...defaults,
        ...((loaded.meta.preferences as object) || {}),
        ...(productionBuild || configuredApiUrl
          ? { apiUrl: configuredApiUrl }
          : {}),
      },
    };
    persistenceReady = !loaded.readOnlyReason;
    databaseReadable = true;
    state = {
      ...state,
      records,
      meta,
      loaded: true,
      error: loaded.readOnlyReason || null,
    };
    emit();
  } catch {
    persistenceReady = false;
    databaseReadable = false;
    state = {
      ...state,
      loaded: true,
      error:
        "Local database could not be opened. Your data has not been reset. Reload or free storage.",
    };
    emit();
  }
}
export const useStore = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
export const getState = () => state;
export const preferences = (patch: Partial<Preferences>) =>
  exclusive(async () => {
    if (
      patch.apiUrl &&
      state.meta.syncOrigin &&
      patch.apiUrl.replace(/\/$/, "") !== state.meta.syncOrigin
    )
      throw new Error(
        "Reset sync binding before changing servers. Export a backup first.",
      );
    await save(state.records, {
      ...state.meta,
      preferences: { ...state.meta.preferences, ...patch },
    });
  });
export function putMany(input: EchoRecord[]) {
  return exclusive(async () => {
    const records = input.map((r) => recordSchema.parse(r));
    const map = new Map(state.records.map((r) => [r.id, r]));
    let queue = [...state.meta.queue];
    for (const record of records) {
      map.set(record.id, record);
      const previous = queue.find((q) => q.record.id === record.id);
      queue = queue.filter((q) => q.record.id !== record.id);
      queue.push({
        operationId: uid(),
        baseRevision:
          previous?.baseRevision ?? state.meta.versions[record.id] ?? 0,
        record,
      });
    }
    await save([...map.values()], { ...state.meta, queue });
  });
}
export const put = (r: EchoRecord) => putMany([r]);
export const remove = (r: EchoRecord) =>
  put({ ...r, deletedAt: now(), updatedAt: now() });
export function backup() {
  if (!databaseReadable)
    throw new Error(
      "Cannot export an unreadable database. Existing data is preserved; repair access before making a backup.",
    );
  return exportData(state.records);
}
export async function importBackup(input: unknown, replaceConflicts = false) {
  const plan = planImport(state.records, input);
  await putMany([...plan.added, ...(replaceConflicts ? plan.conflicts : [])]);
  return plan;
}
export async function api(path: string, body?: unknown, method?: string) {
  if (missingProductionEndpoint)
    throw new Error(
      "Online services are unavailable. You can still use your journal offline.",
    );
  const base = state.meta.preferences.apiUrl.replace(/\/$/, "");
  if (
    !/^https:\/\//.test(base) &&
    !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(base)
  )
    throw new Error(
      "Use HTTPS for remote servers; HTTP is allowed only on localhost.",
    );
  if (state.meta.syncOrigin && state.meta.syncOrigin !== base)
    throw new Error(
      "This diary is bound to a different server. Export a backup and reset sync binding before connecting.",
    );
  const token = await getSession();
  const response = await fetch(`${base}${path}`, {
    method: method || (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(65000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Server request failed");
  return data;
}
export async function authenticate(
  email: string,
  password: string,
  register: boolean,
) {
  const data = await api(register ? "/auth/register" : "/auth/login", {
    email,
    password,
  });
  await exclusive(async () => {
    if (state.meta.accountId && state.meta.accountId !== data.userId) {
      await fetch(
        `${state.meta.preferences.apiUrl.replace(/\/$/, "")}/auth/logout`,
        { method: "POST", headers: { Authorization: `Bearer ${data.token}` } },
      );
      throw new Error(
        "This diary is bound to a different sync account. Export a backup and reset sync binding before switching accounts.",
      );
    }
    await saveSession(data.token);
    await save(state.records, {
      ...state.meta,
      accountId: data.userId,
      syncOrigin: state.meta.preferences.apiUrl.replace(/\/$/, ""),
    });
  });
  return data;
}
export async function resetSyncBinding() {
  await clearSession();
  await exclusive(async () => {
    await save(state.records, {
      ...state.meta,
      accountId: undefined,
      syncOrigin: undefined,
      versions: {},
      cursor: 0,
      conflicts: [],
      lastSync: null,
      queue: state.records.map((record) => ({
        operationId: uid(),
        baseRevision: 0,
        record,
      })),
    });
  });
}
export async function logout() {
  try {
    await api("/auth/logout", {});
  } finally {
    await clearSession();
  }
}
export async function synchronize() {
  return exclusive(async () => {
    state = { ...state, syncing: true };
    emit();
    try {
      const push: { accepted: any[]; conflicts: any[] } = {
        accepted: [],
        conflicts: [],
      };
      for (let start = 0; start < state.meta.queue.length; start += 100) {
        const part = await api("/sync/push", {
          operations: state.meta.queue.slice(start, start + 100),
        });
        push.accepted.push(...part.accepted);
        push.conflicts.push(...part.conflicts);
      }
      const accepted = new Set<string>(
        push.accepted.map((v: { operationId: string }) => v.operationId),
      );
      const versions = { ...state.meta.versions };
      for (const a of push.accepted) versions[a.id] = a.revision;
      let queue = state.meta.queue.filter((q) => !accepted.has(q.operationId));
      const conflicts = [...state.meta.conflicts];
      for (const c of push.conflicts as {
        local: EchoRecord;
        remote: EchoRecord;
        revision: number;
      }[]) {
        if (!conflicts.some((x) => x.id === c.local.id))
          conflicts.push({ id: c.local.id, ...c });
      }
      const map = new Map(state.records.map((r) => [r.id, r]));
      let cursor = state.meta.cursor;
      let more = true;
      while (more) {
        const pull = await api(`/sync/pull?cursor=${cursor}`);
        for (const item of pull.records as RemoteRecord[]) {
          const remote = recordSchema.parse(item.record);
          const local = map.get(remote.id);
          const queued = queue.find((q) => q.record.id === remote.id);
          if (
            queued &&
            local &&
            JSON.stringify(local) !== JSON.stringify(remote)
          ) {
            if (!conflicts.some((c) => c.id === remote.id))
              conflicts.push({
                id: remote.id,
                local,
                remote,
                revision: item.revision,
              });
          } else {
            map.set(remote.id, remote);
            versions[remote.id] = item.revision;
          }
          cursor = item.sequence;
        }
        more = pull.more;
      }
      await save([...map.values()], {
        ...state.meta,
        queue,
        versions,
        cursor,
        conflicts,
        lastSync: now(),
      });
    } finally {
      state = { ...state, syncing: false };
      emit();
    }
  });
}
export function resolveConflict(
  id: string,
  choice: "local" | "remote" | "both",
) {
  return exclusive(async () => {
    const conflict = state.meta.conflicts.find((c) => c.id === id);
    if (!conflict) return;
    const chosen = choice === "remote" ? conflict.remote : conflict.local;
    const records = state.records.filter((r) => r.id !== id);
    records.push(chosen);
    const queue = state.meta.queue.filter((q) => q.record.id !== id);
    if (choice !== "remote")
      queue.push({
        operationId: uid(),
        baseRevision: conflict.revision,
        record: chosen,
      });
    if (choice === "both") {
      const copy = {
        ...conflict.remote,
        id: uid(),
        createdAt: now(),
        updatedAt: now(),
      };
      records.push(copy);
      queue.push({ operationId: uid(), baseRevision: 0, record: copy });
    }
    await save(records, {
      ...state.meta,
      queue,
      versions: { ...state.meta.versions, [id]: conflict.revision },
      conflicts: state.meta.conflicts.filter((c) => c.id !== id),
    });
  });
}

export async function flushLocalWrites() {
  await pending;
}
