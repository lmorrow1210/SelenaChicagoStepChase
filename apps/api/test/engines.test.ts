import { describe, expect, it } from "vitest";
import type { BingoTile } from "@selenas-chase/shared";
import { scorePredictions } from "../src/services/prediction.js";
import { countBingoLines, isBlackout, generateCard, evaluateDetector } from "../src/services/bingo.js";
import { decideDay, weekOutcome, pairPlayers } from "../src/services/nemesis.js";

describe("scorePredictions", () => {
  const t = (s: string) => new Date(s);
  it("winner = min delta", () => {
    const scored = scorePredictions(
      [
        { user_id: "a", predicted_steps: 90000, submitted_at: t("2026-06-08T10:00Z") },
        { user_id: "b", predicted_steps: 101000, submitted_at: t("2026-06-08T11:00Z") },
      ],
      100000,
    );
    expect(scored.find((s) => s.user_id === "b")!.is_winner).toBe(true);
    expect(scored.find((s) => s.user_id === "a")!.actual_delta).toBe(10000);
  });
  it("tie → earliest submitted_at wins; exactly one winner", () => {
    const scored = scorePredictions(
      [
        { user_id: "a", predicted_steps: 99000, submitted_at: t("2026-06-08T11:00Z") },
        { user_id: "b", predicted_steps: 101000, submitted_at: t("2026-06-08T10:00Z") },
      ],
      100000,
    );
    expect(scored.filter((s) => s.is_winner).map((s) => s.user_id)).toEqual(["b"]);
  });
});

function card(completeIdx: number[]): BingoTile[] {
  return Array.from({ length: 25 }, (_, i) =>
    i === 12
      ? ({ free: true, state: "complete" } as BingoTile)
      : ({ challenge_id: i, state: completeIdx.includes(i) ? "complete" : "incomplete" } as BingoTile),
  );
}

describe("bingo lines", () => {
  it("counts a row, a column, and free-space diagonal", () => {
    expect(countBingoLines(card([0, 1, 2, 3, 4]))).toBe(1); // top row
    expect(countBingoLines(card([2, 7, 17, 22]))).toBe(1); // col 2 (12 is free)
    expect(countBingoLines(card([0, 6, 18, 24]))).toBe(1); // main diagonal via free space
    expect(countBingoLines(card([0, 1, 2]))).toBe(0);
  });
  it("blackout requires all 25", () => {
    const all = card(Array.from({ length: 25 }, (_, i) => i));
    expect(isBlackout(all)).toBe(true);
    expect(countBingoLines(all)).toBe(12);
    expect(isBlackout(card([0, 1]))).toBe(false);
  });
});

describe("generateCard", () => {
  const pool = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    category: ["steps", "workout", "sleep", "heart", "social", "wildcard"][i % 6],
  }));
  it("25 tiles, free space at 12, 24 distinct challenges", () => {
    const tiles = generateCard(pool, () => 0.42);
    expect(tiles).toHaveLength(25);
    expect(tiles[12]).toEqual({ free: true, state: "complete" });
    const ids = tiles.filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t).map((t) => t.challenge_id);
    expect(new Set(ids).size).toBe(24);
  });
  it("balances categories (each appears exactly 4× with a 30/6 pool)", () => {
    const tiles = generateCard(pool, () => 0.42);
    const counts = new Map<string, number>();
    for (const t of tiles) {
      if (!("challenge_id" in t)) continue;
      const cat = pool.find((p) => p.id === t.challenge_id)!.category;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    expect([...counts.values()]).toEqual([4, 4, 4, 4, 4, 4]);
  });
});

describe("evaluateDetector", () => {
  const base = {
    steps: 10400,
    workouts: [{ start: "2026-06-11T06:30:00Z", duration_min: 30 }],
    sleep_minutes: 430,
    active_zone_minutes: 35,
    hr_zones: { fat_burn: 22, cardio: 9, peak: 0 },
  };
  it("covers the core detector shapes", () => {
    expect(evaluateDetector({ metric: "steps", op: ">=", value: 10000 }, base)).toBe(true);
    expect(evaluateDetector({ metric: "steps", op: ">=", value: 11000 }, base)).toBe(false);
    expect(evaluateDetector({ metric: "workouts", op: ">=", value: 1 }, base)).toBe(true);
    expect(evaluateDetector({ metric: "sleep_minutes", op: ">=", value: 420 }, base)).toBe(true);
    expect(evaluateDetector({ metric: "active_zone_minutes", op: ">=", value: 30 }, base)).toBe(true);
    expect(
      evaluateDetector({ metric: "hr_zone_minutes", zone: "fat_burn", op: ">=", value: 20 }, base),
    ).toBe(true);
    expect(
      evaluateDetector({ metric: "hr_zone_minutes", zone: "cardio", op: ">=", value: 1 }, base),
    ).toBe(true);
    expect(evaluateDetector({ metric: "workout_before", hour: 8 }, base)).toBe(true);
    expect(evaluateDetector({ metric: "daily_rank", op: "==", value: 1 }, { ...base, daily_rank: 1 })).toBe(true);
    expect(
      evaluateDetector({ metric: "rest_day_with_target" }, { ...base, workouts: [], hit_daily_target: true }),
    ).toBe(true);
    expect(
      evaluateDetector({ metric: "target_on_weekday", weekday: 1 }, { ...base, weekday: 1, hit_daily_target: true }),
    ).toBe(true);
  });
  it("unknown/un-evaluable metrics stay incomplete (false)", () => {
    expect(evaluateDetector({ metric: "nemesis_day_win" }, base)).toBe(false);
    expect(evaluateDetector({ metric: "steps_before", hour: 12, value: 7000 }, base)).toBe(false);
  });
});

describe("nemesis", () => {
  const d = (over: Partial<Parameters<typeof decideDay>[0]>) =>
    decideDay({
      date: "2026-06-08",
      a_steps: 0,
      b_steps: 0,
      a_target_hit_at: null,
      b_target_hit_at: null,
      ...over,
    });
  it("higher steps wins; tie → earlier target_hit_at; both null → tie", () => {
    expect(d({ a_steps: 9000, b_steps: 8000 }).winner).toBe("a");
    expect(
      d({
        a_steps: 9000,
        b_steps: 9000,
        a_target_hit_at: new Date("2026-06-08T18:00Z"),
        b_target_hit_at: new Date("2026-06-08T15:00Z"),
      }).winner,
    ).toBe("b");
    expect(d({ a_steps: 9000, b_steps: 9000, a_target_hit_at: new Date() }).winner).toBe("a");
    expect(d({ a_steps: 9000, b_steps: 9000 }).winner).toBe("tie");
  });
  it("weekOutcome → tiebreak on 5-day tie (Saturday sudden death)", () => {
    const w = (winners: ("a" | "b" | "tie")[]) =>
      weekOutcome(winners.map((x, i) => ({ date: `d${i}`, a_steps: 0, b_steps: 0, winner: x })));
    expect(w(["a", "a", "b", "a", "tie"])).toBe("a");
    expect(w(["a", "a", "b", "b", "tie"])).toBe("tiebreak");
  });
  it("pairPlayers: even → all paired, odd → one bye, nobody duplicated", () => {
    const even = pairPlayers(["1", "2", "3", "4"], () => 0.99);
    expect(even.pairs).toHaveLength(2);
    expect(even.bye).toBeNull();
    const odd = pairPlayers(["1", "2", "3", "4", "5"], () => 0.1);
    expect(odd.pairs).toHaveLength(2);
    expect(odd.bye).not.toBeNull();
    const all = [...odd.pairs.flat(), odd.bye!];
    expect(new Set(all).size).toBe(5);
  });
});
