import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { app as expressApp } from "../src/index.js";
import type { pool as appPool } from "../src/db/pool.js";
import type { signSession as signSessionFn } from "../src/lib/session.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

let app: typeof expressApp;
let pool: typeof appPool;
let signSession: typeof signSessionFn;
let server: Server;
let baseUrl: string;
let counter = 0;

const cookieFor = (userId: string) => `sc_session=${signSession({ user_id: userId })}`;

/**
 * A group that just finished Week 13 (San Francisco) and looped back to an
 * active Week 1 — the shape the loop rollover produces. Only the finished
 * Week 13 case matters to the finale, plus an active week so
 * /api/weeks/current has a current week to hang the season state on.
 */
async function seedFinishedSeason() {
  counter += 1;
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code) VALUES ('Finale Crew', $1) RETURNING id`,
    [`FN${String(counter).padStart(4, "0")}`],
  );
  const groupId = g.rows[0].id as string;
  const u = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id, fitbit_connected, last_synced_at)
     VALUES ($1, $2, $3, $4, TRUE, now()) RETURNING id`,
    [`fin-${counter}`, `fin${counter}@example.test`, `Finalist ${counter}`, groupId],
  );
  const userId = u.rows[0].id as string;
  const sf = await pool.query(`SELECT id FROM cities WHERE route_order = 13`);
  const chicago = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const closed = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps, status,
                        group_total_steps, final_outcome, final_progress, base_progress,
                        remaining_lead, data_confidence, finalized_at, season_id, season_week_number)
     VALUES ($1, $2, '2026-08-24', '2026-08-30', 140000, 'closed',
             141000, 'interception', 1.0071, 1.0071, 0, 'verified', now(), 'season_one', 13)
     RETURNING id`,
    [groupId, sf.rows[0].id],
  );
  const active = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps, season_id, season_week_number)
     VALUES ($1, $2, '2026-08-31', '2026-09-06', 140000, 'season_one', 1)
     RETURNING id`,
    [groupId, chicago.rows[0].id],
  );
  return { groupId, userId, week13Id: closed.rows[0].id as string, week1Id: active.rows[0].id as string };
}

const post = (userId: string, body: unknown) =>
  fetch(`${baseUrl}/api/rituals/view`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieFor(userId) },
    body: JSON.stringify(body),
  });

const current = async (userId: string) => {
  const res = await fetch(`${baseUrl}/api/weeks/current`, { headers: { cookie: cookieFor(userId) } });
  return res.json();
};

describeDb("Season finale ritual", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);
    await resetDatabase(TEST_DATABASE_URL!);
    ({ app } = await import("../src/index.js"));
    ({ pool } = await import("../src/db/pool.js"));
    ({ signSession } = await import("../src/lib/session.js"));
    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await pool.end();
  });

  it("starts unseen, flips once the viewer records season_finale, and is per-viewer", async () => {
    const { userId, groupId, week13Id } = await seedFinishedSeason();
    const mate = await pool.query(
      `INSERT INTO users (google_sub, email, display_name, group_id, fitbit_connected, last_synced_at)
       VALUES ('fin-mate', 'fin-mate@example.test', 'Mate', $1, TRUE, now()) RETURNING id`,
      [groupId],
    );

    const before = await current(userId);
    expect(before.seasonState.previousCase).toMatchObject({
      weekNumber: 13,
      cityName: "San Francisco",
      finaleViewed: false,
    });

    const first = await post(userId, { week_id: week13Id, ritual_id: "season_finale" });
    expect(first.status).toBe(200);
    const again = await post(userId, { week_id: week13Id, ritual_id: "season_finale" });
    expect(again.status).toBe(200); // idempotent

    const after = await current(userId);
    expect(after.seasonState.previousCase.finaleViewed).toBe(true);
    // Case-closed and finale are tracked independently.
    expect(after.seasonState.previousCase.viewed).toBe(false);

    const mateView = await current(mate.rows[0].id as string);
    expect(mateView.seasonState.previousCase.finaleViewed).toBe(false);

    const rows = await pool.query(
      `SELECT COUNT(*)::int AS n FROM week_ritual_views WHERE week_id = $1 AND ritual_id = 'season_finale'`,
      [week13Id],
    );
    expect(rows.rows[0].n).toBe(1);
  });

  it("rejects the ritual for a week outside the viewer's group and unknown ritual ids", async () => {
    const mine = await seedFinishedSeason();
    const theirs = await seedFinishedSeason();
    const outside = await post(mine.userId, { week_id: theirs.week13Id, ritual_id: "season_finale" });
    expect(outside.status).toBe(404);
    const bogus = await post(mine.userId, { week_id: mine.week13Id, ritual_id: "season_two" });
    expect(bogus.status).toBe(422);
  });
});
