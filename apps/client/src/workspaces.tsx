import { OnDeviceReflection } from "./OnDeviceReflection";
import { MotionPressable as Pressable } from "./motion";
// SPDX-License-Identifier: AGPL-3.0-only
import React, { useState } from "react";
import { View } from "react-native";
import {
  stamp,
  now,
  uid,
  titleOf,
  newEntry,
  search,
  type Entry,
  type Project,
  type EchoRecord,
  type Relationship,
} from "@echo/core";
import { useStore, put, remove, backup } from "./store";
import {
  Button,
  Card,
  Chip,
  Field,
  Label,
  Row,
  Section,
  Empty,
  Icon,
  useTheme,
} from "./ui";
import { EntryCard, type Navigate } from "./entries";
import { Graph } from "./Graph";
import { saveFile } from "./files";
export function Projects({
  id,
  navigate,
  notify,
}: {
  id?: string;
  navigate: Navigate;
  notify: (s: string) => void;
}) {
  const { records } = useStore();
  const projects = records.filter(
    (r): r is Project => r.kind === "project" && !r.deletedAt,
  );
  const entries = records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [task, setTask] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const project = projects.find((p) => p.id === id);
  const update = (patch: Partial<Project>) =>
    project &&
    void put({ ...project, ...patch, updatedAt: now() }).catch((e) =>
      notify(e.message),
    );
  if (id && !project)
    return (
      <Empty
        title="Project not found"
        detail="Return to your project directory."
        action={<Button onPress={() => navigate("/projects")}>Projects</Button>}
      />
    );
  if (project) {
    const linked = entries.filter((e) => e.projectId === id);
    return (
      <View style={{ gap: 24 }}>
        <Button subtle icon="arrow-left" onPress={() => navigate("/projects")}>
          All projects
        </Button>
        <Label size={32} bold>
          {project.name}
        </Label>
        <Card>
          <Field
            label="Project name"
            defaultValue={project.name}
            onEndEditing={(e) =>
              e.nativeEvent.text.trim() && update({ name: e.nativeEvent.text })
            }
          />
          <Field
            label="Description / decisions / open questions"
            defaultValue={project.description}
            multiline
            onEndEditing={(e) => update({ description: e.nativeEvent.text })}
          />
          <Row>
            {[
              "Concept",
              "Exploring",
              "Planned",
              "In progress",
              "Paused",
              "Completed",
              "Archived",
            ].map((s) => (
              <Chip
                key={s}
                active={project.status === s}
                onPress={() => update({ status: s as Project["status"] })}
              >
                {s}
              </Chip>
            ))}
          </Row>
        </Card>
        <Section title="Tasks">
          <Card>
            {project.tasks.map((t) => (
              <Row key={t.id}>
                <Chip
                  active={t.done}
                  onPress={() =>
                    update({
                      tasks: project.tasks.map((v) =>
                        v.id === t.id
                          ? {
                              ...v,
                              done: !v.done,
                              completedAt: !v.done ? now() : null,
                            }
                          : v,
                      ),
                    })
                  }
                >
                  {t.done ? "✓ Done" : "○ To do"}
                </Chip>
                <Label
                  style={{
                    flex: 1,
                    textDecorationLine: t.done ? "line-through" : "none",
                  }}
                >
                  {t.title}
                  {t.due ? ` · ${t.due}` : ""} · {t.priority}
                </Label>
                <Button
                  danger
                  subtle
                  onPress={() =>
                    update({
                      tasks: project.tasks.filter((v) => v.id !== t.id),
                    })
                  }
                >
                  Remove
                </Button>
              </Row>
            ))}
            <Field
              label="New task"
              placeholder="A small next step…"
              value={task}
              onChangeText={setTask}
            />
            <Row>
              <Field
                label="Due date (optional YYYY-MM-DD)"
                value={due}
                onChangeText={setDue}
              />
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
              disabled={
                !task.trim() || (!!due && !/^\d{4}-\d{2}-\d{2}$/.test(due))
              }
              icon="plus"
              onPress={() => {
                update({
                  tasks: [
                    ...project.tasks,
                    {
                      id: uid(),
                      title: task,
                      done: false,
                      priority,
                      due,
                      completedAt: null,
                    },
                  ],
                });
                setTask("");
                setDue("");
              }}
            >
              Add task
            </Button>
          </Card>
        </Section>
        <Section title="Project thoughts">
          <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
            {linked.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onOpen={() => navigate(`/entry/${e.id}`)}
              />
            ))}
          </View>
          {!linked.length && (
            <Card>
              <Label muted>
                Link an existing thought below, or assign it from its editor.
              </Label>
            </Card>
          )}
          <Row>
            {entries
              .filter((e) => !e.projectId)
              .slice(0, 20)
              .map((e) => (
                <Chip
                  key={e.id}
                  onPress={() =>
                    void put({ ...e, projectId: project.id, updatedAt: now() })
                  }
                >
                  + {titleOf(e).slice(0, 40)}
                </Chip>
              ))}
          </Row>
        </Section>
        <Button
          icon="download"
          onPress={() => {
            const ids = new Set(linked.map((e) => e.id));
            const data = backup();
            data.records = data.records.filter(
              (r) =>
                r.id === project.id ||
                ids.has(r.id) ||
                (r.kind === "relationship" &&
                  ids.has(r.from) &&
                  ids.has(r.to)) ||
                (r.kind === "conversation" && r.entryId && ids.has(r.entryId)),
            );
            void saveFile(
              `echo-project-${project.id}.json`,
              JSON.stringify(data, null, 2),
            );
          }}
        >
          Export project
        </Button>
        <Button danger onPress={() => update({ status: "Archived" })}>
          Archive project
        </Button>
      </View>
    );
  }
  return (
    <View style={{ gap: 24 }}>
      <Row>
        <Label size={30} bold>
          Give your ideas a direction.
        </Label>
      </Row>
      <Label muted>
        Small beginnings, room to grow. Your projects bring related thoughts
        together.
      </Label>
      <Card>
        <Row>
          <Field label="New project name" value={name} onChangeText={setName} />
          <Field
            label="A short description"
            value={description}
            onChangeText={setDescription}
          />
          <Button
            primary
            disabled={!name.trim()}
            icon="plus"
            onPress={() => {
              const p: Project = {
                ...stamp(),
                kind: "project",
                name: name.trim(),
                description,
                color: "#6269f5",
                status: "Concept",
                tasks: [],
              };
              void put(p)
                .then(() => {
                  setName("");
                  setDescription("");
                  navigate(`/projects/${p.id}`);
                })
                .catch((e) => notify(e.message));
            }}
          >
            Create project
          </Button>
        </Row>
      </Card>
      <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        {projects
          .filter((p) => p.status !== "Archived")
          .map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              onPress={() => navigate(`/projects/${p.id}`)}
              style={{ minWidth: 260, flex: 1 }}
            >
              <Card>
                <Icon name="box" color={p.color} />
                <Label size={21} bold>
                  {p.name}
                </Label>
                <Label muted>{p.description || "A new possibility."}</Label>
                <Row>
                  <Chip>{p.status}</Chip>
                  <Label muted size={12}>
                    {entries.filter((e) => e.projectId === p.id).length}{" "}
                    thoughts · {p.tasks.filter((t) => t.done).length}/
                    {p.tasks.length} tasks
                  </Label>
                </Row>
              </Card>
            </Pressable>
          ))}
      </View>
      <Section title="Archived projects">
        <Row>
          {projects
            .filter((p) => p.status === "Archived")
            .map((p) => (
              <Button key={p.id} onPress={() => navigate(`/projects/${p.id}`)}>
                {p.name}
              </Button>
            ))}
        </Row>
      </Section>
    </View>
  );
}
export function Explore({
  navigate,
  dark,
  notify,
}: {
  navigate: Navigate;
  dark: boolean;
  notify: (s: string) => void;
}) {
  const { records } = useStore();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [collection, setCollection] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const entries = records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt && !r.archived,
  );
  const links = records.filter(
    (r): r is Relationship => r.kind === "relationship" && !r.deletedAt,
  );
  const collections = records.filter(
    (r) => r.kind === "collection" && !r.deletedAt,
  );
  const tags = [...new Set(entries.flatMap((e) => e.tags))];
  const visible = search(entries, query, {
    tag,
    collectionId: collection,
    from: date,
  });
  return (
    <View style={{ gap: 24 }}>
      <Label bold size={30}>
        Follow the thread.
      </Label>
      <Label muted>
        One thought leads to another. See the connections you've made.
      </Label>
      <Row>
        <Field
          placeholder="Find a thought in your graph…"
          value={query}
          onChangeText={setQuery}
        />
        <Field label="Since YYYY-MM-DD" value={date} onChangeText={setDate} />
      </Row>
      <Row>
        <Chip active={!tag} onPress={() => setTag("")}>
          All topics
        </Chip>
        {tags.map((t) => (
          <Chip key={t} active={tag === t} onPress={() => setTag(t)}>
            {t}
          </Chip>
        ))}
      </Row>
      <Card>
        {visible.length ? (
          <Graph
            entries={visible}
            links={links}
            onOpen={(id) => navigate(`/entry/${id}`)}
            dark={dark}
          />
        ) : (
          <Empty
            title="Every connection starts somewhere"
            detail="Capture a few thoughts, then link them from their detail pages."
          />
        )}
      </Card>
      <Section title="Collections">
        <Card>
          <Row>
            <Field
              placeholder="New collection"
              value={name}
              onChangeText={setName}
            />
            <Button
              icon="plus"
              disabled={!name.trim()}
              onPress={() =>
                void put({ ...stamp(), kind: "collection", name: name.trim() })
                  .then(() => setName(""))
                  .catch((e) => notify(e.message))
              }
            >
              Create
            </Button>
          </Row>
          <Row>
            <Chip active={!collection} onPress={() => setCollection("")}>
              All collections
            </Chip>
            {collections.map((c) => (
              <Row key={c.id}>
                <Chip
                  active={collection === c.id}
                  onPress={() => setCollection(c.id)}
                >
                  {c.kind === "collection" ? c.name : ""}
                </Chip>
                <Button danger subtle onPress={() => void remove(c)}>
                  Delete collection
                </Button>
              </Row>
            ))}
          </Row>
        </Card>
      </Section>
      <Section title="Explore as a list">
        <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
          {visible.slice(0, 60).map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              onOpen={() => navigate(`/entry/${e.id}`)}
            />
          ))}
        </View>
      </Section>
    </View>
  );
}
export function Evolution({
  id,
  navigate,
}: {
  id: string;
  navigate: Navigate;
}) {
  const { records } = useStore();
  const entry = records.find(
    (r): r is Entry => r.kind === "entry" && r.id === id && !r.deletedAt,
  );
  if (!entry)
    return (
      <Empty
        title="Thought not found"
        detail="Choose a thought from the Journal."
      />
    );
  const links = records.filter(
    (r): r is Relationship =>
      r.kind === "relationship" &&
      !r.deletedAt &&
      (r.from === id || r.to === id),
  );
  const linkedIds = new Set(
    links
      .filter((l) => l.type === "Continuation of" || l.type === "Inspired by")
      .flatMap((l) => [l.from, l.to]),
  );
  const stages = records
    .filter(
      (r): r is Entry =>
        r.kind === "entry" &&
        !r.deletedAt &&
        (r.id === id || linkedIds.has(r.id)),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return (
    <View style={{ gap: 20 }}>
      <Label size={30} bold>
        A thought, becoming.
      </Label>
      <Label muted>
        Recorded history and your confirmed “Continuation of” / “Inspired by”
        links. No inferred milestones.
      </Label>
      {stages.map((e, i) => (
        <Card key={e.id}>
          <Row>
            <Chip>{String(i + 1).padStart(2, "0")}</Chip>
            <Label muted>{new Date(e.createdAt).toLocaleString()}</Label>
          </Row>
          <Label bold size={20}>
            {titleOf(e)}
          </Label>
          <Label>{e.content}</Label>
          <Label muted size={12}>
            {e.revisions.length} saved revisions
          </Label>
          <Button
            icon="arrow-up-right"
            onPress={() => navigate(`/entry/${e.id}`)}
          >
            Open thought & revisions
          </Button>
        </Card>
      ))}
    </View>
  );
}
export function Reflect({
  navigate,
  notify,
}: {
  navigate: Navigate;
  notify: (s: string) => void;
}) {
  const { records } = useStore();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [reflection, setReflection] = useState("");
  const entries = records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt,
  );
  const since = new Date(
    Date.now() - (period === "week" ? 7 : 30) * 86400000,
  ).toISOString();
  const selected = entries.filter((e) => e.createdAt >= since);
  const tags = new Map<string, number>();
  selected.forEach((e) =>
    e.tags.forEach((t) => tags.set(t, (tags.get(t) || 0) + 1)),
  );
  const old = [...entries]
    .filter((e) => e.createdAt < since && !e.archived)
    .sort((a, b) =>
      (a.lastViewedAt || a.createdAt).localeCompare(
        b.lastViewedAt || b.createdAt,
      ),
    )
    .slice(0, 3);
  return (
    <View style={{ gap: 24 }}>
      <Label size={30} bold>
        Make room to look back.
      </Label>
      <OnDeviceReflection entries={selected} />
      <Label muted>
        No streaks. No pressure. Just a moment with your own thoughts.
      </Label>
      <Row>
        <Chip active={period === "week"} onPress={() => setPeriod("week")}>
          Last 7 days
        </Chip>
        <Chip active={period === "month"} onPress={() => setPeriod("month")}>
          Last 30 days
        </Chip>
      </Row>
      <Card>
        <Label bold size={24}>
          {selected.length} thoughts captured
        </Label>
        <Label muted>Calculated from saved entry dates on this device.</Label>
        <Row>
          {[...tags]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([tag, count]) => (
              <Chip key={tag}>
                #{tag} · {count}
              </Chip>
            ))}
        </Row>
        <Row>
          {selected
            .filter((e) => e.type === "Question")
            .map((e) => (
              <Button
                key={e.id}
                subtle
                onPress={() => navigate(`/entry/${e.id}`)}
              >
                {titleOf(e)}
              </Button>
            ))}
        </Row>
      </Card>
      <Card>
        <Label bold size={21}>
          What idea keeps coming back to you?
        </Label>
        <Label muted>
          What changed your perspective? Is there something you'd like to
          revisit?
        </Label>
        <Field
          placeholder="A little reflection…"
          value={reflection}
          onChangeText={setReflection}
          multiline
        />
        <Button
          primary
          disabled={!reflection.trim()}
          onPress={() =>
            void put(newEntry(reflection, { type: "Reflection" })).then(() => {
              setReflection("");
              notify("Reflection saved to your journal");
            })
          }
        >
          Save reflection
        </Button>
      </Card>
      {old.length > 0 && (
        <Section title="Worth another look">
          <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
            {old.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onOpen={() => navigate(`/entry/${e.id}`)}
              />
            ))}
          </View>
        </Section>
      )}
      <Section title="This period, in your own words">
        {selected.slice(0, 20).map((e) => (
          <Button
            key={e.id}
            subtle
            icon="arrow-up-right"
            onPress={() => navigate(`/entry/${e.id}`)}
          >
            {titleOf(e)}
          </Button>
        ))}
      </Section>
    </View>
  );
}
