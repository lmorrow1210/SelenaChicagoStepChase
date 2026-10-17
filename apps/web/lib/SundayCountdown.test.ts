import { describe, expect, it } from "vitest";
import { formatCountdown } from "./SundayCountdown";

const H = 3_600_000;
const M = 60_000;

describe("Sunday countdown urgency", () => {
  it("stays calm and day-based while more than a day remains", () => {
    expect(formatCountdown(2 * 24 * H + 5 * H)).toEqual({ text: "2d 5h", urgent: false });
    expect(formatCountdown(24 * H)).toEqual({ text: "1d 0h", urgent: false });
  });

  it("adds minutes and goes urgent inside the final day", () => {
    expect(formatCountdown(23 * H + 7 * M)).toEqual({ text: "23h 07m", urgent: true });
    expect(formatCountdown(H)).toEqual({ text: "1h 00m", urgent: true });
  });

  it("shows minutes only in the last hour and clamps at zero", () => {
    expect(formatCountdown(42 * M)).toEqual({ text: "42m", urgent: true });
    expect(formatCountdown(-5 * M)).toEqual({ text: "0m", urgent: true });
  });
});
