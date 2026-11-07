// SPDX-License-Identifier: AGPL-3.0-only
import { buildServer } from "./server.ts";
const app = await buildServer();
await app.listen({
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 4280),
});
console.log(
  "Echo API listening. Request bodies and credentials are not logged.",
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    void app.close().then(() => process.exit(0));
  });
