import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { INVITE_CODE_CHARSET } from "@one-step-ahead/shared";
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

describeDb("account deletion (DELETE /api/users/me)", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);
    delete process.env.GOOGLE_CLIENT_ID; // revoke is skipped: never call Google in tests
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

  /** Three players, admin = A, an active week with A paired against someone. */
  async function seedTrio() {
    const a = await createUser("del-a");
    const b = await createUser("del-b");
    const c = await createUser("del-c");
    const group = await createGroup(a);
    for (const u of [b, c]) {
      const res = await request(u, "/api/groups/join", {
        method: "POST",
        json: { invite_code: group.invite_code },
      });
      expect(res.status).toBe(200);
    }
    const week = await pool.query(
      `SELECT id, to_char(starts_on, 'YYYY-MM-DD') AS starts_on FROM weeks WHERE group_id = $1 AND status = 'active'`,
      [group.id],
    );
    const weekId = week.rows[0].id as string;
    const day = week.rows[0].starts_on as string;
    // lazy nemesis pairing
    expect((await request(a, "/api/nemesis/current")).status).toBe(200);

    for (const [u, steps] of [[a, 9000], [b, 7000], [c, 5000]] as const) {
      await pool.query(
        `INSERT INTO step_logs (user_id, log_date, steps, sleep_minutes, workouts)
         VALUES ($1, $2, $3, 420, '[]')`,
        [u, day, steps],
      );
      await pool.query(`INSERT INTO notifications (user_id, kind, message) VALUES ($1, 'social', 'hi')`, [u]);
      await pool.query(`INSERT INTO predictions (week_id, user_id, predicted_steps) VALUES ($1, $2, 100000)`, [weekId, u]);
      await pool.query(`INSERT INTO badges (user_id, badge_code, week_id) VALUES ($1, 'city', $2)`, [u, weekId]);
    }
    await pool.query(
      `UPDATE users SET fitbit_refresh_token_enc = $2, fitbit_connected = TRUE WHERE id = $1`,
      [a, Buffer.from("not-a-real-token")],
    );
    const landmark = await pool.query(`SELECT id FROM landmarks ORDER BY id LIMIT 1`);
    await pool.query(
      `INSERT INTO city_unlocks (week_id, landmark_id, unlock_date, unlocked, unlocked_at, triggering_user)
       VALUES ($1, $2, $3, TRUE, now(), $4)`,
      [weekId, landmark.rows[0].id, day, a],
    );
    return { a, b, c, groupId: group.id as string, weekId };
  }

  const countFor = async (table: string, userId: string) =>
    Number((await pool.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE user_id = $1`, [userId])).rows[0].n);

  it("requires the confirmation string and deletes nothing without it", async () => {
    const { a } = await seedTrio();
    for (const json of [undefined, {}, { confirm: "delete" }, { confirm: true }]) {
      const res = await request(a, "/api/users/me", { method: "DELETE", json });
      expect(res.status).toBe(422);
    }
    expect((await pool.query(`SELECT 1 FROM users WHERE id = $1`, [a])).rowCount).toBe(1);
    expect(await countFor("step_logs", a)).toBe(1);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await fetch(`${baseUrl}/api/users/me`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    expect(res.status).toBe(401);
  });

  it("removes the player and all of their data, and only theirs", async () => {
    const { a, b, c, groupId, weekId } = await seedTrio();

    const res = await request(a, "/api/users/me", { method: "DELETE", json: { confirm: "DELETE" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie") ?? "").toMatch(/sc_session=;/);

    expect((await pool.query(`SELECT 1 FROM users WHERE id = $1`, [a])).rowCount).toBe(0);
    for (const table of ["step_logs", "notifications", "predictions", "badges", "bingo_cards"]) {
      expect(await countFor(table, a)).toBe(0);
    }
    expect(
      (await pool.query(`SELECT 1 FROM nemesis_matchups WHERE player_a = $1 OR player_b = $1 OR winner_id = $1`, [a])).rowCount,
    ).toBe(0);

    // the others keep everything
    for (const u of [b, c]) {
      expect(await countFor("step_logs", u)).toBe(1);
      expect(await countFor("predictions", u)).toBe(1);
      expect(await countFor("badges", u)).toBe(1);
    }

    // group survives; admin passed to the oldest remaining member
    const g = await pool.query(`SELECT admin_id FROM groups WHERE id = $1`, [groupId]);
    expect(g.rows[0].admin_id).toBe(b);

    // the two remaining players are paired with each other for the open week
    const m = await pool.query(`SELECT player_a, player_b FROM nemesis_matchups WHERE week_id = $1`, [weekId]);
    expect(m.rowCount).toBe(1);
    expect([m.rows[0].player_a, m.rows[0].player_b].sort()).toEqual([b, c].sort());

    // the group's landmark stays unlocked, without the pointer to who did it
    const unlock = await pool.query(`SELECT unlocked, triggering_user FROM city_unlocks WHERE week_id = $1`, [weekId]);
    expect(unlock.rows[0].unlocked).toBe(true);
    expect(unlock.rows[0].triggering_user).toBeNull();

    // the old session no longer works, and the app still works for the others
    expect((await request(a, "/api/auth/session")).status).toBe(401);
    expect((await request(b, "/api/weeks/current")).status).toBe(200);
    expect((await request(b, "/api/groups/me")).status).toBe(200);
  });

  it("keeps closed-week group history and the opponent's badge", async () => {
    const { a, b, groupId, weekId } = await seedTrio();
    await pool.query(
      `UPDATE weeks SET status = 'closed', group_total_steps = 21000, target_hit = FALSE WHERE id = $1`,
      [weekId],
    );
    await pool.query(`INSERT INTO badges (user_id, badge_code, week_id) VALUES ($1, 'nemesis_victor', $2)`, [b, weekId]);

    const res = await request(a, "/api/users/me", { method: "DELETE", json: { confirm: "DELETE" } });
    expect(res.status).toBe(200);

    const w = await pool.query(`SELECT status, group_total_steps FROM weeks WHERE id = $1`, [weekId]);
    expect(w.rows[0].status).toBe("closed");
    expect(Number(w.rows[0].group_total_steps)).toBe(21000);
    expect(await countFor("badges", b)).toBe(2);
    expect((await pool.query(`SELECT 1 FROM groups WHERE id = $1`, [groupId])).rowCount).toBe(1);
  });

  it("works for a player with no group, and for the last member of a group", async () => {
    const solo = await createUser("del-solo");
    expect((await request(solo, "/api/users/me", { method: "DELETE", json: { confirm: "DELETE" } })).status).toBe(200);

    const last = await createUser("del-last");
    const group = await createGroup(last);
    expect((await request(last, "/api/users/me", { method: "DELETE", json: { confirm: "DELETE" } })).status).toBe(200);
    const g = await pool.query(`SELECT admin_id FROM groups WHERE id = $1`, [group.id]);
    expect(g.rows[0].admin_id).toBeNull();
  });
});
