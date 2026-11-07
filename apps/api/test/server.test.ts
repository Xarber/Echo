// SPDX-License-Identifier: AGPL-3.0-only
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildServer } from "../src/server.ts";
import { newEntry, editEntry, uid } from "@echo/core";
const credentials = (name: string) => ({
  email: `${name}@example.test`,
  password: "a strong test password 123",
});
async function setup() {
  const app = await buildServer({
    databasePath: ":memory:",
    allowRegistration: true,
  });
  const response = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: credentials("one"),
  });
  const token = response.json().token;
  const headers = { authorization: `Bearer ${token}` };
  return { app, headers };
}
test("auth rejects anonymous access and wrong credentials; session revocation", async () => {
  const { app, headers } = await setup();
  try {
    assert.equal((await app.inject("/entries")).statusCode, 401);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/auth/login",
          payload: { ...credentials("one"), password: "incorrect password" },
        })
      ).statusCode,
      401,
    );
    assert.equal(
      (await app.inject({ method: "GET", url: "/account", headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ method: "POST", url: "/auth/logout", headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ method: "GET", url: "/account", headers }))
        .statusCode,
      401,
    );
  } finally {
    await app.close();
  }
});
test("two devices synchronize idempotently; conflicts preserve both versions; account isolation", async () => {
  const { app, headers } = await setup();
  try {
    const e = newEntry("original");
    const operation = { operationId: uid(), baseRevision: 0, record: e };
    const push = async (operations: unknown[]) =>
      app.inject({
        method: "POST",
        url: "/sync/push",
        headers,
        payload: { operations },
      });
    const first = (await push([operation])).json();
    assert.equal(first.accepted[0].revision, 1);
    assert.equal((await push([operation])).json().accepted[0].revision, 1);
    const deviceA = {
      operationId: uid(),
      baseRevision: 1,
      record: editEntry(e, { content: "device A" }),
    };
    assert.equal((await push([deviceA])).json().accepted[0].revision, 2);
    const deviceB = {
      operationId: uid(),
      baseRevision: 1,
      record: editEntry(e, { content: "device B" }),
    };
    const conflict = (await push([deviceB])).json().conflicts[0];
    assert.equal(conflict.local.content, "device B");
    assert.equal(conflict.remote.content, "device A");
    const pull = (
      await app.inject({ url: "/sync/pull?cursor=0", headers })
    ).json();
    assert.equal(pull.records.length, 1);
    assert.equal(pull.records[0].record.content, "device A");
    const other = (
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: credentials("two"),
      })
    ).json();
    assert.equal(
      (
        await app.inject({
          url: "/entries",
          headers: { authorization: `Bearer ${other.token}` },
        })
      ).json().length,
      0,
    );
    assert.equal(
      (
        await app.inject({
          url: `/entries/${e.id}`,
          headers: { authorization: `Bearer ${other.token}` },
        })
      ).statusCode,
      404,
    );
    const resolution = {
      operationId: uid(),
      baseRevision: 2,
      record: conflict.local,
    };
    assert.equal((await push([resolution])).json().accepted[0].revision, 3);
  } finally {
    await app.close();
  }
});
test("malformed records and invalid cursor fail validation; no partial batch writes", async () => {
  const { app, headers } = await setup();
  try {
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/sync/push",
          headers,
          payload: {
            operations: [
              { operationId: "x", baseRevision: 0, record: { kind: "entry" } },
            ],
          },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (await app.inject({ url: "/sync/pull?cursor=-3", headers })).statusCode,
      400,
    );
    assert.equal(
      (await app.inject({ url: "/entries", headers })).json().length,
      0,
    );
  } finally {
    await app.close();
  }
});
test("account deletion revokes sessions and removes owned records", async () => {
  const { app, headers } = await setup();
  try {
    const e = newEntry("private");
    await app.inject({
      method: "POST",
      url: "/sync/push",
      headers,
      payload: {
        operations: [{ operationId: uid(), baseRevision: 0, record: e }],
      },
    });
    assert.equal(
      (await app.inject({ method: "DELETE", url: "/account", headers }))
        .statusCode,
      200,
    );
    assert.equal(
      (await app.inject({ url: "/sync/pull", headers })).statusCode,
      401,
    );
    const again = (
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: credentials("one"),
      })
    ).json();
    assert.equal(
      (
        await app.inject({
          url: "/entries",
          headers: { authorization: `Bearer ${again.token}` },
        })
      ).json().length,
      0,
    );
  } finally {
    await app.close();
  }
});
test("disabled provider fails without returning fabricated analysis", async () => {
  const { app, headers } = await setup();
  try {
    const r = await app.inject({
      method: "POST",
      url: "/ai/run",
      headers,
      payload: {
        operation: "analyze",
        prompt: "analyze",
        entries: [newEntry("thought")],
        consent: true,
      },
    });
    assert.equal(r.statusCode, 502);
    assert.ok(!r.json().output);
  } finally {
    await app.close();
  }
});

test("server records and sessions survive a real SQLite close/reopen", async () => {
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const directory = mkdtempSync(join(tmpdir(), "echo-db-test-"));
  const path = join(directory, "echo.db");
  let app = await buildServer({ databasePath: path, allowRegistration: true });
  try {
    const login = (
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: credentials("durable"),
      })
    ).json();
    const headers = { authorization: `Bearer ${login.token}` };
    const entry = newEntry("Durable server fixture");
    await app.inject({
      method: "POST",
      url: "/sync/push",
      headers,
      payload: {
        operations: [{ operationId: uid(), baseRevision: 0, record: entry }],
      },
    });
    await app.close();
    app = await buildServer({ databasePath: path });
    const result = await app.inject({ url: `/entries/${entry.id}`, headers });
    assert.equal(result.statusCode, 200);
    assert.equal(result.json().content, "Durable server fixture");
  } finally {
    await app.close();
    rmSync(directory, { recursive: true });
  }
});
