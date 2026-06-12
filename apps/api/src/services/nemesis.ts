import type { NemesisDayResult } from "@selenas-chase/shared";

// Nemesis daily winner (plan M6): higher steps wins the day; tie → earlier
// target_hit_at; both null (or equal) → tie carries.

export interface NemesisDayInput {
  date: string;
  a_steps: number;
  b_steps: number;
  a_target_hit_at: Date | null;
  b_target_hit_at: Date | null;
}

export function decideDay(d: NemesisDayInput): NemesisDayResult {
  let winner: "a" | "b" | "tie";
  if (d.a_steps !== d.b_steps) {
    winner = d.a_steps > d.b_steps ? "a" : "b";
  } else if (d.a_target_hit_at && d.b_target_hit_at) {
    winner =
      d.a_target_hit_at < d.b_target_hit_at
        ? "a"
        : d.b_target_hit_at < d.a_target_hit_at
          ? "b"
          : "tie";
  } else if (d.a_target_hit_at) {
    winner = "a";
  } else if (d.b_target_hit_at) {
    winner = "b";
  } else {
    winner = "tie";
  }
  return { date: d.date, a_steps: d.a_steps, b_steps: d.b_steps, winner };
}

export function tallyScore(results: NemesisDayResult[]): { score_a: number; score_b: number } {
  return {
    score_a: results.filter((r) => r.winner === "a").length,
    score_b: results.filter((r) => r.winner === "b").length,
  };
}

/**
 * Outcome after the Mon–Fri best-of-5. 'tiebreak' → Saturday sudden death
 * (flagged decision #2 in the plan).
 */
export function weekOutcome(results: NemesisDayResult[]): "a" | "b" | "tiebreak" {
  const { score_a, score_b } = tallyScore(results);
  if (score_a > score_b) return "a";
  if (score_b > score_a) return "b";
  return "tiebreak";
}

/** Monday random pairing; odd member count → last player gets a bye (null). */
export function pairPlayers(
  userIds: string[],
  rand: () => number = Math.random,
): { pairs: [string, string][]; bye: string | null } {
  const shuffled = [...userIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const pairs: [string, string][] = [];
  for (let i = 0; i + 1 < shuffled.length; i += 2) pairs.push([shuffled[i], shuffled[i + 1]]);
  return { pairs, bye: shuffled.length % 2 ? shuffled[shuffled.length - 1] : null };
}
