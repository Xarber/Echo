// SPDX-License-Identifier: AGPL-3.0-only
import { test, expect } from "@playwright/test";
test("offline capture, restart, revision, relationships, project and backup", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("Every thought deserves an echo.")).toBeVisible();
  await page.getByRole("button", { name: "Open Echo", exact: true }).click();
  await page
    .getByRole("button", { name: "Skip introduction", exact: true })
    .click();
  await expect(page.getByText("A quiet place for bright ideas.")).toBeVisible();
  await page
    .getByRole("button", { name: "New thought", exact: true })
    .first()
    .click();
  await page
    .getByPlaceholder("Give this entry a title")
    .fill("A virtual doorbell");
  await page
    .getByTestId("thought-content")
    .fill("Spontaneous video calling with a virtual doorbell.");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit thought", exact: true }),
  ).toBeVisible();
  const first = page.url();
  await page.reload();
  await expect(
    page.getByText("Spontaneous video calling with a virtual doorbell.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit thought", exact: true }).click();
  await page
    .getByLabel("Thought", { exact: true })
    .fill("Spontaneous video calling with a virtual doorbell and friends.");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByText("Original captured content", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Spontaneous video calling with a virtual doorbell.", {
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await page.goto("/capture");
  await page
    .getByPlaceholder("Give this entry a title")
    .fill("Messaging with friends");
  await page
    .getByTestId("thought-content")
    .fill("Video calling and messaging with friends.");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await page
    .getByRole("button", { name: "A virtual doorbell", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Connect thoughts", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Related to: A virtual doorbell" }),
  ).toBeVisible();
  await page.goto("/projects");
  await page.getByLabel("New project name", { exact: true }).fill("Portal");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await page
    .getByRole("button", { name: "+ A virtual doorbell", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Open A virtual doorbell", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("New task", { exact: true })
    .fill("Sketch the first flow");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(
    page.getByText("Sketch the first flow · normal", { exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBeTruthy();
  await context.setOffline(true);
  await page.goto("/capture");
  await page
    .getByTestId("thought-content")
    .fill("This thought was captured fully offline.");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit thought", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByText("This thought was captured fully offline.", { exact: true })
      .last(),
  ).toBeVisible();
  await context.setOffline(false);
  await page.goto("/settings");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export complete backup", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("echo-backup.json");
  expect(errors).toEqual([]);
});
test("draft recovery, mobile layout, deep links and AI-disabled no requests", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let aiCalls = 0;
  page.on("request", (r) => {
    if (r.url().includes("/ai/")) aiCalls++;
  });
  await page.goto("/capture");
  await page.getByTestId("thought-content").fill("Keep this unfinished draft.");
  await expect(
    page.getByText("Draft saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("thought-content")).toHaveValue(
    "Keep this unfinished draft.",
  );
  await page.goto("/develop");
  await expect(
    page.getByText("Your thoughts work without AI.", { exact: true }),
  ).toBeVisible();
  expect(aiCalls).toBe(0);
  await page.goto("/entry/missing");
  await expect(
    page.getByText("Thought not found", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to journal", exact: true })
    .click();
  await expect(
    page.getByText("A record of your becoming.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBeTruthy();
});
test("editing draft survives reload and developer access expires", async ({
  page,
}) => {
  await page.goto("/capture");
  await page.getByTestId("thought-content").fill("Original text to keep");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await page.getByRole("button", { name: "Edit thought", exact: true }).click();
  await page
    .getByLabel("Thought", { exact: true })
    .fill("Unfinished revision, recover me");
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        return await new Promise((resolve) => {
          const request = indexedDB.open("echo-local-v1");
          request.onsuccess = () => {
            const transaction = request.result.transaction("meta");
            const query = transaction.objectStore("meta").get("state");
            query.onsuccess = () =>
              resolve(
                JSON.stringify(query.result).includes(
                  "Unfinished revision, recover me",
                ),
              );
          };
        });
      }),
    )
    .toBeTruthy();
  await page.reload();
  await expect(page.getByLabel("Thought", { exact: true })).toHaveValue(
    "Unfinished revision, recover me",
  );
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.goto("/settings");
  await page
    .getByRole("button", { name: /Version 0.1.0. Tap three times/ })
    .click({ clickCount: 3 });
  await page
    .getByRole("button", { name: "Developer Options", exact: true })
    .click();
  await expect(page.getByText("Ideas for Echo", { exact: true })).toBeVisible();
  await page
    .getByLabel("Idea title", { exact: true })
    .fill("Improve native capture");
  await page
    .getByRole("button", { name: "Record developer idea", exact: true })
    .click();
  await expect(
    page.getByText("Improve native capture", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.goto("/developer");
  await expect(
    page.getByText("Developer Options locked", { exact: true }),
  ).toBeVisible();
});

test("attachment bytes persist, export and round-trip through JSON import", async ({
  page,
}) => {
  await page.goto("/capture");
  await page.getByTestId("thought-content").fill("An attachment fixture");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Attach file", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "fixture.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Real fixture bytes"),
  });
  await expect(page.getByText("fixture.txt", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit thought", exact: true }),
  ).toBeVisible();
  await page.reload();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export file", exact: true }).click();
  const download = await downloadEvent;
  const { readFile } = await import("node:fs/promises");
  expect(await readFile((await download.path())!, "utf8")).toBe(
    "Real fixture bytes",
  );
  await page.goto("/settings");
  const backupEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export complete backup", exact: true })
    .click();
  const backup = await backupEvent;
  const data = JSON.parse(await readFile((await backup.path())!, "utf8"));
  const copy = structuredClone(data);
  copy.records.forEach((r: any) => (r.id = `copy-${r.id}`));
  const importChooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Import backup", exact: true })
    .click();
  await (
    await importChooser
  ).setFiles({
    name: "echo-copy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(copy)),
  });
  await expect(
    page.getByText("1 new records · 0 unchanged · 0 conflicts", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Import new records only", exact: true })
    .click();
  await expect(
    page.getByText("New records imported; existing records preserved", {
      exact: true,
    }),
  ).toBeVisible();
});

test("manual AI scopes a fixture request and saves output without overwriting its source (mocked model)", async ({
  page,
}) => {
  const requests: any[] = [];
  await page.route("http://localhost:4280/ai/**", async (route) => {
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type,authorization",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    if (route.request().url().endsWith("/config")) {
      await route.fulfill({
        json: { configured: true, model: "fixture-model", local: true },
        headers,
      });
      return;
    }
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        output: "A synthetic development suggestion.",
        model: "fixture-model",
        local: true,
        durationMs: 1,
        usage: { inputTokens: 10, outputTokens: 5 },
      },
      headers,
    });
  });
  await page.goto("/capture");
  await page.getByPlaceholder("Give this entry a title").fill("Source thought");
  await page
    .getByTestId("thought-content")
    .fill("A real source, unchanged by the mocked AI");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit thought", exact: true }),
  ).toBeVisible();
  const sourceUrl = page.url();
  await page.goto("/settings");
  await page.getByRole("button", { name: "manual", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "manual", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.goto(sourceUrl);
  await page
    .getByRole("button", { name: "Develop", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", {
      name: "I authorize sending these selected entries to the configured provider",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Send selected context", exact: true })
    .click();
  await expect(
    page.getByText("A synthetic development suggestion.", { exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].entries).toHaveLength(1);
  expect(requests[0].consent).toBe(true);
  await page
    .getByRole("button", { name: "Save as new thought", exact: true })
    .click();
  await expect(
    page.getByText("AI output saved as a separate entry with its source link", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(sourceUrl);
  await expect(
    page.getByText("A real source, unchanged by the mocked AI", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Inspired by: AI/ }),
  ).toBeVisible();
});

test("a staged PWA update shows its own notes before activation and preserves a draft (isolated synthetic build)", async ({
  page,
}) => {
  const http = await import("node:http");
  const { readFile } = await import("node:fs/promises");
  const { resolve, extname } = await import("node:path");
  const root = resolve("apps/client/dist");
  let sw = await readFile(resolve(root, "sw.js"), "utf8");
  const mime: Record<string, string> = {
    ".js": "text/javascript",
    ".html": "text/html",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".ttf": "font/ttf",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
  };
  const server = http.createServer(async (req, res) => {
    try {
      const path = new URL(req.url!, "http://localhost").pathname;
      const file = resolve(root, "." + decodeURIComponent(path));
      if (!file.startsWith(root + "/") && file !== root) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (path === "/sw.js") {
        res.writeHead(200, {
          "Content-Type": "text/javascript",
          "Cache-Control": "no-cache",
        });
        res.end(sw);
        return;
      }
      let body: Buffer;
      let type = mime[extname(file)] || "application/octet-stream";
      try {
        body = await readFile(file);
      } catch {
        body = await readFile(resolve(root, "index.html"));
        type = "text/html";
      }
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  try {
    await page.goto(`${origin}/capture`);
    await page
      .getByTestId("thought-content")
      .fill("Preserve me through the synthetic web update.");
    await expect(
      page.getByText("Draft saved on this device", { exact: true }),
    ).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBeTruthy();
    const fixture = {
      version: "0.1.1",
      date: "2026-11-06",
      build: "synthetic-update-test",
      highlights: [
        {
          icon: "✦",
          title: "Synthetic update fixture",
          description: "This is an isolated automated test.",
        },
      ],
      fixes: ["Preserve local drafts."],
    };
    sw = sw
      .replace(
        /const CACHE='([^']+)'/,
        "const CACHE='echo-synthetic-update-test'",
      )
      .replace(
        /const RELEASE=.*?;const ASSETS=/,
        `const RELEASE=${JSON.stringify(fixture)};const ASSETS=`,
      );
    await page.goto(`${origin}/settings`);
    await page
      .getByRole("button", { name: "Check for Updates", exact: true })
      .click();
    await expect(
      page.getByText("A new Echo is ready", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Synthetic update fixture · This is an isolated automated test/,
      ),
    ).toBeVisible();
    await Promise.all([
      page.waitForEvent("load"),
      page
        .getByRole("button", { name: "Update & reload", exact: true })
        .click(),
    ]);
    await page.goto(`${origin}/capture`);
    await expect(page.getByTestId("thought-content")).toHaveValue(
      "Preserve me through the synthetic web update.",
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("text share target previews incoming content and preserves an existing draft", async ({
  page,
}) => {
  await page.goto("/capture");
  await page.getByTestId("thought-content").fill("Existing draft.");
  await expect(
    page.getByText("Draft saved on this device", { exact: true }),
  ).toBeVisible();
  await page.goto(
    "/capture?title=Shared%20title&text=Shared%20thought&url=https%3A%2F%2Fexample.test",
  );
  await expect(
    page.getByText("Shared with Echo", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("thought-content")).toHaveValue(
    "Existing draft.",
  );
  await page.getByRole("button", { name: "Add to draft", exact: true }).click();
  await expect(page.getByTestId("thought-content")).toHaveValue(
    "Existing draft.\n\nShared title\n\nShared thought\n\nhttps://example.test",
  );
});

test("an unreadable record blocks writes instead of overwriting existing data", async ({
  page,
}) => {
  await page.goto("/capture");
  await page.getByTestId("thought-content").fill("Keep my original safe.");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit thought", exact: true }),
  ).toBeVisible();
  await page.evaluate(
    async () =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("echo-local-v1");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("records", "readwrite");
          tx.objectStore("records").put({
            id: "unreadable-fixture",
            kind: "entry",
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  await page.goto("/capture");
  await expect(
    page.getByText(
      "Local database could not be opened. Your data has not been reset. Reload or free storage.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByTestId("thought-content")
    .fill("This must not overwrite the failed database.");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByText(
      /The local database is unavailable. Existing data has not been changed/,
    ),
  ).toBeVisible();
  const entries = await page.evaluate(
    async () =>
      new Promise<any[]>((resolve, reject) => {
        const open = indexedDB.open("echo-local-v1");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const request = db
            .transaction("records")
            .objectStore("records")
            .getAll();
          request.onsuccess = () => {
            resolve(request.result);
            db.close();
          };
          request.onerror = () => reject(request.error);
        };
      }),
  );
  expect(entries).toHaveLength(2);
  expect(entries.some((e) => e.content === "Keep my original safe.")).toBe(
    true,
  );
  expect(
    entries.some(
      (e) => e.content === "This must not overwrite the failed database.",
    ),
  ).toBe(false);
});

test("a second tab is read-only until the first writer closes", async ({
  page,
  context,
}) => {
  await page.goto("/capture");
  await page
    .getByTestId("thought-content")
    .fill("The original writer owns this thought.");
  await page.getByRole("button", { name: "Save thought", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit thought", exact: true }),
  ).toBeVisible();
  const second = await context.newPage();
  try {
    await second.goto("/capture");
    await expect(
      second.getByText(
        "Echo is already open in another tab. This copy is read-only. Close the other tab and reload to edit.",
        { exact: true },
      ),
    ).toBeVisible();
    await second
      .getByTestId("thought-content")
      .fill("Do not overwrite another tab.");
    await second
      .getByRole("button", { name: "Save thought", exact: true })
      .click();
    await expect(
      second.getByText(
        /The local database is unavailable. Existing data has not been changed/,
      ),
    ).toBeVisible();
    await page.close();
    await second.reload();
    await expect(
      second.getByText(
        "Echo is already open in another tab. This copy is read-only. Close the other tab and reload to edit.",
        { exact: true },
      ),
    ).toHaveCount(0);
    await second
      .getByTestId("thought-content")
      .fill("The new writer can save safely.");
    await second
      .getByRole("button", { name: "Save thought", exact: true })
      .click();
    await expect(
      second.getByRole("button", { name: "Edit thought", exact: true }),
    ).toBeVisible();
    await second.goto("/journal");
    await expect(
      second.getByRole("button", {
        name: "Open The original writer owns this thought.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      second.getByRole("button", {
        name: "Open The new writer can save safely.",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    await second.close();
  }
});
