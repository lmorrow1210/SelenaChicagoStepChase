import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { INVITE_CODE_CHARSET } from "@selenas-chase/shared";
import type { app as expressApp } from "../src/index.js";
import type { pool as appPool } from "../src/db/pool.js";
import type { signSession as signSessionFn } from "../src/lib/session.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type App = typeof expressApp;
type Pool = typeof appPool;
type SignSession = typeof signSessionFn;

let app: App;
let pool: Pool;
let signSession: SignSession;
let server: Server;
let baseUrl: string;

function cookieFor(userId: string): string {
  return `sc_session=${signSession({ user_id: userId })}`;
}

async function createUser(label: string): Promise<string> {
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`],
  );
  return r.rows[0].id;
}

async function request(
  userId: string,
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("cookie", cookieFor(userId));
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    body: init.json === undefined ? init.body : JSON.stringify(init.json),
  });
}

async function createGroup(ownerId: string, name = "Night Walkers") {
  const res = await request(ownerId, "/api/groups", {
    method: "POST",
    json: { name },
  });
  expect(res.status).toBe(201);
  return (await res.json()).group;
}

describeDb("groups routes integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL);

    ({ app } = await import("../src/index.js"));
    ({ pool } = await import("../src/db/pool.js"));
    ({ signSession } = await import("../src/lib/session.js"));

    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await pool.end();
  });

  it("creates a group, joins the creator, creates the first week, and returns a valid invite code", async () => {
    const ownerId = await createUser("owner");
    const group = await createGroup(ownerId);

    expect(group.invite_code).toHaveLength(6);
    for (const char of group.invite_code) expect(INVITE_CODE_CHARSET).toContain(char);

    const [owner, week] = await Promise.all([
      pool.query("SELECT group_id FROM users WHERE id = $1", [ownerId]),
      pool.query(
        `SELECT w.group_id, w.group_target_steps, c.route_order
         FROM weeks w JOIN cities c ON c.id = w.city_id
         WHERE w.group_id = $1`,
        [group.id],
      ),
    ]);
    expect(owner.rows[0].group_id).toBe(group.id);
    expect(week.rowCount).toBe(1);
    expect(week.rows[0]).toMatchObject({
      group_id: group.id,
      group_target_steps: 70000,
      route_order: 1,
    });
  });

  it("lets a second user join and returns both members", async () => {
    const ownerId = await createUser("owner");
    const group = await createGroup(ownerId);
    const secondId = await createUser("second");

    const join = await request(secondId, "/api/groups/join", {
      method: "POST",
      json: { invite_code: group.invite_code },
    });
    expect(join.status).toBe(200);

    const mine = await request(secondId, "/api/groups/me");
    expect(mine.status).toBe(200);
    const body = await mine.json();
    expect(body.group.id).toBe(group.id);
    expect(body.members.map((member: { id: string }) => member.id).sort()).toEqual(
      [ownerId, secondId].sort(),
    );
  });

  it("rejects the ninth user with GROUP_FULL", async () => {
    const ownerId = await createUser("owner");
    const group = await createGroup(ownerId);

    for (let i = 1; i <= 7; i += 1) {
      const memberId = await createUser(`member-${i}`);
      const join = await request(memberId, "/api/groups/join", {
        method: "POST",
        json: { invite_code: group.invite_code },
      });
      expect(join.status).toBe(200);
    }

    const ninthId = await createUser("member-8");
    const rejected = await request(ninthId, "/api/groups/join", {
      method: "POST",
      json: { invite_code: group.invite_code },
    });
    expect(rejected.status).toBe(409);
    expect(await rejected.json()).toEqual({
      error: { code: "GROUP_FULL", message: "This group already has 8 players" },
    });
  });

  it("promotes the oldest remaining member when the admin leaves", async () => {
    const ownerId = await createUser("owner");
    const group = await createGroup(ownerId);
    const secondId = await createUser("second");
    const join = await request(secondId, "/api/groups/join", {
      method: "POST",
      json: { invite_code: group.invite_code },
    });
    expect(join.status).toBe(200);

    const leave = await request(ownerId, "/api/groups/me/leave", { method: "POST" });
    expect(leave.status).toBe(200);

    const [updatedGroup, owner] = await Promise.all([
      pool.query("SELECT admin_id FROM groups WHERE id = $1", [group.id]),
      pool.query("SELECT group_id FROM users WHERE id = $1", [ownerId]),
    ]);
    expect(updatedGroup.rows[0].admin_id).toBe(secondId);
    expect(owner.rows[0].group_id).toBeNull();
  });
});
