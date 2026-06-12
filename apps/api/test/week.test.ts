import { describe, expect, it } from "vitest";
import { weekMonday, weekSunday } from "../src/services/week.js";

const CHI = "America/Chicago";

describe("weekMonday / weekSunday", () => {
  it("mid-week date maps to its Monday", () => {
    // Thu 2026-06-11 in Chicago
    expect(weekMonday(new Date("2026-06-11T18:00:00Z"), CHI)).toBe("2026-06-08");
  });

  it("Monday maps to itself; Sunday maps back to the prior Monday", () => {
    expect(weekMonday(new Date("2026-06-08T12:00:00Z"), CHI)).toBe("2026-06-08");
    expect(weekMonday(new Date("2026-06-14T12:00:00Z"), CHI)).toBe("2026-06-08");
  });

  it("respects the group timezone across the date line", () => {
    // 2026-06-08 01:00 UTC is still Sunday 2026-06-07 in Chicago,
    // but already Monday 2026-06-08 in Tokyo.
    const t = new Date("2026-06-08T01:00:00Z");
    expect(weekMonday(t, CHI)).toBe("2026-06-01");
    expect(weekMonday(t, "Asia/Tokyo")).toBe("2026-06-08");
  });

  it("weekSunday is Monday + 6 days, across month ends", () => {
    expect(weekSunday("2026-06-08")).toBe("2026-06-14");
    expect(weekSunday("2026-06-29")).toBe("2026-07-05");
  });
});
