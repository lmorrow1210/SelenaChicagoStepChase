import { FREE_SPACE_INDEX, type BingoTile } from "@selenas-chase/shared";

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
    default:
      // steps_before / bedtime_before / weekend variants need intraday or
      // multi-night data — evaluated by dedicated callers later (M5 TODO)
      return false;
  }
}
