import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
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

describeDb("cities routes integration", () => {
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

  it("forbids unvisited cities, 404s unknown ones, and serves the trophy view once a week there is closed", async () => {
    const ownerId = await createUser("owner");
    const create = await request(ownerId, "/api/groups", {
      method: "POST",
      json: { name: "Trophy Hunters" },
    });
    expect(create.status).toBe(201);

    const cities = await pool.query(
      "SELECT id FROM cities ORDER BY route_order ASC",
    );
    const [firstCity, secondCity] = cities.rows;

    // Future city: no closed week there yet.
    const future = await request(ownerId, `/api/cities/${secondCity.id}`);
    expect(future.status).toBe(403);
    expect((await future.json()).error.code).toBe("FORBIDDEN");

    // Current city: active week doesn't count either.
    const current = await request(ownerId, `/api/cities/${firstCity.id}`);
    expect(current.status).toBe(403);

    // Unknown city id.
    const unknown = await request(ownerId, "/api/cities/9999");
    expect(unknown.status).toBe(404);

    // Close the week with results: 2 landmarks earned, owner is champion.
    const week = await pool.query(
      "SELECT id FROM weeks WHERE city_id = $1 LIMIT 1",
      [firstCity.id],
    );
    const weekId = week.rows[0].id;
    await pool.query(
      `UPDATE weeks SET status = 'closed', group_total_steps = 81234, target_hit = TRUE
       WHERE id = $1`,
      [weekId],
    );
    const landmarks = await pool.query(
      "SELECT id FROM landmarks WHERE city_id = $1 ORDER BY day ASC LIMIT 2",
      [firstCity.id],
    );
    for (const landmark of landmarks.rows) {
      await pool.query(
        `INSERT INTO city_unlocks (week_id, landmark_id, unlock_date, unlocked, triggering_user)
         VALUES ($1, $2, CURRENT_DATE, TRUE, $3)`,
        [weekId, landmark.id, ownerId],
      );
    }
    await pool.query(
      `INSERT INTO badges (user_id, badge_code, week_id, city_id, quality)
       VALUES ($1, 'city', $2, $3, 'bronze')`,
      [ownerId, weekId, firstCity.id],
    );

    const trophy = await request(ownerId, `/api/cities/${firstCity.id}`);
    expect(trophy.status).toBe(200);
    const body = await trophy.json();
    expect(body.city.id).toBe(firstCity.id);
    expect(body.week).toMatchObject({
      group_total_steps: 81234,
      target_hit: true,
    });
    expect(body.landmarks).toHaveLength(7);
    expect(body.unlocked_count).toBe(2);
    expect(body.landmarks.filter((l: { earned: boolean }) => l.earned)).toHaveLength(2);
    expect(body.champion).toMatchObject({
      user_id: ownerId,
      display_name: "Player owner",
      quality: "bronze",
    });
  });
});
