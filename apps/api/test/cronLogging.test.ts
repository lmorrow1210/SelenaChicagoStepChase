import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { describeError } from "../src/services/cron.js";

describe("cron error logging", () => {
  it("logs only the message of an Error", () => {
    const err = Object.assign(new Error("duplicate key value violates unique constraint"), {
      detail: "Key (user_id, day)=(abc, 2026-11-09) already exists; steps=12345",
    });
    expect(describeError(err)).toBe("duplicate key value violates unique constraint");
    expect(describeError(err)).not.toContain("12345");
  });

  it("stringifies non-Error throws instead of passing objects through", () => {
    expect(describeError("boom")).toBe("boom");
    expect(describeError({ token: "secret" })).toBe("[object Object]");
  });

  it("never passes a bare error value to console in cron.ts", async () => {
    const source = await readFile(new URL("../src/services/cron.ts", import.meta.url), "utf8");
    const calls = source.match(/console\.(error|warn)\([\s\S]*?\);/g) ?? [];
    expect(calls.length).toBeGreaterThan(5);
    for (const call of calls) {
      expect(call).not.toMatch(/,\s*err\s*,?\s*\)/);
    }
  });
});
