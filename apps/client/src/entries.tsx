import { MotionPressable as Pressable } from "./motion";
// SPDX-License-Identifier: AGPL-3.0-only
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, Linking } from "react-native";
import {
  newEntry,
  editEntry,
  titleOf,
  stamp,
  now,
  uid,
  relationshipTypes,
  keywordConnections,
  type Entry,
  type EchoRecord,
  type Project,
  type Relationship,
} from "@echo/core";
import { useStore, put, putMany, remove, preferences } from "./store";
import {
  Button,
  Card,
  Chip,
  Field,
  Label,
  Row,
  Section,
  Icon,
  useTheme,
  Empty,
} from "./ui";
import { pickAttachment, saveAttachment, saveFile } from "./files";
export type Navigate = (path: string) => void;
export function EntryCard({
  entry,
  onOpen,
}: {
  entry: Entry;
  onOpen: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${titleOf(entry)}`}
      onPress={onOpen}
      style={({ pressed }) => ({
        opacity: 1,
        flex: 1,
        minWidth: 240,
        maxWidth: 540,
      })}
    >
      <Card style={{ height: "100%", minHeight: 170 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Chip>{entry.type}</Chip>
          <Row>
            {entry.favorite && <Icon name="star" size={14} color={t.accent} />}
            <Label size={11} muted>
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Label>
          </Row>
        </Row>
        <Label size={17} bold>
          {titleOf(entry)}
        </Label>
        <Text
          numberOfLines={3}
          style={{ color: t.muted, fontSize: 13, lineHeight: 21 }}
        >
          {entry.content}
        </Text>
        <Row>
          {entry.tags.slice(0, 3).map((tag) => (
            <Label key={tag} size={11} style={{ color: t.accent }}>
              #{tag}
            </Label>
          ))}
          {entry.excludeAI && <Icon name="shield" size={13} />}
        </Row>
      </Card>
    </Pressable>
  );
}
export function Composer({
  navigate,
  notify,
}: {
  navigate: Navigate;
  notify: (s: string) => void;
}) {
  const sharedParams = useLocalSearchParams<{
    title?: string;
    text?: string;
    url?: string;
  }>();
  const sharedText = [sharedParams.title, sharedParams.text, sharedParams.url]
    .filter((v) => typeof v === "string")
    .join("\n\n")
    .slice(0, 200000);
  const [sharedDismissed, setSharedDismissed] = useState(false);
  const { meta } = useStore();
  const p = meta.preferences;
  const [content, setContent] = useState(p.draft);
  const [title, setTitle] = useState(p.draftTitle);
  const [tags, setTags] = useState(p.draftTags);
  const [type, setType] = useState(p.draftType);
  const [mood, setMood] = useState(p.draftMood);
  const [excludeAI, setExcludeAI] = useState(p.draftExcludeAI);
  const [attachments, setAttachments] = useState<Entry["attachments"]>(
    p.draftAttachments as Entry["attachments"],
  );
  const [status, setStatus] = useState("Draft restored");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  useEffect(() => {
    if (saving.current) return;
    setStatus("Saving draft…");
    void preferences({
      draft: content,
      draftTitle: title,
      draftTags: tags,
      draftAttachments: attachments,
      draftType: type,
      draftMood: mood,
      draftExcludeAI: excludeAI,
    })
      .then(() => setStatus("Draft saved on this device"))
      .catch(() =>
        setStatus("Draft could not be saved — keep this screen open"),
      );
  }, [content, title, tags, attachments, type, mood, excludeAI]);
  const save = async () => {
    if (!content.trim() && !attachments.length) return;
    saving.current = true;
    setBusy(true);
    try {
      const e = newEntry(content, {
        title,
        type,
        mood,
        excludeAI,
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        attachments,
      });
      await put(e);
      await preferences({
        draft: "",
        draftTitle: "",
        draftTags: "",
        draftAttachments: [],
        draftType: "Thought",
        draftMood: "",
        draftExcludeAI: false,
      });
      notify("Thought saved on this device");
      navigate(`/entry/${e.id}`);
    } catch (e) {
      notify(String(e));
      saving.current = false;
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 20 }}>
      {!!sharedText && !sharedDismissed && (
        <Card>
          <Label bold>Shared with Echo</Label>
          <Label>{sharedText}</Label>
          <Row>
            <Button
              onPress={() => {
                setContent((previous) =>
                  previous
                    ? `${previous}\n\n${sharedText}`.slice(0, 200000)
                    : sharedText,
                );
                setSharedDismissed(true);
              }}
            >
              Add to draft
            </Button>
            <Button subtle onPress={() => setSharedDismissed(true)}>
              Dismiss shared content
            </Button>
          </Row>
        </Card>
      )}
      <Row style={{ justifyContent: "space-between" }}>
        <Label size={28} bold>
          A little space to think.
        </Label>
        <Label size={12} muted>
          {status}
        </Label>
      </Row>
      <Card>
        <Field
          placeholder="A title, if you like"
          value={title}
          onChangeText={setTitle}
        />
        <Field
          testID="thought-content"
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          multiline
          style={{
            minHeight: 250,
            fontSize: 18,
            lineHeight: 29,
            borderWidth: 0,
          }}
        />
        <Row>
          <Button
            icon="paperclip"
            onPress={() =>
              void pickAttachment()
                .then((a) => a && setAttachments([...attachments, a]))
                .catch((e) => notify(e.message))
            }
          >
            Attach file
          </Button>
          <Label muted size={12}>
            Plain text, Markdown, links & checklists
          </Label>
        </Row>
        {attachments.map((a) => (
          <Row key={a.id}>
            <Icon name="file" />
            <Label>{a.name}</Label>
            <Button
              subtle
              onPress={() =>
                setAttachments(attachments.filter((x) => x.id !== a.id))
              }
            >
              Remove
            </Button>
          </Row>
        ))}
      </Card>
      <Row>
        {[
          "Thought",
          "Idea",
          "Journal",
          "Question",
          "Project",
          "Observation",
          "Task",
          "Note",
          "Reflection",
        ].map((v) => (
          <Chip key={v} active={type === v} onPress={() => setType(v)}>
            {v}
          </Chip>
        ))}
      </Row>
      <Row>
        <Field
          label="Tags, separated by commas"
          value={tags}
          onChangeText={setTags}
        />
        <Field
          label="Mood (optional, your own words)"
          value={mood}
          onChangeText={setMood}
        />
      </Row>
      <Chip active={excludeAI} onPress={() => setExcludeAI(!excludeAI)}>
        {excludeAI
          ? "Private · excluded from AI"
          : "Allow selected AI processing when requested"}
      </Chip>
      <Row>
        <Button
          primary
          icon="check"
          disabled={busy || (!content.trim() && !attachments.length)}
          onPress={() => void save()}
        >
          Save thought
        </Button>
        <Button subtle onPress={() => navigate("/journal")}>
          Keep draft & leave
        </Button>
      </Row>
    </View>
  );
}
export function EntryDetail({
  id,
  navigate,
  notify,
}: {
  id: string;
  navigate: Navigate;
  notify: (s: string) => void;
}) {
  const { records } = useStore();
  const entry = records.find(
    (r): r is Entry => r.kind === "entry" && r.id === id,
  );
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("");
  const [linkTo, setLinkTo] = useState("");
  const [linkType, setLinkType] =
    useState<(typeof relationshipTypes)[number]>("Related to");
  const [history, setHistory] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null);
  const [editReady, setEditReady] = useState(false);
  const t = useTheme();
  useEffect(() => {
    if (entry && !entry.deletedAt)
      void put({ ...entry, lastViewedAt: now() }).catch(() => {});
  }, [id]);
  useEffect(() => {
    setEditReady(false);
    if (entry)
      void hydrateEditingDraft(id).then(() => {
        const draft = localDrafts.get(id);
        if (draft) {
          setText(draft.text);
          setTitle(draft.title);
          setTags(draft.tags);
          setType(draft.type);
          setEditing(true);
        }
        setEditReady(true);
      });
  }, [id]);
  if (!entry)
    return (
      <Empty
        title="Thought not found"
        detail="It may be on another device, or this link may be incomplete."
        action={
          <Button onPress={() => navigate("/journal")}>Back to journal</Button>
        }
      />
    );
  const e = entry;
  const entries = records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt,
  );
  const projects = records.filter(
    (r): r is Project => r.kind === "project" && !r.deletedAt,
  );
  const links = records.filter(
    (r): r is Relationship =>
      r.kind === "relationship" &&
      !r.deletedAt &&
      (r.from === id || r.to === id),
  );
  const collections = records.filter(
    (r) => r.kind === "collection" && !r.deletedAt,
  );
  const suggestions = keywordConnections(e, entries).filter(
    (s) => !links.some((l) => l.from === s.entry.id || l.to === s.entry.id),
  );
  const update = (patch: Partial<Entry>) =>
    void put(editEntry(e, patch)).catch((err) => notify(err.message));
  const connect = async (target: string) => {
    if (!target) return;
    if (
      links.some(
        (l) =>
          (l.from === id && l.to === target) ||
          (l.to === id && l.from === target),
      )
    ) {
      notify("These thoughts are already connected");
      return;
    }
    await put({
      ...stamp(),
      kind: "relationship",
      from: id,
      to: target,
      type: linkType,
      source: "manual",
      explanation: "",
    });
    setLinkTo("");
  };
  const startEdit = () => {
    setText(e.content);
    setTitle(e.title);
    setTags(e.tags.join(", "));
    setType(e.type);
    setEditing(true);
  };
  return (
    <View style={{ gap: 22 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Button subtle icon="arrow-left" onPress={() => navigate("/journal")}>
          Journal
        </Button>
        <Row>
          <Button icon="star" onPress={() => update({ favorite: !e.favorite })}>
            {e.favorite ? "Favorited" : "Favorite"}
          </Button>
          <Button icon="more-horizontal" onPress={() => setHistory(!history)}>
            History
          </Button>
        </Row>
      </Row>
      {e.deletedAt ? (
        <Card>
          <Label>
            This entry is in Trash. It remains recoverable until you explicitly
            restore it.
          </Label>
          <Button
            onPress={() =>
              void put({ ...e, deletedAt: null, updatedAt: now() })
            }
          >
            Restore thought
          </Button>
        </Card>
      ) : null}
      <Row>
        <Chip active>{e.type}</Chip>
        <Label muted size={12}>
          {new Date(e.createdAt).toLocaleString()}
        </Label>
        {e.excludeAI && <Chip>Excluded from AI</Chip>}
      </Row>
      {editing ? (
        <Card>
          <Label size={12} muted>
            Editing copy · save to create a revision. Draft persists on this
            device.
          </Label>
          <Field
            label="Title"
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              persistEdit(id, { title: v, text, tags, type });
            }}
          />
          <Field
            label="Thought"
            value={text}
            onChangeText={(v) => {
              setText(v);
              persistEdit(id, { title, text: v, tags, type });
            }}
            multiline
            style={{ minHeight: 240 }}
          />
          <Field
            label="Tags"
            value={tags}
            onChangeText={(v) => {
              setTags(v);
              persistEdit(id, { title, text, tags: v, type });
            }}
          />
          <Field
            label="Entry type (custom types supported)"
            value={type}
            onChangeText={(v) => {
              setType(v);
              persistEdit(id, { title, text, tags, type: v });
            }}
          />
          <Row>
            <Button
              primary
              onPress={() =>
                void (async () => {
                  await put(
                    editEntry(e, {
                      content: text,
                      title,
                      type: type || "Thought",
                      tags: tags
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }),
                  );
                  await clearEdit(id);
                  setEditing(false);
                  notify("Revision saved");
                })().catch((err) => notify(err.message))
              }
            >
              Save changes
            </Button>
            <Button
              onPress={() => {
                void clearEdit(id);
                setEditing(false);
              }}
            >
              Discard editing copy
            </Button>
          </Row>
        </Card>
      ) : (
        <Card>
          <Label size={30} bold>
            {titleOf(e)}
          </Label>
          <Label size={16} style={{ lineHeight: 29 }}>
            {e.content}
          </Label>
          <Row>
            {e.tags.map((tag) => (
              <Chip key={tag}>#{tag}</Chip>
            ))}
          </Row>
          <Row>
            <Button icon="edit-3" onPress={startEdit}>
              Edit thought
            </Button>
            <Button icon="zap" onPress={() => navigate(`/develop/${id}`)}>
              Develop
            </Button>
            <Button
              icon="git-branch"
              onPress={() => navigate(`/evolution/${id}`)}
            >
              Evolution
            </Button>
          </Row>
        </Card>
      )}
      {e.attachments.length > 0 && (
        <Section title="Attachments">
          {e.attachments.map((a) => (
            <Card key={a.id}>
              {a.mime.startsWith("image/") && (
                <Image
                  source={{ uri: a.uri }}
                  style={{ width: "100%", height: 220, resizeMode: "contain" }}
                />
              )}
              <Label>
                {a.name} · {Math.round(a.size / 1024)} KB
              </Label>
              <Button
                icon="download"
                onPress={() =>
                  void saveAttachment(a).catch((err) => notify(err.message))
                }
              >
                Export file
              </Button>
            </Card>
          ))}
        </Section>
      )}
      <Section title="Organization">
        <Card>
          <Row>
            <Chip
              active={e.pinned}
              onPress={() => update({ pinned: !e.pinned })}
            >
              Pinned
            </Chip>
            <Chip
              active={e.archived}
              onPress={() => update({ archived: !e.archived })}
            >
              Archived
            </Chip>
            <Chip
              active={e.excludeAI}
              onPress={() => update({ excludeAI: !e.excludeAI })}
            >
              Exclude from AI
            </Chip>
          </Row>
          <Label muted size={12}>
            Project
          </Label>
          <Row>
            <Chip
              active={!e.projectId}
              onPress={() => update({ projectId: null })}
            >
              No project
            </Chip>
            {projects.map((p) => (
              <Chip
                key={p.id}
                active={e.projectId === p.id}
                onPress={() => update({ projectId: p.id })}
              >
                {p.name}
              </Chip>
            ))}
          </Row>
          <Label muted size={12}>
            Collections
          </Label>
          <Row>
            {collections.map((c) => (
              <Chip
                key={c.id}
                active={e.collectionIds.includes(c.id)}
                onPress={() =>
                  update({
                    collectionIds: e.collectionIds.includes(c.id)
                      ? e.collectionIds.filter((x) => x !== c.id)
                      : [...e.collectionIds, c.id],
                  })
                }
              >
                {c.kind === "collection" ? c.name : ""}
              </Chip>
            ))}
            {!collections.length && (
              <Label muted>Create collections in Explore.</Label>
            )}
          </Row>
        </Card>
      </Section>
      <Section title="Connected thoughts">
        <Card>
          {links.map((l) => {
            const other = entries.find(
              (x) => x.id === (l.from === id ? l.to : l.from),
            );
            return (
              <Row key={l.id} style={{ justifyContent: "space-between" }}>
                <Button
                  subtle
                  icon="link"
                  onPress={() => navigate(`/entry/${other?.id}`)}
                >
                  {l.type}: {other ? titleOf(other) : "Unavailable entry"}
                </Button>
                <Button subtle danger onPress={() => void remove(l)}>
                  Remove link
                </Button>
              </Row>
            );
          })}
          {!links.length && (
            <Label muted>
              No connections yet. Link two thoughts to start a thread.
            </Label>
          )}
          <Label size={12} muted>
            Choose another thought
          </Label>
          <Row>
            {entries
              .filter((x) => x.id !== id)
              .slice(0, 30)
              .map((x) => (
                <Chip
                  key={x.id}
                  active={linkTo === x.id}
                  onPress={() => setLinkTo(x.id)}
                >
                  {titleOf(x).slice(0, 35)}
                </Chip>
              ))}
          </Row>
          <Row>
            {relationshipTypes.map((v) => (
              <Chip
                key={v}
                active={linkType === v}
                onPress={() => setLinkType(v)}
              >
                {v}
              </Chip>
            ))}
          </Row>
          <Button
            disabled={!linkTo}
            icon="link"
            onPress={() =>
              void connect(linkTo).catch((err) => notify(err.message))
            }
          >
            Connect thoughts
          </Button>
        </Card>
      </Section>
      {suggestions.length > 0 && (
        <Section title="Possible connections · keyword match">
          {suggestions.map((s) => (
            <Card key={s.entry.id}>
              <Label bold>{titleOf(s.entry)}</Label>
              <Label muted>{s.explanation}</Label>
              <Button onPress={() => void connect(s.entry.id)}>
                Confirm connection
              </Button>
            </Card>
          ))}
        </Section>
      )}
      {history && (
        <Section title="Version history">
          <Label muted>
            The original text is preserved. Restoring creates a new revision.
          </Label>
          {[...e.revisions].reverse().map((r) => (
            <Card key={r.id}>
              <Row style={{ justifyContent: "space-between" }}>
                <Label bold>
                  {new Date(r.at).toLocaleString()} · {r.author}
                </Label>
                <Button
                  onPress={() =>
                    setSelectedRevision(selectedRevision === r.id ? null : r.id)
                  }
                >
                  Compare
                </Button>
              </Row>
              <Label>{r.title}</Label>
              <Label>{r.content}</Label>
              {selectedRevision === r.id && (
                <View style={{ gap: 10 }}>
                  <Label bold>Current content</Label>
                  <Label>{e.content}</Label>
                </View>
              )}
              <Button
                onPress={() => update({ title: r.title, content: r.content })}
              >
                Restore this revision
              </Button>
            </Card>
          ))}
          <Card>
            <Label bold>Original captured content</Label>
            <Label>{e.originalContent}</Label>
          </Card>
        </Section>
      )}
      <Row>
        <Button
          icon="copy"
          onPress={() =>
            void put(
              newEntry(e.content, {
                title: e.title,
                tags: e.tags,
                type: e.type,
                excludeAI: e.excludeAI,
                attachments: e.attachments,
              }),
            ).then(() => notify("Duplicate saved"))
          }
        >
          Duplicate
        </Button>
        <Button
          icon="download"
          onPress={() =>
            void saveFile(
              `echo-${e.id}.md`,
              `# ${titleOf(e)}\n\n${e.content}`,
              "text/markdown",
            ).catch((err) => notify(err.message))
          }
        >
          Export Markdown
        </Button>
        <Button danger icon="trash-2" onPress={() => setDeleting(!deleting)}>
          Move to Trash
        </Button>
      </Row>
      {deleting && (
        <Card>
          <Label>
            Move this thought to Trash? You can restore it from Settings.
          </Label>
          <Row>
            <Button
              danger
              onPress={() => void remove(e).then(() => navigate("/journal"))}
            >
              Confirm move to Trash
            </Button>
            <Button onPress={() => setDeleting(false)}>Cancel</Button>
          </Row>
        </Card>
      )}
    </View>
  );
}
// Recovered from persistent metadata during application startup, never synced as notes.
const localDrafts = new Map<
  string,
  { title: string; text: string; tags: string; type: string }
>();
import { getEditDraft, saveEditDraft, deleteEditDraft } from "./drafts";
function persistEdit(
  id: string,
  draft: { title: string; text: string; tags: string; type: string },
) {
  localDrafts.set(id, draft);
  void saveEditDraft(id, draft);
}
async function clearEdit(id: string) {
  localDrafts.delete(id);
  await deleteEditDraft(id);
}
export async function hydrateEditingDraft(id: string) {
  const draft = await getEditDraft(id);
  if (draft) localDrafts.set(id, draft);
}
