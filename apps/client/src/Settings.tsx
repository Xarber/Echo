// SPDX-License-Identifier: AGPL-3.0-only
import {
  developerOptionsEnabled,
  configuredApiUrl,
  productionBuild,
  missingProductionEndpoint,
} from "./deployment";
import { ServerSwitcher } from "./ServerSwitcher";
import React, { useState } from "react";
import { View, Pressable, Text, Platform } from "react-native";
import {
  VERSION,
  changelog,
  now,
  stamp,
  uid,
  developerIdeaSchema,
  updateDeveloperIdea,
  ideaStatuses,
  planImport,
  markdownExport,
  titleOf,
  type Entry,
  type DeveloperIdea,
} from "@echo/core";
import {
  useStore,
  preferences,
  backup,
  importBackup,
  authenticate,
  logout,
  synchronize,
  resetSyncBinding,
  resolveConflict,
  api,
  put,
  putMany,
  remove,
} from "./store";
import { Button, Card, Chip, Field, Label, Row, Section, Icon } from "./ui";
import { pickText, saveFile } from "./files";
import type { Navigate } from "./entries";
export function Settings({
  navigate,
  notify,
  onVersion,
  developer,
}: {
  navigate: Navigate;
  notify: (s: string) => void;
  onVersion?: () => void;
  developer: boolean;
}) {
  const { records, meta, syncing, error } = useStore();
  const [url, setUrl] = useState(meta.preferences.apiUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [importing, setImporting] = useState<unknown>(null);
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [resetBinding, setResetBinding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<string | null>(null);
  const trash = records.filter(
    (r): r is Entry => r.kind === "entry" && !!r.deletedAt,
  );
  const run = (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    void fn()
      .then(() => notify(success))
      .catch((e) => notify(e.message))
      .finally(() => setBusy(false));
  };
  return (
    <View style={{ gap: 24 }}>
      <Label size={30} bold>
        Your space, your rules.
      </Label>
      <Section title="Appearance">
        <Card>
          <Row>
            {(["system", "light", "dark"] as const).map((v) => (
              <Chip
                key={v}
                active={meta.preferences.theme === v}
                onPress={() =>
                  void preferences({ theme: v }).catch((e) => notify(e.message))
                }
              >
                {v}
              </Chip>
            ))}
          </Row>
        </Card>
      </Section>
      <Section title="Updates">
        <Card>
          <Label>Echo {VERSION} · Development preview</Label>
          <Label muted size={12}>
            {lastUpdateCheck
              ? `Last successful web check: ${new Date(lastUpdateCheck).toLocaleString()}`
              : "No update check in this session."}
          </Label>
          {Platform.OS === "web" ? (
            <Button
              icon="refresh-cw"
              onPress={() =>
                run(async () => {
                  const registration =
                    await navigator.serviceWorker?.getRegistration();
                  if (!registration)
                    throw new Error(
                      "Web updates are available in the installed production version.",
                    );
                  await registration.update();
                  setLastUpdateCheck(now());
                }, "Web update check completed. Any available update appears above with release notes.")
              }
            >
              Check for Updates
            </Button>
          ) : (
            <Label muted>
              Native release updates are not configured for this development
              build.
            </Label>
          )}
          <Button subtle onPress={() => navigate("/changelog")}>
            View release notes & full changelog
          </Button>
        </Card>
      </Section>
      <Section title="AI & privacy">
        <Card>
          <Row>
            {(["disabled", "manual", "local-only"] as const).map((v) => (
              <Chip
                key={v}
                active={meta.preferences.aiMode === v}
                onPress={() =>
                  void preferences({ aiMode: v }).catch((e) =>
                    notify(e.message),
                  )
                }
              >
                {v}
              </Chip>
            ))}
          </Row>
          <Label muted>
            Manual mode sends only entries you select and authorize. Excluded
            entries and attachments are never sent.
          </Label>
          <Button subtle icon="info" onPress={() => setInfo(!info)}>
            How your data is protected
          </Button>
          {info && (
            <Label muted>
              Your diary is stored in this device's application database. It is
              not application-encrypted. Browser storage can be cleared by the
              browser or anyone with access to this profile. Export backups
              regularly. Self-hosted sync uses server-readable content; it is
              not end-to-end encrypted. Provider credentials are configured on
              your server, never exported. Web sessions last for this tab;
              native sessions use SecureStore. Do not use a shared server unless
              you trust its administrator.
            </Label>
          )}
          {!productionBuild && !configuredApiUrl && (
            <Label size={12} muted>
              Configure AI_PROVIDER, AI_ENDPOINT, AI_MODEL and AI_API_KEY on
              your own backend. No paid key is needed for diary features.
            </Label>
          )}
        </Card>
      </Section>
      <Section
        title={
          productionBuild || configuredApiUrl
            ? "Synchronization"
            : "Self-hosted synchronization"
        }
      >
        <Card>
          {!productionBuild && !configuredApiUrl && (
            <>
              <Field
                label="Server URL (HTTPS except localhost)"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
              />
              <Button
                onPress={() =>
                  run(() => preferences({ apiUrl: url }), "Server saved")
                }
              >
                Save server URL
              </Button>
            </>
          )}
          {missingProductionEndpoint && (
            <Label muted>
              Online services are unavailable. You can still write, read, and
              back up entries on this device.
            </Label>
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="Password (at least 12 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Row>
            <Button
              disabled={busy}
              onPress={() =>
                run(async () => {
                  await authenticate(email, password, false);
                  setPassword("");
                }, "Signed in")
              }
            >
              Sign in
            </Button>
            <Button
              disabled={busy}
              onPress={() =>
                run(async () => {
                  await authenticate(email, password, true);
                  setPassword("");
                }, "Account created")
              }
            >
              Create account
            </Button>
            <Button onPress={() => run(logout, "Signed out")}>Sign out</Button>
          </Row>
          <Row>
            <Button
              primary
              icon="refresh-cw"
              disabled={syncing || busy}
              onPress={() =>
                run(synchronize, "Sync complete. Review any conflicts below.")
              }
            >
              {syncing ? "Synchronizing…" : "Sync now"}
            </Button>
            <Label size={12} muted>
              {meta.queue.length} pending records ·{" "}
              {meta.lastSync
                ? `Last sync ${new Date(meta.lastSync).toLocaleString()}`
                : "Not synchronized yet"}
            </Label>
          </Row>
          <Label size={12} muted>
            Synchronization is manual in this release. Local saving never waits
            for a server. Registration must be enabled by your server
            administrator.
          </Label>
          {meta.conflicts.map((c) => (
            <Card key={c.id}>
              <Label bold>Both devices changed this record</Label>
              <Label>
                Local:{" "}
                {c.local.kind === "entry"
                  ? c.local.content
                  : JSON.stringify(c.local)}
              </Label>
              <Label>
                Server:{" "}
                {c.remote.kind === "entry"
                  ? c.remote.content
                  : JSON.stringify(c.remote)}
              </Label>
              <Row>
                <Button
                  onPress={() =>
                    run(
                      () => resolveConflict(c.id, "local"),
                      "Local version selected",
                    )
                  }
                >
                  Keep local
                </Button>
                <Button
                  onPress={() =>
                    run(
                      () => resolveConflict(c.id, "remote"),
                      "Server version selected",
                    )
                  }
                >
                  Keep server
                </Button>
                <Button
                  onPress={() =>
                    run(
                      () => resolveConflict(c.id, "both"),
                      "Both versions preserved",
                    )
                  }
                >
                  Keep both
                </Button>
              </Row>
            </Card>
          ))}
          <Button subtle onPress={() => setResetBinding(!resetBinding)}>
            Reset sync account binding
          </Button>
          {resetBinding && (
            <Card>
              <Label>
                This preserves all local records and requeues them for a new
                account. Export a backup first. Existing server data is not
                deleted.
              </Label>
              <Button
                onPress={() =>
                  run(async () => {
                    await resetSyncBinding();
                    setResetBinding(false);
                  }, "Binding reset; local data preserved")
                }
              >
                Confirm reset binding
              </Button>
            </Card>
          )}
          <Button
            danger
            subtle
            onPress={() => setDeleteAccount(!deleteAccount)}
          >
            Delete server account
          </Button>
          {deleteAccount && (
            <Card>
              <Label>
                Delete your account and all synchronized records from this
                server? Your local copy stays on this device. Server backups may
                retain old data.
              </Label>
              <Button
                danger
                disabled={busy}
                onPress={() =>
                  run(async () => {
                    await api("/account", undefined, "DELETE");
                    await resetSyncBinding();
                    setDeleteAccount(false);
                  }, "Server account deleted")
                }
              >
                Confirm server account deletion
              </Button>
            </Card>
          )}
        </Card>
      </Section>
      <Section title="Your data">
        <Card>
          <Row>
            <Button
              icon="download"
              disabled={
                !!error?.startsWith("Local database could not be opened")
              }
              onPress={() =>
                run(
                  () =>
                    saveFile(
                      "echo-backup.json",
                      JSON.stringify(backup(), null, 2),
                    ),
                  "Backup exported",
                )
              }
            >
              Export complete backup
            </Button>
            <Button
              onPress={() =>
                run(
                  () =>
                    saveFile(
                      "echo-journal.md",
                      markdownExport(records),
                      "text/markdown",
                    ),
                  "Markdown exported",
                )
              }
            >
              Export Markdown
            </Button>
            <Button
              icon="upload"
              onPress={() =>
                run(async () => {
                  const text = await pickText();
                  if (text) {
                    const data = JSON.parse(text);
                    planImport(records, data);
                    setImporting(data);
                  }
                }, "Import preview ready")
              }
            >
              Import backup
            </Button>
          </Row>
          {importing !== null &&
            (() => {
              const p = planImport(records, importing);
              return (
                <Card>
                  <Label>
                    {p.added.length} new records · {p.identical.length}{" "}
                    unchanged · {p.conflicts.length} conflicts
                  </Label>
                  <Label muted>
                    Existing records are preserved. Only new records will be
                    imported; conflicting IDs are left untouched.
                  </Label>
                  <Row>
                    <Button
                      primary
                      onPress={() =>
                        run(async () => {
                          await importBackup(importing);
                          setImporting(null);
                        }, "New records imported; existing records preserved")
                      }
                    >
                      Import new records only
                    </Button>
                    <Button onPress={() => setImporting(null)}>Cancel</Button>
                  </Row>
                </Card>
              );
            })()}
          <Label size={12} muted>
            Backups include attachments, deleted entries and AI conversations.
            They contain private content in plaintext. Drafts, provider keys and
            sessions are excluded.
          </Label>
        </Card>
      </Section>
      <Section title={`Trash · ${trash.length}`}>
        <Card>
          {trash.length ? (
            trash.map((e) => (
              <Row key={e.id}>
                <Label style={{ flex: 1 }}>{titleOf(e)}</Label>
                <Button
                  onPress={() =>
                    run(
                      () => put({ ...e, deletedAt: null, updatedAt: now() }),
                      "Thought restored",
                    )
                  }
                >
                  Restore
                </Button>
              </Row>
            ))
          ) : (
            <Label muted>No deleted thoughts.</Label>
          )}
          <Label muted size={12}>
            Trash is retained until restored. Automatic purge and permanent
            local erasure are not implemented yet.
          </Label>
        </Card>
      </Section>
      <Section title="About Echo">
        <Card>
          <Row>
            <Icon name="radio" color="#6269f5" />
            <Label bold size={20}>
              Echo · OpenRecode
            </Label>
          </Row>
          <Label muted>Every thought deserves an echo.</Label>
          <Button icon="book-open" onPress={() => navigate("/introduction")}>
            Replay introduction
          </Button>
          <Button icon="list" onPress={() => navigate("/changelog")}>
            What's new & changelog
          </Button>
          {developerOptionsEnabled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Version ${VERSION}. Tap three times for developer options.`}
              onPress={onVersion}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Label muted size={12}>
                Version {VERSION} · Commit{" "}
                {process.env.EXPO_PUBLIC_BUILD_COMMIT || "development"}
              </Label>
            </Pressable>
          ) : (
            <Label muted size={12}>
              Version {VERSION}
            </Label>
          )}
          {developerOptionsEnabled && developer && (
            <Button icon="code" onPress={() => navigate("/developer")}>
              Developer Options
            </Button>
          )}
          <Label muted size={12}>
            AGPL-3.0-only · No trackers · No advertisements
          </Label>
        </Card>
      </Section>
    </View>
  );
}
export function Changelog() {
  return (
    <View style={{ gap: 24 }}>
      <Label bold size={30}>
        A little more Echo.
      </Label>
      {changelog.map((release) => (
        <Card key={release.version}>
          <Label bold size={22}>
            Version {release.version}
          </Label>
          <Label muted size={12}>
            {release.date} · Development preview
          </Label>
          {release.highlights.map((h) => (
            <Row key={h.title}>
              <Label size={24}>{h.icon}</Label>
              <View style={{ flex: 1 }}>
                <Label bold>{h.title}</Label>
                <Label muted>{h.description}</Label>
              </View>
            </Row>
          ))}
          <Label bold>Fixes & Improvements</Label>
          {release.fixes.map((f) => (
            <Label key={f}>• {f}</Label>
          ))}
        </Card>
      ))}
    </View>
  );
}
export function Developer({ notify }: { notify: (s: string) => void }) {
  const { records, meta } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<DeveloperIdea["category"]>("Improvement");
  const [priority, setPriority] = useState<DeveloperIdea["priority"]>("normal");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<DeveloperIdea[] | null>(null);
  const [details, setDetails] = useState(false);
  const ideas = records.filter(
    (r): r is DeveloperIdea => r.kind === "developerIdea" && !r.deletedAt,
  );
  const visible = ideas.filter(
    (i) =>
      (!status || i.status === status) &&
      `${i.title} ${i.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const run = (fn: () => Promise<unknown>) =>
    void fn().catch((e) => notify(e.message));
  return (
    <View style={{ gap: 24 }}>
      <Label bold size={30}>
        Developer Options
      </Label>
      <ServerSwitcher />
      <Card>
        <Label bold>Diagnostics · no content or secrets</Label>
        <Label>
          Version {VERSION} · Commit{" "}
          {process.env.EXPO_PUBLIC_BUILD_COMMIT || "development"}
        </Label>
        <Label>
          Records: {records.length} · Pending sync: {meta.queue.length} ·
          Conflicts: {meta.conflicts.length}
        </Label>
        <Label>
          AI mode: {meta.preferences.aiMode} · Embeddings:{" "}
          {records.filter((r) => r.kind === "embedding" && !r.deletedAt).length}
        </Label>
        <Button
          onPress={() =>
            run(() =>
              saveFile(
                "echo-diagnostics.json",
                JSON.stringify(
                  {
                    version: VERSION,
                    commit:
                      process.env.EXPO_PUBLIC_BUILD_COMMIT || "development",
                    records: records.length,
                    pending: meta.queue.length,
                    conflicts: meta.conflicts.length,
                    aiMode: meta.preferences.aiMode,
                  },
                  null,
                  2,
                ),
              ),
            )
          }
        >
          Export safe diagnostics
        </Button>
      </Card>
      <Section title="Ideas for Echo">
        <Label muted>
          These improve the application. They are separate from your personal
          diary.
        </Label>
        <Row>
          {ideaStatuses.map((s) => (
            <Chip
              key={s}
              active={status === s}
              onPress={() => setStatus(status === s ? "" : s)}
            >
              {s} · {ideas.filter((i) => i.status === s).length}
            </Chip>
          ))}
        </Row>
        <Card>
          <Field label="Idea title" value={title} onChangeText={setTitle} />
          <Field
            label="Description / reproduction steps"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Row>
            {(
              [
                "Feature",
                "Improvement",
                "Bug Fix",
                "UI/UX",
                "Performance",
                "Other",
              ] as const
            ).map((c) => (
              <Chip
                key={c}
                active={category === c}
                onPress={() => setCategory(c)}
              >
                {c}
              </Chip>
            ))}
          </Row>
          <Row>
            {(["low", "normal", "high"] as const).map((p) => (
              <Chip
                key={p}
                active={priority === p}
                onPress={() => setPriority(p)}
              >
                {p}
              </Chip>
            ))}
          </Row>
          <Button
            primary
            disabled={!title.trim()}
            onPress={() =>
              run(async () => {
                const existing = ideas.find((i) => i.id === editing);
                await put(
                  developerIdeaSchema.parse({
                    ...(existing || stamp()),
                    kind: "developerIdea",
                    title,
                    description,
                    category,
                    priority,
                    status: existing?.status || "Pending",
                    implementation: existing?.implementation || "",
                    updatedAt: now(),
                  }),
                );
                setTitle("");
                setDescription("");
                setEditing(null);
              })
            }
          >
            {editing ? "Save idea" : "Record developer idea"}
          </Button>
        </Card>
        <Field
          placeholder="Search developer ideas"
          value={query}
          onChangeText={setQuery}
        />
        <Row>
          <Button
            onPress={() =>
              run(() =>
                saveFile(
                  "echo-developer-ideas.json",
                  JSON.stringify(
                    {
                      schemaVersion: 1,
                      application: "it.openrecode.echo",
                      exportedAt: now(),
                      ideas,
                    },
                    null,
                    2,
                  ),
                ),
              )
            }
          >
            Export Ideas JSON
          </Button>
          <Button
            onPress={() =>
              run(async () => {
                const text = await pickText();
                if (!text) return;
                const data = JSON.parse(text);
                if (
                  data.schemaVersion !== 1 ||
                  data.application !== "it.openrecode.echo" ||
                  !Array.isArray(data.ideas)
                )
                  throw new Error("Incompatible Ideas export");
                setIncoming(
                  data.ideas.map((i: unknown) => developerIdeaSchema.parse(i)),
                );
              })
            }
          >
            Import Ideas
          </Button>
          <Button
            disabled={!selected.length}
            danger
            onPress={() =>
              run(async () => {
                await putMany(
                  ideas
                    .filter((i) => selected.includes(i.id))
                    .map((i) => ({ ...i, deletedAt: now(), updatedAt: now() })),
                );
                setSelected([]);
              })
            }
          >
            Delete selected ({selected.length})
          </Button>
        </Row>
        {incoming && (
          <Card>
            <Label>
              {
                incoming.filter((i) => !records.some((r) => r.id === i.id))
                  .length
              }{" "}
              new ideas. Existing IDs will be preserved.
            </Label>
            <Button
              onPress={() =>
                run(async () => {
                  await putMany(
                    incoming.filter((i) => !records.some((r) => r.id === i.id)),
                  );
                  setIncoming(null);
                })
              }
            >
              Import new ideas only
            </Button>
            <Button onPress={() => setIncoming(null)}>Cancel</Button>
          </Card>
        )}
        {visible.map((i) => (
          <Card key={i.id}>
            <Row>
              <Chip
                active={selected.includes(i.id)}
                onPress={() =>
                  setSelected(
                    selected.includes(i.id)
                      ? selected.filter((x) => x !== i.id)
                      : [...selected, i.id],
                  )
                }
              >
                {selected.includes(i.id) ? "✓" : "○"}
              </Chip>
              <Label bold size={18}>
                {i.title}
              </Label>
              <Chip>{i.category}</Chip>
              <Label muted size={12}>
                {i.priority} priority
              </Label>
            </Row>
            <Label>{i.description}</Label>
            <Label muted size={11}>
              {i.createdAt} · Modified {i.updatedAt}
            </Label>
            <Row>
              {ideaStatuses.map((s) => (
                <Chip
                  key={s}
                  active={i.status === s}
                  onPress={() =>
                    run(() => put(updateDeveloperIdea(i, { status: s })))
                  }
                >
                  {s}
                </Chip>
              ))}
            </Row>
            <Field
              label="Implementation references (commit / version / changelog)"
              defaultValue={i.implementation}
              onEndEditing={(e) =>
                run(() =>
                  put({
                    ...i,
                    implementation: e.nativeEvent.text,
                    updatedAt: now(),
                  }),
                )
              }
            />
            <Row>
              <Button
                onPress={() => {
                  setEditing(i.id);
                  setTitle(i.title);
                  setDescription(i.description);
                  setCategory(i.category);
                  setPriority(i.priority);
                }}
              >
                Edit
              </Button>
              <Button
                onPress={() =>
                  run(() =>
                    put({
                      ...i,
                      ...stamp(),
                      title: `${i.title} (copy)`,
                      status: "Pending",
                      implementation: "",
                    }),
                  )
                }
              >
                Duplicate
              </Button>
              <Button danger onPress={() => run(() => remove(i))}>
                Delete
              </Button>
            </Row>
          </Card>
        ))}
      </Section>
    </View>
  );
}
