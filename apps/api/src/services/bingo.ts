import { FREE_SPACE_INDEX, type BingoTile } from "@one-step-ahead/shared";

// Bingo engine (plan M5): line detection over a 5×5 row-major card
// (5 rows + 5 cols + 2 diagonals) and detector-JSON evaluation.

const LINES: number[][] = [
  ...Array.from({ length: 5 }, (_, r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)), // rows
  ...Array.from({ length: 5 }, (_, c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)), // cols
  [0, 6, 12, 18, 24],
  [4, 8, 16, 20, 12].sort((a, b) => a - b), // anti-diagonal 4,8,12,16,20
];

export function countBingoLines(tiles: BingoTile[]): number {
  return LINES.filter((line) => line.every((i) => tiles[i].state === "complete")).length;
}

export function isBlackout(tiles: BingoTile[]): boolean {
  return tiles.every((t) => t.state === "complete");
}

/**
 * Deterministic PRNG from a string seed (mulberry32 over an FNV-1a hash).
 * M10: the weekly card is a SHARED base — every teammate generating from
 * the same week id gets the same 25-tile draw + layout (addendum §4).
 */
export function seededRand(seed: string): () => number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * M10 accessibility substitutions (addendum §4/§7C): swap tiles whose
 * category is excluded (group admin toggle or player prefs) for eligible
 * alternatives, deterministically per player. The card stays a shared base
 * with personal substitutions layered on.
 */
export function substituteExcluded(
  tiles: BingoTile[],
  pool: { id: number; category: string }[],
  excludedCategories: Set<string>,
  rand: () => number,
): BingoTile[] {
  if (!excludedCategories.size) return tiles;
  const byId = new Map(pool.map((c) => [c.id, c]));
  const onCard = new Set(
    tiles.filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t)
      .map((t) => t.challenge_id),
  );
  const eligible = pool.filter((c) => !excludedCategories.has(c.category) && !onCard.has(c.id));
  // deterministic shuffle of the replacement queue
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }
  return tiles.map((t) => {
    if (!("challenge_id" in t)) return t;
    const cat = byId.get(t.challenge_id)?.category;
    if (!cat || !excludedCategories.has(cat)) return t;
    const sub = eligible.pop();
    if (!sub) return t; // pool exhausted — keep original rather than break the card
    return { challenge_id: sub.id, state: "incomplete" as const };
  });
}

/**
 * Generate a 25-tile card: 24 distinct challenge ids + free space at index 12.
 * Category-balanced sampling: round-robin across categories until 24 picked.
 */
export function generateCard(
  pool: { id: number; category: string }[],
  rand: () => number = Math.random,
): BingoTile[] {
  const byCat = new Map<string, { id: number }[]>();
  for (const c of pool) {
    const list = byCat.get(c.category) ?? [];
    list.push(c);
    byCat.set(c.category, list);
  }
  // shuffle within each category
  for (const list of byCat.values()) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
  const cats = [...byCat.keys()];
  const picked: number[] = [];
  let ci = 0;
  while (picked.length < 24) {
    const list = byCat.get(cats[ci % cats.length]);
    const next = list?.pop();
    if (next) picked.push(next.id);
    ci++;
    if (ci > cats.length * 50) throw new Error("challenge pool too small for a 24-tile card");
  }
  // shuffle final placement
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  const tiles: BingoTile[] = picked.map((id) => ({
    challenge_id: id,
    state: "incomplete" as const,
  }));
  tiles.splice(FREE_SPACE_INDEX, 0, { free: true, state: "complete" });
  return tiles;
}

// ---- detector evaluation ----

export interface DetectorContext {
  // day-scoped metrics for the user
  steps: number;
  workouts: { start: string; duration_min: number }[];
  sleep_minutes: number | null;
  active_zone_minutes: number | null;
  hr_zones: Record<string, number> | null;
  // wider context, supplied by callers when available
  daily_target_streak?: number;
  group_week_steps?: number;
  nemesis_day_win?: boolean;
  daily_rank?: number;
  hot_pursuit?: boolean;
  weekday?: number; // 1 = Monday … 7 = Sunday (ISO)
  hit_daily_target?: boolean;
  // intraday + multi-night context (M11)
  steps_by_hour?: number[] | null; // 24 hourly buckets; null = no intraday data
  workout_day_streak?: number; // consecutive days ending today with ≥1 workout
  week_sleep_minutes?: (number | null)[]; // sleep_minutes per synced night this week
  // per synced night this week: wake-up log_date (YYYY-MM-DD) + bedtime
  // instant (group-local expressed as Z, same convention as workout_before)
  week_bedtimes?: { date: string; bedtime: string | null }[];
}

function cmp(op: string, a: number, b: number): boolean {
  switch (op) {
    case ">=":
      return a >= b;
    case "==":
      return a === b;
    case "<=":
      return a <= b;
    default:
      return false;
  }
}

/**
 * Evaluate one detector JSON against a day context. Returns true if the
 * challenge is satisfied. Unknown/un-evaluable metrics return false (tile
 * simply stays incomplete — e.g. nemesis detectors before M6 lands).
 */
export function evaluateDetector(detector: Record<string, any>, ctx: DetectorContext): boolean {
  const { metric, op = ">=", value = 1 } = detector;
  switch (metric) {
    case "steps":
      return cmp(op, ctx.steps, value);
    case "workouts": {
      // window 'day' vs 'week' is the caller's responsibility: pass the
      // workouts for the relevant window in ctx.workouts.
      return cmp(op, ctx.workouts.length, value);
    }
    case "active_zone_minutes":
      return ctx.active_zone_minutes != null && cmp(op, ctx.active_zone_minutes, value);
    case "sleep_minutes":
      // weekend variant: a night belongs to the day it ends on (wake-up
      // morning), so "a weekend night" = the log for Saturday or Sunday.
      if (detector.window === "weekend_day" && ctx.weekday !== 6 && ctx.weekday !== 7) {
        return false;
      }
      return ctx.sleep_minutes != null && cmp(op, ctx.sleep_minutes, value);
    case "hr_zone_minutes":
      return ctx.hr_zones != null && cmp(op, ctx.hr_zones[detector.zone] ?? 0, value);
    case "workout_before":
      return ctx.workouts.some(
        (w) => new Date(w.start).getUTCHours() < detector.hour, // caller passes group-local times
      );
    case "daily_target_streak":
      return ctx.daily_target_streak != null && cmp(op, ctx.daily_target_streak, value);
    case "group_week_steps":
      return ctx.group_week_steps != null && cmp(op, ctx.group_week_steps, value);
    case "nemesis_day_win":
      return ctx.nemesis_day_win === true;
    case "daily_rank":
      return ctx.daily_rank != null && cmp(op, ctx.daily_rank, value);
    case "hot_pursuit":
      return ctx.hot_pursuit === true;
    case "rest_day_with_target":
      return ctx.workouts.length === 0 && ctx.hit_daily_target === true;
    case "target_on_weekday":
      return ctx.weekday === detector.weekday && ctx.hit_daily_target === true;
    case "workout_duration":
      // M10 fine variant: any single workout of at least N minutes
      return ctx.workouts.some((w) => cmp(op, w.duration_min, value));
    case "steps_before": {
      // M11 intraday: steps logged in local hours [0, detector.hour).
      // Null buckets = intraday unavailable — stay incomplete, never false-fire.
      if (!ctx.steps_by_hour) return false;
      const sum = ctx.steps_by_hour.slice(0, detector.hour).reduce((a, b) => a + b, 0);
      return cmp(op, sum, value);
    }
    case "steps_after": {
      // M11 intraday: steps logged in local hours [detector.hour, 24).
      if (!ctx.steps_by_hour) return false;
      const sum = ctx.steps_by_hour.slice(detector.hour).reduce((a, b) => a + b, 0);
      return cmp(op, sum, value);
    }
    case "workout_day_streak":
      // consecutive days (ending today) with at least one workout
      return ctx.workout_day_streak != null && cmp(op, ctx.workout_day_streak, value);
    case "sleep_nights": {
      // N nights this week with at least `hours` of sleep
      if (!ctx.week_sleep_minutes) return false;
      const need = (detector.hours ?? 7) * 60;
      const nights = ctx.week_sleep_minutes.filter((m) => m != null && m >= need).length;
      return cmp(op, nights, value);
    }
    case "bedtime_before": {
      // Product rule (confirmed 2026-07-16): a night counts as "in bed
      // before {hour}" ONLY when bedtime falls in the EVENING of the
      // previous calendar day — 18:00–23:59 on the day before the wake-up
      // log date. A post-midnight bedtime (1 AM, 2 AM, …) always fails the
      // night, no exceptions; so does an afternoon outlier (nap/bad data).
      // detector.nights = how many qualifying nights this week are needed.
      if (!ctx.week_bedtimes) return false;
      const cutoff = detector.hour ?? 23;
      const nights = ctx.week_bedtimes.filter((n) => {
        if (!n.bedtime) return false;
        const bed = new Date(n.bedtime);
        const prevDay = new Date(new Date(`${n.date}T00:00:00Z`).getTime() - 86_400_000)
          .toISOString()
          .slice(0, 10);
        const hour = bed.getUTCHours();
        return bed.toISOString().slice(0, 10) === prevDay && hour >= 18 && hour < cutoff;
      }).length;
      return cmp(op, nights, detector.nights ?? 1);
    }
    case "honor":
      // Honor-system tiles never auto-complete — only the explicit
      // self-report endpoint (scoutService.honorComplete) marks them.
      return false;
    default:
      // Unknown metrics stay incomplete rather than false-fire.
      return false;
  }
}
