import { describe, expect, it } from "vitest";
import { MockFitbitClient } from "../src/services/fitbitClient.js";

describe("MockFitbitClient", () => {
  it("is deterministic for the same user+date", async () => {
    const c = new MockFitbitClient();
    const a = await c.fetchDay("u-1", "2026-06-11");
    const b = await c.fetchDay("u-1", "2026-06-11");
    expect(a).toEqual(b);
  });

  it("varies across users and dates", async () => {
    const c = new MockFitbitClient();
    const a = await c.fetchDay("u-1", "2026-06-11");
    const b = await c.fetchDay("u-2", "2026-06-11");
    const d = await c.fetchDay("u-1", "2026-06-12");
    expect([b.steps, d.steps]).not.toEqual([a.steps, a.steps]);
  });

  it("returns plausible ranges and honors overrides", async () => {
    const c = new MockFitbitClient();
    const m = await c.fetchDay("u-3", "2026-06-11");
    expect(m.steps).toBeGreaterThanOrEqual(4000);
    expect(m.steps).toBeLessThan(13000);

    const fixture = {
      steps: 10400,
      workouts: [],
      sleep_minutes: 420,
      bedtime: null,
      active_zone_minutes: 0,
      hr_zones: null,
    };
    c.set("u-3", "2026-06-11", fixture);
    expect(await c.fetchDay("u-3", "2026-06-11")).toEqual(fixture);
  });
});
