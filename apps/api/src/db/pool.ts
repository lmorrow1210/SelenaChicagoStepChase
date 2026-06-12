import pg from "pg";

// Return DATE columns as 'YYYY-MM-DD' strings instead of local-midnight Date
// objects. The whole codebase treats calendar dates as strings; the default
// Date parsing silently broke string comparisons (e.g. the prediction
// submission window) and date arithmetic on row values.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
