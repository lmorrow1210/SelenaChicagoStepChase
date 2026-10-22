import { readFile, readdir } from "node:fs/promises";
import { resetDatabase } from "./helpers/db.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;
const CITIES_URL = new URL("../../../docs/canon/cities/", import.meta.url);

let pool: typeof appPool;

interface LandmarkPackRow {
  route_order: number;
  day: number;
  name: string;
  fun_fact: string;
  fileName: string;
}

function parseLandmarkRows(fileName: string, text: string): LandmarkPackRow[] {
  const week = Number(fileName.match(/^week-(\d{2})-/)?.[1] ?? 0);
  const rows: LandmarkPackRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    if (/^\|\s*-/.test(line) || /\|\s*Day\s*\|/.test(line)) continue;

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const day = Number(cells[0]);
    if (!Number.isInteger(day) || cells.length < 3) continue;

    rows.push({
      route_order: week,
      day,
      name: cells[1],
      fun_fact: cells.slice(2).join("|").trim(),
      fileName,
    });
  }
  return rows;
}

async function readLandmarkPacks(): Promise<LandmarkPackRow[]> {
  const files = (await readdir(CITIES_URL)).filter((file) => /^week-\d{2}-.*\.md$/.test(file)).sort();
  const rows: LandmarkPackRow[] = [];
  for (const file of files) {
    rows.push(...parseLandmarkRows(file, await readFile(new URL(file, CITIES_URL), "utf8")));
  }
  return rows.sort((a, b) => a.route_order - b.route_order || a.day - b.day);
}

describeDb("landmark pack to database drift guard", () => {
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

  it("keeps every finalized city-pack landmark table synced to migrated DB rows", async () => {
    const expected = await readLandmarkPacks();
    expect(expected).toHaveLength(60);

    const actualRows = await pool.query<{
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

    const actual = new Map(
      actualRows.rows.map((row) => [`${row.route_order}:${row.day}`, row]),
    );
    const mismatches: string[] = [];

    for (const row of expected) {
      const key = `${row.route_order}:${row.day}`;
      const dbRow = actual.get(key);
      if (!dbRow) {
        mismatches.push(`${key} missing from DB (${row.fileName})`);
        continue;
      }
      if (dbRow.name !== row.name || dbRow.fun_fact !== row.fun_fact) {
        mismatches.push(
          `${key} drift (${row.fileName}) expected "${row.name}" / "${row.fun_fact}" but DB has "${dbRow.name}" / "${dbRow.fun_fact}"`,
        );
      }
    }

    for (const row of actualRows.rows) {
      const key = `${row.route_order}:${row.day}`;
      if (!expected.some((packRow) => `${packRow.route_order}:${packRow.day}` === key)) {
        mismatches.push(`${key} present in DB but missing from packs`);
      }
    }

    expect(mismatches).toEqual([]);
  });
});
