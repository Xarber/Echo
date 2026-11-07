// SPDX-License-Identifier: AGPL-3.0-only
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
  randomUUID,
} from "node:crypto";
import { z } from "zod";
import {
  recordSchema,
  syncOperationSchema,
  shouldConflict,
  VERSION,
} from "@echo/core";
import { openDatabase } from "./database.ts";
import { providerInfo, runAI } from "./ai.ts";
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(hash, "hex"),
  );
}
export async function buildServer(
  options: { databasePath?: string; allowRegistration?: boolean } = {},
) {
  const db = openDatabase(options.databasePath);
  const missingUserHash = passwordHash("dummy-password-value");
  const app = Fastify({ logger: false, bodyLimit: 20_000_000 });
  const origins = (
    process.env.CORS_ORIGINS || "http://localhost:8081,http://localhost:4173"
  ).split(",");
  await app.register(cors, { origin: origins });
  await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  app.addHook("onClose", async () => db.close());
  app.setErrorHandler((error, request, reply) => {
    const typed = error as { statusCode?: number; message?: string };
    const status =
      error instanceof z.ZodError
        ? 400
        : typed.statusCode && typed.statusCode < 600
          ? typed.statusCode
          : 500;
    reply.code(status).send({
      message:
        status === 400
          ? "Invalid request data"
          : status === 500
            ? "Request failed. Check configuration or try again."
            : typed.message,
    });
  });
  async function owner(request: { headers: { authorization?: string } }) {
    const token = request.headers.authorization?.replace(/^Bearer /, "");
    const session = token
      ? (db
          .prepare(
            "SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?",
          )
          .get(digest(token), Date.now()) as { user_id: string } | undefined)
      : undefined;
    if (!session)
      throw Object.assign(new Error("Sign in to your sync server first"), {
        statusCode: 401,
      });
    return session.user_id;
  }
  function session(userId: string) {
    const token = randomBytes(32).toString("base64url");
    db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
      digest(token),
      userId,
      Date.now() + 30 * 86400000,
    );
    return token;
  }
  app.get("/health", async () => ({
    status: "ok",
    version: VERSION,
    commit: process.env.BUILD_COMMIT || "development",
  }));
  app.get("/ai/config", async () => providerInfo());
  const credentials = z.object({
    email: z
      .email()
      .max(254)
      .transform((e) => e.toLowerCase()),
    password: z.string().min(12).max(128),
  });
  app.post(
    "/auth/register",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, reply) => {
      if (!(
        options.allowRegistration ?? process.env.ALLOW_REGISTRATION === "true"
      ))
        return reply.code(403).send({
          message: "Registration is disabled by the server administrator",
        });
      const body = credentials.parse(req.body);
      const userId = randomUUID();
      try {
        db.prepare("INSERT INTO users VALUES(?,?,?,?)").run(
          userId,
          body.email,
          passwordHash(body.password),
          new Date().toISOString(),
        );
      } catch {
        return reply
          .code(409)
          .send({ message: "Unable to register this account" });
      }
      return { token: session(userId), userId };
    },
  );
  app.post(
    "/auth/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = credentials.parse(req.body);
      const user = db
        .prepare("SELECT id,password FROM users WHERE email=?")
        .get(body.email) as { id: string; password: string } | undefined;
      const valid = passwordMatches(
        body.password,
        user?.password || missingUserHash,
      );
      if (!user || !valid)
        return reply.code(401).send({ message: "Invalid email or password" });
      return { token: session(user.id), userId: user.id };
    },
  );
  app.post("/auth/logout", async (req) => {
    await owner(req);
    db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
      digest(req.headers.authorization!.slice(7)),
    );
    return { ok: true };
  });
  app.get("/account", async (req) => {
    const id = await owner(req);
    return db
      .prepare("SELECT id,email,created_at FROM users WHERE id=?")
      .get(id);
  });
  app.delete("/account", async (req) => {
    const id = await owner(req);
    db.prepare("DELETE FROM users WHERE id=?").run(id);
    return { ok: true };
  });
  app.post("/sync/push", async (req) => {
    const user = await owner(req);
    const body = z
      .object({ operations: z.array(syncOperationSchema).max(200) })
      .parse(req.body);
    const accepted: { operationId: string; id: string; revision: number }[] =
      [];
    const conflicts: unknown[] = [];
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const op of body.operations) {
        const prior = db
          .prepare(
            "SELECT record_id,revision FROM operations WHERE user_id=? AND id=?",
          )
          .get(user, op.operationId) as
          { record_id: string; revision: number } | undefined;
        if (prior) {
          accepted.push({
            operationId: op.operationId,
            id: prior.record_id,
            revision: prior.revision,
          });
          continue;
        }
        const current = db
          .prepare(
            "SELECT revision,payload FROM records WHERE user_id=? AND id=?",
          )
          .get(user, op.record.id) as
          { revision: number; payload: string } | undefined;
        if (
          current &&
          shouldConflict(
            op.baseRevision,
            current.revision,
            op.record,
            JSON.parse(current.payload),
          )
        ) {
          conflicts.push({
            local: op.record,
            remote: JSON.parse(current.payload),
            revision: current.revision,
          });
          continue;
        }
        if (!current && op.baseRevision !== 0) {
          throw new Error("Missing sync base record");
        }
        const revision = (current?.revision || 0) + 1;
        db.prepare("UPDATE counters SET value=value+1 WHERE id=1").run();
        const seq = (
          db.prepare("SELECT value FROM counters WHERE id=1").get() as {
            value: number;
          }
        ).value;
        db.prepare("INSERT OR REPLACE INTO records VALUES(?,?,?,?,?,?)").run(
          user,
          op.record.id,
          op.record.kind,
          revision,
          JSON.stringify(op.record),
          seq,
        );
        db.prepare("INSERT INTO operations VALUES(?,?,?,?)").run(
          user,
          op.operationId,
          op.record.id,
          revision,
        );
        accepted.push({
          operationId: op.operationId,
          id: op.record.id,
          revision,
        });
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return { accepted, conflicts };
  });
  app.get("/sync/pull", async (req) => {
    const user = await owner(req);
    const { cursor } = z
      .object({ cursor: z.coerce.number().int().nonnegative().default(0) })
      .parse(req.query);
    const rows = db
      .prepare(
        "SELECT payload,revision,sequence FROM records WHERE user_id=? AND sequence>? ORDER BY sequence LIMIT 201",
      )
      .all(user, cursor) as {
      payload: string;
      revision: number;
      sequence: number;
    }[];
    return {
      records: rows.slice(0, 200).map((r) => ({
        record: JSON.parse(r.payload),
        revision: r.revision,
        sequence: r.sequence,
      })),
      more: rows.length > 200,
    };
  });
  for (const [path, kind] of [
    ["entries", "entry"],
    ["projects", "project"],
    ["collections", "collection"],
    ["relationships", "relationship"],
  ] as const) {
    app.get(`/${path}`, async (req) => {
      const user = await owner(req);
      return (
        db
          .prepare("SELECT payload FROM records WHERE user_id=? AND kind=?")
          .all(user, kind) as { payload: string }[]
      )
        .map((r) => JSON.parse(r.payload))
        .filter((r) => !r.deletedAt);
    });
    app.get(`/${path}/:id`, async (req, reply) => {
      const user = await owner(req);
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const row = db
        .prepare(
          "SELECT payload FROM records WHERE user_id=? AND id=? AND kind=?",
        )
        .get(user, id, kind) as { payload: string } | undefined;
      if (!row) return reply.code(404).send({ message: "Record not found" });
      const parsed = recordSchema.parse(JSON.parse(row.payload));
      if (parsed.deletedAt)
        return reply.code(404).send({ message: "Record not found" });
      return parsed;
    });
  }
  app.post(
    "/ai/run",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req) => {
      await owner(req);
      try {
        return await runAI(req.body as never);
      } catch (error) {
        if (error instanceof z.ZodError) throw error;
        return Promise.reject(
          Object.assign(
            new Error(
              error instanceof Error ? error.message : "AI request failed",
            ),
            { statusCode: 502 },
          ),
        );
      }
    },
  );
  return app;
}
