import { describe, expect, it } from "vitest";
import { getCityIcon } from "@one-step-ahead/design-system/components/game/CityBadge";
import { SEASON_ONE_CONFIG } from "@one-step-ahead/shared/season-one/seasonOne";

describe("city landmark icons", () => {
  it("every Season One city has its own landmark silhouette (no blank postcards)", () => {
    const missing = SEASON_ONE_CONFIG.route
      .filter((week) => !getCityIcon(week.cityName))
      .map((week) => week.cityName);
    expect(missing).toEqual([]);
  });
});
