// SPDX-License-Identifier: AGPL-3.0-only
import { useState } from "react";
import { productionBuild, productionEndpoint } from "./deployment";
import { activeApiUrl, switchDeveloperServer, useStore } from "./store";
import { Button, Card, Field, Label, Row } from "./ui";

export function ServerSwitcher() {
  const { meta } = useStore();
  const [input, setInput] = useState(meta.preferences.developerApiUrl || "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: "test" | "switch" | "reset") {
    setBusy(true);
    setStatus("");
    try {
      if (action === "reset") {
        await switchDeveloperServer(undefined);
        setInput("");
        setStatus("Default restored.");
        return;
      }
      const url = productionEndpoint(input);
      if (!url) throw new Error("Enter a valid HTTPS server URL.");
      const response = await fetch(url + "/health", {
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok || (await response.json()).status !== "ok")
        throw new Error(
          "This endpoint did not return a healthy Echo response.",
        );
      if (action === "switch") await switchDeveloperServer(url);
      setStatus(
        action === "switch" ? "Server switched." : "Echo server reachable.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Connection failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Label bold size={20}>
        Server Switcher
      </Label>
      <Label muted>
        {productionBuild ? "Production" : "Development"} ·{" "}
        {meta.preferences.developerApiUrl
          ? "Developer override"
          : "Default configuration"}
      </Label>
      <Label>
        {activeApiUrl(meta.preferences) || "No server configured"}
      </Label>
      <Field
        label="Custom HTTPS server"
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
      />
      <Label muted>
        Server changes require signing out and resetting any existing sync
        binding. Back up the journal before resetting it.
      </Label>
      <Row>
        <Button
          icon="activity"
          disabled={busy}
          onPress={() => void run("test")}
        >
          Test connection
        </Button>
        <Button
          primary
          icon="server"
          disabled={busy}
          onPress={() => void run("switch")}
        >
          Switch server
        </Button>
        <Button
          subtle
          icon="rotate-ccw"
          disabled={busy || !meta.preferences.developerApiUrl}
          onPress={() => void run("reset")}
        >
          Restore default
        </Button>
      </Row>
      {status ? <Label>{status}</Label> : null}
    </Card>
  );
}
