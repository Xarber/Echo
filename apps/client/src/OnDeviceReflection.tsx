// SPDX-License-Identifier: AGPL-3.0-only
import { useState } from "react";
import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import type { Entry } from "@echo/core";
import { Button, Card, Label, Row } from "./ui";

const model =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<{
        available(): boolean;
        generate(task: string, context: string): Promise<string>;
      }>("EchoReflection")
    : null;

export function OnDeviceReflection({ entries }: { entries: Entry[] }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  if (!model?.available()) return null;

  const recent = entries
    .filter(
      (entry) => !entry.excludeAI && !entry.archived && entry.content.trim(),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .reverse();
  async function run(task: "daily" | "recent") {
    if (!model || busy) return;
    setBusy(true);
    setResult("");
    try {
      setResult(
        await model.generate(
          task,
          task === "daily"
            ? ""
            : recent
                .map(
                  (entry) =>
                    entry.createdAt.slice(0, 10) +
                    ": " +
                    entry.content.slice(0, 400),
                )
                .join("\n"),
        ),
      );
    } catch {
      setResult("The on-device model could not complete this request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Label bold>On-device writing help</Label>
      <Label muted>
        Recent reflection uses up to five eligible entries from this period.
        Your text stays on this device.
      </Label>
      <Row>
        <Button icon="edit-3" disabled={busy} onPress={() => void run("daily")}>
          Daily writing prompt
        </Button>
        <Button
          icon="activity"
          disabled={busy || recent.length < 2}
          onPress={() => void run("recent")}
        >
          Reflect on recent entries
        </Button>
      </Row>
      {busy ? (
        <Label>Generating on this device…</Label>
      ) : result ? (
        <Label>{result}</Label>
      ) : null}
    </Card>
  );
}
