import { describe, expect, it } from "vitest";
import { calculateWeeklyPhase, type WeeklyPhaseInput } from "@one-step-ahead/shared/season-one/weeklyPhase";

const baseInput = (): WeeklyPhaseInput => ({
  startsOn: "2026-06-08",
  endsOn: "2026-06-14",
  timezone: "America/Chicago",
  weekStatus: "active",
  finalOutcome: null,
  finalizedAt: null,
  dataConfidence: "verified",
  briefingViewed: true,
  midweekViewed: true,
  finalPushViewed: true,
  suddenDeathActive: false,
  now: new Date("2026-06-09T15:00:00Z"),
});

describe("calculateWeeklyPhase", () => {
  it("returns briefing on Monday until the briefing is viewed", () => {
    const result = calculateWeeklyPhase({
      ...baseInput(),
      briefingViewed: false,
      now: new Date("2026-06-08T15:00:00Z"),
    });

    expect(result).toEqual({ phase: "briefing", shouldShowModal: "monday_briefing" });
  });

  it("returns active after the Monday briefing is viewed", () => {
    const result = calculateWeeklyPhase({
      ...baseInput(),
      briefingViewed: true,
      now: new Date("2026-06-08T15:00:00Z"),
    });

    expect(result).toEqual({ phase: "active", shouldShowModal: null });
  });

  it("returns midweek_update from Wednesday noon until Friday morning", () => {
    expect(calculateWeeklyPhase({
      ...baseInput(),
      midweekViewed: false,
      now: new Date("2026-06-10T16:59:00Z"),
    }).phase).toBe("active");

    expect(calculateWeeklyPhase({
      ...baseInput(),
      midweekViewed: false,
      now: new Date("2026-06-10T17:00:00Z"),
    })).toEqual({ phase: "midweek_update", shouldShowModal: "midweek_update" });

    expect(calculateWeeklyPhase({
      ...baseInput(),
      midweekViewed: true,
      now: new Date("2026-06-12T12:59:00Z"),
    })).toEqual({ phase: "midweek_update", shouldShowModal: null });
  });

  it("returns final_push from Friday 8 AM local through Sunday cutoff", () => {
    expect(calculateWeeklyPhase({
      ...baseInput(),
      finalPushViewed: false,
      now: new Date("2026-06-12T13:00:00Z"),
    })).toEqual({ phase: "final_push", shouldShowModal: "final_push" });

    expect(calculateWeeklyPhase({
      ...baseInput(),
      finalPushViewed: true,
      now: new Date("2026-06-14T20:00:00Z"),
    })).toEqual({ phase: "final_push", shouldShowModal: null });
  });

  it("returns sudden_death on Saturday when nemesis tiebreak is active", () => {
    expect(calculateWeeklyPhase({
      ...baseInput(),
      suddenDeathActive: true,
      now: new Date("2026-06-13T18:00:00Z"),
    })).toEqual({ phase: "sudden_death", shouldShowModal: null });
  });

  it("returns case_closing at Sunday 11:59 PM local and while recalculating", () => {
    expect(calculateWeeklyPhase({
      ...baseInput(),
      now: new Date("2026-06-15T04:59:00Z"),
    })).toEqual({ phase: "case_closing", shouldShowModal: null });

    expect(calculateWeeklyPhase({
      ...baseInput(),
      dataConfidence: "recalculating",
      now: new Date("2026-06-10T15:00:00Z"),
    })).toEqual({ phase: "case_closing", shouldShowModal: null });
  });

  it("returns case_closed after the final outcome exists", () => {
    expect(calculateWeeklyPhase({
      ...baseInput(),
      weekStatus: "closed",
      finalOutcome: "close_encounter",
      finalizedAt: new Date("2026-06-15T05:10:00Z"),
      caseClosedViewed: false,
      now: new Date("2026-06-15T06:00:00Z"),
    })).toEqual({ phase: "case_closed", shouldShowModal: "case_closed" });
  });

  it("uses the group timezone for phase transitions", () => {
    const chicago = calculateWeeklyPhase({
      ...baseInput(),
      timezone: "America/Chicago",
      briefingViewed: false,
      now: new Date("2026-06-08T05:30:00Z"),
    });
    const losAngeles = calculateWeeklyPhase({
      ...baseInput(),
      timezone: "America/Los_Angeles",
      briefingViewed: false,
      now: new Date("2026-06-08T05:30:00Z"),
    });

    expect(chicago.phase).toBe("briefing");
    expect(losAngeles.phase).toBe("active");
  });
});
