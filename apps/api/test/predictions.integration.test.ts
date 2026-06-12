import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { app as expressApp } from "../src/index.js";
import type { pool as appPool } from "../src/db/pool.js";
import type { signSession as signSessionFn } from "../src/lib/session.js";
import type { closeWeekPredictions as closeWeekFn } from "../src/services/weekClose.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type App = typeof expressApp;
type Pool = typeof appPool;
type SignSession = typeof signSessionFn;
type CloseWeekPredictions = typeof closeWeekFn;

let app: App;
let pool: Pool;
let signSession: SignSession;
let closeWeekPredictions: CloseWeekPredictions;
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

async function createGroupWithWeek(): Promise<{ groupId: string; weekId: string; adminId: string }> {
  const adminId = await createUser("admin");
  const res = await request(adminId, "/api/groups", {
    method: "POST",
    json: { name: "Test Walkers" },
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  const groupId = body.group.id as string;
  const week = await pool.query("SELECT id FROM weeks WHERE group_id = $1", [groupId]);
  // The submission window is the week's Monday only (spec). Tests run on any
  // weekday, so move starts_on to "today" in the group tz to open the window.
  await pool.query(
    `UPDATE weeks SET starts_on = (now() AT TIME ZONE 'America/Chicago')::date WHERE id = $1`,
    [week.rows[0].id],
  );
  return { groupId, weekId: week.rows[0].id, adminId };
}

describeDb("prediction routes + week-close scoring integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);

    ({ app } = await import("../src/index.js"));
    ({ pool } = await import("../src/db/pool.js"));
    ({ signSession } = await import("../src/lib/session.js"));
    ({ closeWeekPredictions } = await import("../src/services/weekClose.js"));

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

  it("POST /api/predictions submits and 409s on duplicate", async () => {
    const { adminId } = await createGroupWithWeek();

    const first = await request(adminId, "/api/predictions", {
      method: "POST",
      json: { predicted_steps: 90000 },
    });
    expect(first.status).toBe(201);
    const body = await first.json();
    expect(body.prediction.predicted_steps).toBe(90000);

    const second = await request(adminId, "/api/predictions", {
      method: "POST",
      json: { predicted_steps: 95000 },
    });
    expect(second.status).toBe(409);
    expect(await second.json()).toMatchObject({ error: { code: "PREDICTION_EXISTS" } });
  });

  it("GET /api/predictions/current hides others until reveal, then shows all", async () => {
    const { weekId, adminId } = await createGroupWithWeek();
    const secondId = await createUser("second");
    const join = await request(secondId, "/api/groups/join", {
      method: "POST",
      json: {
        invite_code: (
          await pool.query("SELECT invite_code FROM groups WHERE id = (SELECT group_id FROM users WHERE id = $1)", [adminId])
        ).rows[0].invite_code,
      },
    });
    expect(join.status).toBe(200);

    // Admin submits; second has not yet — others should be hidden
    await request(adminId, "/api/predictions", { method: "POST", json: { predicted_steps: 80000 } });
    const partial = await request(adminId, "/api/predictions/current");
    expect(partial.status).toBe(200);
    const partialBody = await partial.json();
    expect(partialBody.others).toBe("hidden");
    expect(partialBody.state).toBe("partial");

    // Second also submits — all in, so others are now revealed
    await request(secondId, "/api/predictions", { method: "POST", json: { predicted_steps: 85000 } });
    const revealed = await request(adminId, "/api/predictions/current");
    expect(revealed.status).toBe(200);
    const revealedBody = await revealed.json();
    expect(Array.isArray(revealedBody.others)).toBe(true);
    expect(revealedBody.state).toBe("revealed");
    expect(revealedBody.allSubmitted).toBe(true);
  });

  it("closeWeekPredictions writes actual_delta/is_winner and closes the week", async () => {
    const { weekId, adminId, groupId } = await createGroupWithWeek();

    // Seed step logs so actual total = 100 000
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps)
       SELECT $1, d::date, 14286
       FROM generate_series(
         (SELECT starts_on FROM weeks WHERE id = $2),
         (SELECT ends_on FROM weeks WHERE id = $2),
         '1 day'::interval
       ) d`,
      [adminId, weekId],
    );

    await pool.query(
      `INSERT INTO predictions (week_id, user_id, predicted_steps)
       VALUES ($1, $2, 95000)`,
      [weekId, adminId],
    );

    const result = await closeWeekPredictions(pool, weekId);

    const pred = await pool.query(
      "SELECT actual_delta, is_winner FROM predictions WHERE week_id = $1",
      [weekId],
    );
    const week = await pool.query("SELECT status, group_total_steps FROM weeks WHERE id = $1", [weekId]);

    expect(pred.rows[0].is_winner).toBe(true);
    expect(Number(pred.rows[0].actual_delta)).toBeGreaterThan(0);
    expect(week.rows[0].status).toBe("closed");
    expect(Number(week.rows[0].group_total_steps)).toBe(result.actualTotal);
    expect(result.winnerId).toBe(adminId);
  });
});
