// SPDX-License-Identifier: AGPL-3.0-only
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { runAI } from "../src/ai.ts";
import { newEntry } from "@echo/core";
test("provider adapter validates analysis, enforces citations and indexes embeddings (mock HTTP provider)", async () => {
  let mode = "analysis";
  let lastPayload: any;
  let calls = 0;
  const server = http.createServer(async (req, res) => {
    calls++;
    let body = "";
    for await (const chunk of req) body += chunk;
    lastPayload = JSON.parse(body);
    res.setHeader("Content-Type", "application/json");
    const content =
      mode === "analysis"
        ? JSON.stringify({
            title: "A possible title",
            summary: "A suggestion",
            tags: ["video"],
            questions: ["Who is it for?"],
            steps: ["Sketch a flow"],
          })
        : mode === "invalid"
          ? JSON.stringify({
              claims: [
                {
                  text: "Unsupported claim",
                  sourceIds: ["invented-id"],
                  interpretation: false,
                },
              ],
              uncertainty: "",
            })
          : "A proposal, not a recorded fact.";
    res.end(
      JSON.stringify(
        mode === "embedding"
          ? { embeddings: [[1, 0, 0]] }
          : { message: { content }, prompt_eval_count: 12, eval_count: 8 },
      ),
    );
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address() as { port: number };
  const previous = { ...process.env };
  process.env.AI_ENDPOINT = `http://127.0.0.1:${address.port}`;
  process.env.AI_PROVIDER = "ollama";
  process.env.AI_MODEL = "fixture-model";
  try {
    const entry = newEntry("a video calling idea", {
      attachments: [
        {
          id: "file",
          name: "secret.txt",
          uri: "data:text/plain;base64,c2VjcmV0",
          mime: "text/plain",
          size: 6,
        },
      ],
    });
    const request = {
      operation: "analyze" as const,
      prompt: "analyze",
      entries: [entry],
      consent: true as const,
    };
    const result = await runAI(request);
    assert.equal((result.output as any).title, "A possible title");
    assert.equal(result.model, "fixture-model");
    assert.equal(JSON.stringify(lastPayload).includes("c2VjcmV0"), false);
    const before = calls;
    await assert.rejects(
      runAI({ ...request, entries: [{ ...entry, excludeAI: true }] }),
    );
    assert.equal(calls, before);
    mode = "invalid";
    await assert.rejects(
      runAI({ ...request, operation: "ask" }),
      /unsupported citations/,
    );
    mode = "embedding";
    const embedded = await runAI({ ...request, operation: "embed" });
    assert.deepEqual(embedded.embeddings?.[0].values, [1, 0, 0]);
    mode = "develop";
    const development = await runAI({ ...request, operation: "develop" });
    assert.match(development.output as string, /proposal/);
  } finally {
    for (const key of ["AI_ENDPOINT", "AI_PROVIDER", "AI_MODEL"]) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await new Promise<void>((r) => server.close(() => r()));
  }
});
