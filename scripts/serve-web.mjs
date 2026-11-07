// SPDX-License-Identifier: AGPL-3.0-only
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("apps/client/dist");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
};
http
  .createServer(async (req, res) => {
    try {
      const path = resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
      if (!path.startsWith(root + "/") && path !== root) {
        res.writeHead(403);
        res.end();
        return;
      }
      let file = path;
      try {
        if (!(await stat(file)).isFile()) file = resolve(root, "index.html");
      } catch {
        file = resolve(root, "index.html");
      }
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "Cache-Control":
          file.endsWith("sw.js") || file.endsWith("index.html")
            ? "no-cache"
            : "public,max-age=3600",
        "Service-Worker-Allowed": "/",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(500);
      res.end("Unable to serve Echo");
    }
  })
  .listen(Number(process.env.WEB_PORT || 4173), "127.0.0.1", () =>
    console.log(
      `Echo preview: http://localhost:${process.env.WEB_PORT || 4173}`,
    ),
  );
