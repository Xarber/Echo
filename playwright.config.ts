// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig } from "@playwright/test";
const port = Number(process.env.ECHO_TEST_PORT || 4373);
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: `http://localhost:${port}`,
    channel: process.env.ECHO_CI_BROWSER === "chromium" ? undefined : "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-web.mjs",
    env: { WEB_PORT: String(port) },
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
  reporter: "list",
  outputDir: "artifacts/e2e",
});
