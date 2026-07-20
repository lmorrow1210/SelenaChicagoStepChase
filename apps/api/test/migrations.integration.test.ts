import { readFile } from "node:fs/promises";
import { resetDatabase } from "./helpers/db.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;
const MIGRATIONS_URL = new URL("../src/db/migrations/", import.meta.url);

let pool: typeof appPool;

describeDb("full migration integrity", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);
    ({ pool } = await import("../src/db/pool.js"));
  });

  afterAll(async () => {
    await pool.end();
  });

  it("builds the final schema and seed state from migrations 001 through 011", async () => {
    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name`,
    );
    expect(tables.rows.map((row) => row.table_name)).toEqual(expect.arrayContaining([
      "badge_definitions",
      "bingo_cards",
      "bingo_challenge_definitions",
      "beat_definitions",
      "beat_events",
      "cities",
      "city_unlocks",
      "groups",
      "intel_cards",
      "landmarks",
      "nemesis_matchups",
      "notifications",
      "predictions",
      "step_logs",
      "tile_gifts",
      "users",
      "week_ritual_views",
      "weeks",
    ]));

    const cityRows = await pool.query<{ route_order: number; name: string }>(
      `SELECT route_order, name FROM cities ORDER BY route_order`,
    );
    expect(cityRows.rows.map((row) => row.name)).toEqual([
      "Chicago",
      "Detroit",
      "Pittsburgh",
      "Washington, D.C.",
      "Philadelphia",
      "New York City",
      "Boston",
      "Savannah",
      "New Orleans",
      "Austin",
      "Santa Fe",
      "Los Angeles",
      "San Francisco",
    ]);

    const counts = await pool.query<{
      cities: string;
      landmarks: string;
      bingo_challenges: string;
      beat_definitions: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM cities) AS cities,
         (SELECT COUNT(*) FROM landmarks) AS landmarks,
         (SELECT COUNT(*) FROM bingo_challenge_definitions) AS bingo_challenges,
         (SELECT COUNT(*) FROM beat_definitions) AS beat_definitions`,
    );
    expect(counts.rows[0]).toMatchObject({
      cities: "13",
      landmarks: "65",
      bingo_challenges: "72",
      beat_definitions: "16",
    });

    const weekStatusCheck = await pool.query<{ definition: string }>(
      `SELECT pg_get_constraintdef(oid) AS definition
       FROM pg_constraint
       WHERE conname = 'weeks_status_check'`,
    );
    expect(weekStatusCheck.rows[0]?.definition).toContain("scheduled");
  });

  it("can re-run drift-fix migrations 010 and 011 without changing final values", async () => {
    const before = await landmarkSnapshot();
    await pool.query(await readFile(new URL("010_detroit_landmarks_sync.sql", MIGRATIONS_URL), "utf8"));
    await pool.query(await readFile(new URL("011_weeks_03_13_landmarks_sync.sql", MIGRATIONS_URL), "utf8"));
    const after = await landmarkSnapshot();

    expect(after).toEqual(before);
    expect(after).toHaveLength(60);
    expect(after.find((row) => row.route_order === 2 && row.day === 1)).toMatchObject({
      name: "Michigan Central Station",
      fun_fact: "Abandoned for nearly thirty years, it reopened in 2024 after a landmark restoration led by Ford.",
    });
    expect(after.find((row) => row.route_order === 13 && row.day === 5)).toMatchObject({
      name: "San Francisco Cable Cars",
    });
    expect(after.find((row) => row.route_order === 13 && row.day === 5)?.fun_fact).toContain("moving national landmark");
  });
});

async function landmarkSnapshot() {
  const rows = await pool.query<{
    route_order: number;
    day: number;
    name: string;
    fun_fact: string;
  }>(
    `SELECT c.route_order, l.day, l.name, l.fun_fact
     FROM landmarks l
     JOIN cities c ON c.id = l.city_id
     WHERE c.route_order BETWEEN 2 AND 13
     ORDER BY c.route_order, l.day`,
  );
  return rows.rows;
}
