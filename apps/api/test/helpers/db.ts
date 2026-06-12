import { readFile, readdir } from "node:fs/promises";
import pg from "pg";

const MIGRATIONS_URL = new URL("../../src/db/migrations/", import.meta.url);

/**
 * Drop and rebuild the public schema, then apply every migration in order.
 * Shared by all integration suites so new migrations are picked up
 * automatically.
 */
export async function resetDatabase(connectionString: string): Promise<void> {
  const resetPool = new pg.Pool({ connectionString });
  try {
    await resetPool.query("DROP SCHEMA public CASCADE");
    await resetPool.query("CREATE SCHEMA public");
    const files = (await readdir(MIGRATIONS_URL)).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      await resetPool.query(await readFile(new URL(file, MIGRATIONS_URL), "utf8"));
    }
  } finally {
    await resetPool.end();
  }
}
