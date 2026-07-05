import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { app as expressApp } from "../src/index.js";
import type { pool as appPool } from "../src/db/pool.js";
import type { signSession as signSessionFn } from "../src/lib/session.js";
import type { processScoutTokens as processFn } from "../src/services/scoutService.js";
import type { createOrGetBingoCard as createCardFn } from "../src/services/bingoService.js";
import type { BingoTile } from "@one-step-ahead/shared";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type App = typeof expressApp;
type Pool = typeof appPool;
type SignSession = typeof signSessionFn;

let app: App;
let pool: Pool;
let signSession: SignSession;
let processScoutTokens: typeof processFn;
let createOrGetBingoCard: typeof createCardFn;
let server: Server;
let baseUrl: string;

function cookieFor(userId: string): string {
  return `sc_session=${signSession({ user_id: userId })}`;
}

async function createUser(label: string, groupId: string | null): Promise<string> {
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`, groupId],
  );
  return r.rows[0].id;
}

async function seed(memberCount = 3) {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code) VALUES ('Ops Test', 'OPSTST') RETURNING id`,
  );
  const groupId = g.rows[0].id as string;
  const users: string[] = [];
  for (let i = 0; i < memberCount; i++) users.push(await createUser(`ops${i}`, groupId));
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, '2026-06-01', '2026-06-07', 140000) RETURNING id`,
    [groupId, city.rows[0].id],
  );
  return { groupId, weekId: w.rows[0].id as string, users };
}

/** Give a user `lines` completed rows so the scout economy has tokens. */
async function setLines(weekId: string, userId: string, lines: number): Promise<void> {
  const card = await createOrGetBingoCard(pool, weekId, userId);
  const tiles: BingoTile[] = card.tiles.map((t) => ({ ...t }));
  for (let row = 0; row < Math.min(5, lines); row++) {
    for (let col = 0; col < 5; col++) {
      const t = tiles[row * 5 + col];
      if ("challenge_id" in t) tiles[row * 5 + col] = { ...t, state: "complete" };
    }
  }
  await pool.query(
    `UPDATE bingo_cards SET tiles = $1, bingo_lines = $2 WHERE week_id = $3 AND user_id = $4`,
    [JSON.stringify(tiles), lines, weekId, userId],
  );
}

async function request(userId: string, path: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    headers: { "content-type": "application/json", cookie: cookieFor(userId) },
  });
}

interface IntelNode {
  id: number;
  name: string;
  fun_fact: string | null;
  unlocked: boolean;
}

describeDb("M10 fieldops routes integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);

    ({ app } = await import("../src/index.js"));
    ({ pool } = await import("../src/db/pool.js"));
    ({ signSession } = await import("../src/lib/session.js"));
    ({ processScoutTokens } = await import("../src/services/scoutService.js"));
    ({ createOrGetBingoCard } = await import("../src/services/bingoService.js"));

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

  it("GET /api/fieldops keeps locked intel encrypted (no fun_fact leak)", async () => {
    const { groupId, weekId, users } = await seed(3);
    await setLines(weekId, users[0], 5);
    await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-01");

    const res = await request(users[0], "/api/fieldops");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { intel: IntelNode[]; card: { tiles: unknown[] } };

    expect(body.card.tiles).toHaveLength(25);
    const unlocked = body.intel.filter((n) => n.unlocked);
    const locked = body.intel.filter((n) => !n.unlocked);
    expect(unlocked.length).toBe(1);
    expect(locked.length).toBeGreaterThan(0);
    // Decoded landmark carries its reward; encrypted ones never do.
    for (const n of unlocked) expect(n.fun_fact).toBeTruthy();
    for (const n of locked) expect(n.fun_fact).toBeNull();
  });

  it("GET /api/fieldops/dossier serves own + teammate dossiers, encrypts un-carded slots", async () => {
    const { groupId, weekId, users } = await seed(3);
    await setLines(weekId, users[0], 5);
    await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-01");

    // Own dossier: the scout holds one intel card.
    const own = await request(users[0], "/api/fieldops/dossier");
    expect(own.status).toBe(200);
    const ownBody = (await own.json()) as {
      owner: { id: string };
      cards: { landmark_id: number; fun_fact: string | null }[];
      cities: { id: number; landmark_id: number; fun_fact: string | null }[];
    };
    expect(ownBody.owner.id).toBe(users[0]);
    expect(ownBody.cards).toHaveLength(1);
    expect(ownBody.cards[0].fun_fact).toBeTruthy();

    // Catalogue slots only reveal fun facts the owner actually carded.
    const cardedIds = new Set(ownBody.cards.map((c) => c.landmark_id));
    for (const slot of ownBody.cities) {
      if (cardedIds.has(slot.landmark_id)) expect(slot.fun_fact).toBeTruthy();
      else expect(slot.fun_fact).toBeNull();
    }

    // Catalogue scope: only the chase so far — the seeded week's city plus
    // the recon city one ahead. The rest of the route stays off the page.
    const seededWeekCity = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
    const reconCity = await pool.query(`SELECT id FROM cities WHERE route_order = 2`);
    const totalCities = await pool.query(`SELECT COUNT(*)::int AS n FROM cities`);
    const catalogueCityIds = [...new Set(ownBody.cities.map((slot) => slot.id))].sort();
    expect(catalogueCityIds).toEqual(
      [seededWeekCity.rows[0].id, reconCity.rows[0].id].sort(),
    );
    expect(totalCities.rows[0].n).toBeGreaterThan(2); // scope actually filtered

    // A teammate in the same group can read it via ?user_id=.
    const teammate = await request(users[1], `/api/fieldops/dossier?user_id=${users[0]}`);
    expect(teammate.status).toBe(200);
    const teammateBody = (await teammate.json()) as { owner: { id: string }; cards: unknown[] };
    expect(teammateBody.owner.id).toBe(users[0]);
    expect(teammateBody.cards).toHaveLength(1);
  });

  it("GET /api/fieldops/dossier refuses dossiers outside the viewer's group", async () => {
    const { users } = await seed(2);

    // A rival group's operative...
    const g2 = await pool.query(
      `INSERT INTO groups (name, invite_code) VALUES ('Rival Bureau', 'RIVAL1') RETURNING id`,
    );
    const outsider = await createUser("outsider", g2.rows[0].id as string);
    // ...and a drifting user with no group at all.
    const groupless = await createUser("groupless", null);

    const cross = await request(outsider, `/api/fieldops/dossier?user_id=${users[0]}`);
    expect(cross.status).toBe(403);

    const drifting = await request(groupless, `/api/fieldops/dossier?user_id=${users[0]}`);
    expect(drifting.status).toBe(403);

    // Unknown target is a 404/500-free, clean not-found.
    const ghost = await request(
      users[0],
      `/api/fieldops/dossier?user_id=00000000-0000-0000-0000-000000000000`,
    );
    expect(ghost.status).toBe(404);
  });
});
