// SPDX-License-Identifier: AGPL-3.0-only
import React, { useState } from "react";
import { View } from "react-native";
import {
  analysisSchema,
  search,
  titleOf,
  newEntry,
  editEntry,
  stamp,
  now,
  cosine,
  type Entry,
  type EchoRecord,
} from "@echo/core";
import { useStore, api, put, putMany } from "./store";
import { Button, Card, Chip, Field, Label, Row, Section, Empty } from "./ui";
import type { Navigate } from "./entries";
export function AIWorkspace({
  id,
  ask = false,
  navigate,
  notify,
}: {
  id?: string;
  ask?: boolean;
  navigate: Navigate;
  notify: (s: string) => void;
}) {
  const { records, meta } = useStore();
  const [prompt, setPrompt] = useState(
    ask ? "" : "Expand this idea and identify a small next step.",
  );
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tag, setTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<string[]>(id ? [id] : []);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [operation, setOperation] = useState<
    "analyze" | "develop" | "ask" | "embed"
  >(ask ? "ask" : "develop");
  const [showSessions, setShowSessions] = useState(false);
  const entries = records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt && !r.excludeAI,
  );
  const projects = records.filter((r) => r.kind === "project" && !r.deletedAt);
  const matches = search(entries, query, {
    projectId,
    tag,
    from,
    to,
    aiOnly: true,
  }).slice(0, 40);
  const scope = entries.filter((e) => selected.includes(e.id));
  const sessions = records.filter(
    (r) =>
      r.kind === "conversation" && !r.deletedAt && (ask || r.entryId === id),
  );
  const current = entries.find((e) => e.id === id);
  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const config = await api("/ai/config");
      if (meta.preferences.aiMode === "local-only" && !config.local)
        throw new Error(
          "Local-only mode requires a provider on the sync server’s loopback address.",
        );
      const data = await api("/ai/run", {
        operation,
        prompt,
        entries: scope,
        consent: true,
      });
      setResult({ ...data, operation });
      if (operation === "embed") {
        await putMany(
          data.embeddings.map((em: any) => ({
            ...stamp(),
            kind: "embedding",
            entryId: em.entryId,
            model: em.model,
            contentHash:
              scope.find((e) => e.id === em.entryId)?.updatedAt || "",
            values: em.values,
          })),
        );
      } else
        await put({
          ...stamp(),
          kind: "conversation",
          entryId: id || null,
          model: data.model,
          operation,
          sources: scope.map((e) => e.id),
          messages: [
            { role: "user", content: prompt, at: now() },
            {
              role: "assistant",
              content:
                typeof data.output === "string"
                  ? data.output
                  : JSON.stringify(data.output, null, 2),
              at: now(),
            },
          ],
        });
    } catch (e) {
      notify(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const resultText = result
    ? typeof result.output === "string"
      ? result.output
      : JSON.stringify(result.output, null, 2)
    : "";
  if (meta.preferences.aiMode === "disabled")
    return (
      <Empty
        icon="shield"
        title="Your thoughts work without AI."
        detail="AI is disabled. Enable manual processing in Settings and configure your self-hosted server when you're ready."
        action={
          <Button onPress={() => navigate("/settings")}>AI settings</Button>
        }
      />
    );
  return (
    <View style={{ gap: 24 }}>
      <Label size={30} bold>
        {ask ? "Ask your own thinking." : "Let an idea unfold."}
      </Label>
      <Label muted>
        {ask
          ? "Choose sources before asking. Echo retrieves locally; only your selected entries are sent."
          : "Explore possibilities while keeping your original thought intact."}
      </Label>
      <Card>
        <Row>
          {(ask ? ["ask"] : ["develop", "analyze", "embed"]).map((v) => (
            <Chip
              key={v}
              active={operation === v}
              onPress={() => {
                setOperation(v as typeof operation);
                setResult(null);
                setConsent(false);
              }}
            >
              {v === "embed"
                ? "Build semantic index"
                : v === "analyze"
                  ? "Understand"
                  : "Develop / Ask"}
            </Chip>
          ))}
        </Row>
        {current && <Label bold>{titleOf(current)}</Label>}
        <Field
          label={ask ? "Your question" : "What would you like to explore?"}
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />
        <Row>
          {!ask &&
            [
              "Expand the idea",
              "Find weaknesses",
              "Brainstorm alternatives",
              "Generate a checklist",
              "Generate a project specification",
              "Ask useful questions",
            ].map((v) => (
              <Chip key={v} onPress={() => setPrompt(v)}>
                {v}
              </Chip>
            ))}
        </Row>
      </Card>
      <Section title="Review the context">
        <Card>
          <Field
            label="Retrieve matching thoughts locally"
            placeholder="Search your permitted entries…"
            value={query}
            onChangeText={setQuery}
          />
          <Row>
            <Field label="Tag" value={tag} onChangeText={setTag} />
            <Field
              label="From YYYY-MM-DD"
              value={from}
              onChangeText={setFrom}
            />
            <Field label="To YYYY-MM-DD" value={to} onChangeText={setTo} />
          </Row>
          <Row>
            <Chip active={!projectId} onPress={() => setProjectId("")}>
              All projects
            </Chip>
            {projects.map((p) => (
              <Chip
                key={p.id}
                active={projectId === p.id}
                onPress={() => setProjectId(p.id)}
              >
                {p.kind === "project" ? p.name : ""}
              </Chip>
            ))}
          </Row>
          {matches.map((e) => (
            <Chip
              key={e.id}
              active={selected.includes(e.id)}
              onPress={() => {
                setConsent(false);
                setSelected(
                  selected.includes(e.id)
                    ? selected.filter((s) => s !== e.id)
                    : [...selected, e.id].slice(0, 12),
                );
              }}
            >
              {selected.includes(e.id) ? "✓ " : ""}
              {titleOf(e)}
            </Chip>
          ))}
          {!matches.length && (
            <Label muted>
              No permitted entries match this scope. Nothing will be invented.
            </Label>
          )}
          <Label muted size={12}>
            {scope.length} selected ·{" "}
            {scope.reduce((n, e) => n + e.content.length, 0).toLocaleString()}{" "}
            characters · maximum 12 entries / 48,000 characters
          </Label>
          <Chip active={consent} onPress={() => setConsent(!consent)}>
            {consent
              ? "✓ Authorized for this request"
              : "I authorize sending these selected entries to the configured provider"}
          </Chip>
          <Label muted size={12}>
            Mode: {meta.preferences.aiMode}. Attachments are never sent. Sign in
            to your self-hosted server in Settings. A local-only provider runs
            on that server, which may be a different device.
          </Label>
          <Button
            primary
            icon="zap"
            disabled={
              busy ||
              !consent ||
              !scope.length ||
              !prompt.trim() ||
              scope.reduce((n, e) => n + e.content.length, 0) > 48000
            }
            onPress={() => void run()}
          >
            {busy ? "Thinking…" : "Send selected context"}
          </Button>
        </Card>
      </Section>
      {result && (
        <Section title="AI output · review before accepting">
          <Card>
            <Label muted size={12}>
              {result.model} ·{" "}
              {result.local ? "Server-local model" : "Remote provider"} ·{" "}
              {result.durationMs} ms · {JSON.stringify(result.usage || {})}
            </Label>
            {result.operation === "analyze" ? (
              <View style={{ gap: 12 }}>
                <Label bold size={22}>
                  {result.output.title}
                </Label>
                <Label>{result.output.summary}</Label>
                <Row>
                  {result.output.tags.map((v: string) => (
                    <Chip key={v}>{v}</Chip>
                  ))}
                </Row>
                {result.output.questions.map((v: string) => (
                  <Label key={v}>? {v}</Label>
                ))}
                {result.output.steps.map((v: string) => (
                  <Label key={v}>→ {v}</Label>
                ))}
                {current && (
                  <Row>
                    <Button
                      onPress={() =>
                        void put(
                          editEntry(
                            current,
                            {
                              title: analysisSchema.parse(result.output).title,
                            },
                            "ai",
                          ),
                        ).then(() => notify("Suggested title accepted"))
                      }
                    >
                      Accept title
                    </Button>
                    <Button
                      onPress={() =>
                        void put(
                          editEntry(
                            current,
                            {
                              tags: [
                                ...new Set([
                                  ...current.tags,
                                  ...analysisSchema.parse(result.output).tags,
                                ]),
                              ],
                            },
                            "ai",
                          ),
                        ).then(() => notify("Suggested tags accepted"))
                      }
                    >
                      Accept tags
                    </Button>
                  </Row>
                )}
              </View>
            ) : result.operation === "ask" ? (
              <View style={{ gap: 16 }}>
                {result.output.claims.map((c: any, i: number) => (
                  <View key={i} style={{ gap: 8 }}>
                    <Label>
                      {c.interpretation ? "Interpretation: " : ""}
                      {c.text}
                    </Label>
                    <Row>
                      {c.sourceIds.map((sourceId: string) => (
                        <Button
                          key={sourceId}
                          subtle
                          icon="file-text"
                          onPress={() => navigate(`/entry/${sourceId}`)}
                        >
                          {titleOf(entries.find((e) => e.id === sourceId)!)}
                        </Button>
                      ))}
                    </Row>
                  </View>
                ))}
                <Label muted>{result.output.uncertainty}</Label>
              </View>
            ) : result.operation === "embed" ? (
              <Label>
                Indexed {result.embeddings.length} selected entries. Model
                versions and content timestamps are recorded.
              </Label>
            ) : (
              <Label size={16}>{resultText}</Label>
            )}
            {result.operation !== "embed" && (
              <Row>
                <Button
                  icon="plus"
                  onPress={() =>
                    void (async () => {
                      const generated = newEntry(resultText, {
                        type: "Note",
                        title: `AI · ${prompt.slice(0, 60)}`,
                      });
                      await putMany([
                        generated,
                        ...(current
                          ? [
                              {
                                ...stamp(),
                                kind: "relationship" as const,
                                from: generated.id,
                                to: current.id,
                                type: "Inspired by" as const,
                                source: "manual" as const,
                                explanation: `AI output saved after user review (${result.model}).`,
                              },
                            ]
                          : []),
                      ]);
                      notify(
                        "AI output saved as a separate entry with its source link",
                      );
                    })().catch((error) => notify(error.message))
                  }
                >
                  Save as new thought
                </Button>
                {current && (
                  <Button
                    onPress={() =>
                      void put(
                        editEntry(
                          current,
                          {
                            content: `${current.content}\n\n---\nAI suggestion (${result.model}):\n${resultText}`,
                          },
                          "ai",
                        ),
                      ).then(() =>
                        notify("Appended with a recoverable revision"),
                      )
                    }
                  >
                    Append to source
                  </Button>
                )}
                <Button
                  onPress={() => {
                    setResult(null);
                    setConsent(false);
                  }}
                >
                  Reject output
                </Button>
              </Row>
            )}
          </Card>
        </Section>
      )}
      <Button subtle onPress={() => setShowSessions(!showSessions)}>
        Conversation history ({sessions.length})
      </Button>
      {showSessions &&
        sessions.map((s) => (
          <Card key={s.id}>
            {s.kind === "conversation" && (
              <>
                <Label muted>
                  {new Date(s.createdAt).toLocaleString()} · {s.model}
                </Label>
                {s.messages.map((m, i) => (
                  <View key={i}>
                    <Label bold>{m.role}</Label>
                    <Label>{m.content}</Label>
                  </View>
                ))}
                <Button
                  danger
                  onPress={() =>
                    void put({ ...s, deletedAt: now(), updatedAt: now() })
                  }
                >
                  Delete session
                </Button>
              </>
            )}
          </Card>
        ))}
    </View>
  );
}
