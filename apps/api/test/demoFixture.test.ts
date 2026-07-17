import { describe, expect, it } from "vitest";
import { demoResponse } from "../../web/lib/demo.js";

describe("demo current-week fixture", () => {
  it("matches the Week 1 Season One response shape", () => {
    const body = demoResponse<{
      city: { name: string };
      nextCity: { name: string };
      route: Array<{ name: string }>;
      seasonState: {
        season: { id: string; weekNumber: number; totalWeeks: number };
        chapter: { city: string; title: string; nextCity: string };
        chase: { remainingLead: number; finalOutcome: string | null };
        primaryAction: { id: string; priority: number };
      };
    }>("/api/weeks/current");

    expect(body).not.toBeNull();
    expect(body!.city.name).toBe("Chicago");
    expect(body!.nextCity.name).toBe("Detroit");
    expect(body!.route.slice(0, 2).map((city) => city.name)).toEqual(["Chicago", "Detroit"]);
    expect(body!.seasonState).toMatchObject({
      season: { id: "season_one", weekNumber: 1, totalWeeks: 13 },
      chapter: { city: "Chicago", title: "The Lakefront Job", nextCity: "Detroit" },
      primaryAction: { id: "continue_pursuit", priority: 10 },
    });
    expect(body!.seasonState.chase.remainingLead).toBe(9885);
    expect(body!.seasonState.chase.finalOutcome).toBeNull();
  });
});
