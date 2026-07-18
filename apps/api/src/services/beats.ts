import type { Pool, PoolClient } from "pg";
import type { DataConfidence } from "@one-step-ahead/shared";
import { calculateDataConfidence } from "@one-step-ahead/shared/season-one/dataConfidence";
import { seededRand } from "./bingo.js";
import { getSpecialOperationState } from "./specialOperations.js";
import { seasonWeekForRouteOrder } from "./evidenceService.js";

type Db = Pool | PoolClient;
type BeatScope = "user" | "group";
type BeatPhase = "day" | "week" | "reveal";

interface BeatDefinition {
  id: number;
  slug: string;
  trigger: Record<string, any>;
  scope: BeatScope;
  variants: string[];
  cooldown_days: number;
  priority: number;
}

interface BeatContext {
  groupId: string;
  userId: string | null;
  weekId: string;
  date: string;
  city: string;
  groupDaySteps?: number;
  trailingGroupDailyAvg?: number;
  userSteps?: number;
  dailyTarget?: number;
  previousTargetStreak?: number;
  hitDailyTarget?: boolean;
  hotPursuitToday?: boolean;
  hotPursuitYesterday?: boolean;
  nemesisFlip?: boolean;
  nemesisName?: string;
  suddenDeathEve?: boolean;
  weekGap?: number;
  weekTotal?: number;
  weekTarget?: number;
  // Week 1 production subset (M14)
  dataConfidence?: DataConfidence;
  weekToDateSteps?: number;
  elapsedDay?: number; // 1 = Monday … 7 = Sunday of the active week
  groupLines?: number;
  specialOperationActive?: boolean;
  specialOperationEarnedBonus?: number;
  specialOperationMaxBonus?: number;
  firstLinePayoff?: string;
  operationLabel?: string;
}

/** Week-to-date pace vs an even daily split of the weekly target. */
function paceRatio(ctx: BeatContext): number | null {
  if (!ctx.weekTarget || !ctx.elapsedDay || ctx.weekToDateSteps == null) return null;
  const expected = ctx.weekTarget * (ctx.elapsedDay / 7);
  if (expected <= 0) return null;
  return ctx.weekToDateSteps / expected;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function milesFromSteps(steps: number): string {
  const miles = Math.max(1, Math.round(steps / 2000));
  return `${miles}`;
}

function render(template: string, params: Record<string, string | number | null | undefined>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => String(params[key] ?? ""));
}

function variantFor(beat: BeatDefinition, ctx: BeatContext): string {
  const variants = beat.variants.length ? beat.variants : [beat.slug];
  const rand = seededRand(`${beat.slug}:${ctx.weekId}:${ctx.userId ?? ctx.groupId}`);
  return variants[Math.floor(rand() * variants.length)] ?? variants[0];
}

function beatParams(ctx: BeatContext): Record<string, string | number> {
  return {
    city: ctx.city,
    gap: formatNumber(ctx.weekGap ?? 0),
    miles: milesFromSteps(ctx.trailingGroupDailyAvg && ctx.groupDaySteps != null
      ? Math.max(0, ctx.trailingGroupDailyAvg - ctx.groupDaySteps)
      : 0),
    nemesis: ctx.nemesisName ?? "your nemesis",
    n: ctx.previousTargetStreak ?? 0,
    first_line_payoff: ctx.firstLinePayoff ?? "The unit's first field lead is confirmed.",
    operation_label: ctx.operationLabel ?? "The special operation",
  };
}

export function evaluateBeatTrigger(trigger: Record<string, any>, ctx: BeatContext): boolean {
  // Trust gating: Selena performance commentary requires the confidence
  // levels the definition names (e.g. ["verified"]). Trust beats carry no
  // requirement and therefore always pass this check.
  const required = trigger.required_confidence;
  if (Array.isArray(required) && required.length) {
    if (!ctx.dataConfidence || !required.includes(ctx.dataConfidence)) return false;
  }

  switch (trigger.metric) {
    case "group_data_incomplete":
      return ctx.dataConfidence === "incomplete";
    case "result_recalculating":
      // Fired directly by the reconciliation path via fireBeatBySlug; it
      // never matches during ordinary day evaluation.
      return false;
    case "first_field_ops_line":
      return (ctx.groupLines ?? 0) >= 1;
    case "platform_sweep_started":
      return ctx.specialOperationActive === true;
    case "platform_sweep_completed":
      return (
        (ctx.specialOperationMaxBonus ?? 0) > 0 &&
        (ctx.specialOperationEarnedBonus ?? 0) >= (ctx.specialOperationMaxBonus ?? 0)
      );
    case "team_ahead_of_pace": {
      const pace = paceRatio(ctx);
      return pace != null && (ctx.elapsedDay ?? 0) >= 2 && pace >= Number(trigger.ratio ?? 1.15);
    }
    case "team_behind_pace": {
      const pace = paceRatio(ctx);
      return pace != null && (ctx.elapsedDay ?? 0) >= 3 && pace <= Number(trigger.ratio ?? 0.7);
    }
    case "group_comeback": {
      const pace = paceRatio(ctx);
      if (ctx.groupDaySteps == null || !ctx.trailingGroupDailyAvg) return false;
      return (
        pace != null &&
        pace < 1 &&
        ctx.groupDaySteps >= ctx.trailingGroupDailyAvg * Number(trigger.multiplier ?? 1.5)
      );
    }
    case "near_miss_week": {
      if (ctx.weekGap == null || ctx.weekTarget == null || ctx.weekTotal == null) return false;
      return ctx.weekGap > 0 && ctx.weekGap <= ctx.weekTarget * Number(trigger.pct ?? 0.05);
    }
    case "weak_day": {
      if (ctx.groupDaySteps == null || ctx.trailingGroupDailyAvg == null) return false;
      return ctx.trailingGroupDailyAvg > 0 && ctx.groupDaySteps < ctx.trailingGroupDailyAvg * Number(trigger.ratio ?? 0.6);
    }
    case "target_blowout": {
      if (ctx.userSteps == null || ctx.dailyTarget == null) return false;
      return ctx.dailyTarget > 0 && ctx.userSteps >= ctx.dailyTarget * Number(trigger.multiplier ?? 1.5);
    }
    case "hot_pursuit_streak":
      return ctx.hotPursuitToday === true && ctx.hotPursuitYesterday === true;
    case "nemesis_flip":
      return ctx.nemesisFlip === true;
    case "streak_broken":
      return (
        ctx.hitDailyTarget === false &&
        (ctx.previousTargetStreak ?? 0) >= Number(trigger.min_streak ?? 3)
      );
    case "sudden_death_eve":
      return ctx.suddenDeathEve === true;
    case "sunday_nemesis_reveal":
      return Boolean(ctx.nemesisName);
    default:
      return false;
  }
}

async function definitions(db: Db, phase: BeatPhase): Promise<BeatDefinition[]> {
  const rows = await db.query<BeatDefinition>(
    `SELECT id, slug, trigger, scope, variants, cooldown_days, priority
     FROM beat_definitions
     WHERE trigger->>'phase' = $1
     ORDER BY scope ASC, priority DESC, id ASC`,
    [phase],
  );
  return rows.rows.map((row) => ({
    ...row,
    variants: Array.isArray(row.variants) ? row.variants : [],
    cooldown_days: Number(row.cooldown_days),
    priority: Number(row.priority),
  }));
}

async function onCooldown(db: Db, beat: BeatDefinition, ctx: BeatContext): Promise<boolean> {
  const cutoff = addDays(ctx.date, -beat.cooldown_days);
  const prior = await db.query(
    `SELECT 1 FROM beat_events
     WHERE beat_id = $1
       AND group_id = $2
       AND user_id IS NOT DISTINCT FROM $3
       AND fired_on > $4::date
       AND fired_on < $5::date
     LIMIT 1`,
    [beat.id, ctx.groupId, ctx.userId, cutoff, ctx.date],
  );
  return Boolean(prior.rowCount);
}

async function fireBeat(db: Db, beat: BeatDefinition, ctx: BeatContext): Promise<boolean> {
  if (await onCooldown(db, beat, ctx)) return false;
  const rendered = render(variantFor(beat, ctx), beatParams(ctx));
  const inserted = await db.query(
    `INSERT INTO beat_events (beat_id, group_id, user_id, week_id, fired_on, rendered)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [beat.id, ctx.groupId, ctx.userId, ctx.weekId, ctx.date, rendered],
  );
  if (!inserted.rowCount) return false;

  if (beat.scope === "group") {
    await db.query(
      `INSERT INTO notifications (user_id, kind, message)
       SELECT id, 'beat', $2 FROM users WHERE group_id = $1`,
      [ctx.groupId, rendered],
    );
  } else if (ctx.userId) {
    await db.query(
      `INSERT INTO notifications (user_id, kind, message)
       VALUES ($1, 'beat', $2)`,
      [ctx.userId, rendered],
    );
  }
  return true;
}

async function groupHotPursuit(db: Db, groupId: string, date: string): Promise<boolean> {
  const row = await db.query(
    `SELECT COUNT(u.id)::int AS members,
            COUNT(u.id) FILTER (
              WHERE COALESCE(jsonb_array_length(sl.workouts), 0) > 0
            )::int AS with_workout
     FROM users u
     LEFT JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = $2::date
     WHERE u.group_id = $1`,
    [groupId, date],
  );
  return Number(row.rows[0]?.members ?? 0) > 0
    && Number(row.rows[0].members) === Number(row.rows[0].with_workout);
}

async function previousTargetStreak(db: Db, userId: string, beforeDate: string): Promise<number> {
  const row = await db.query(
    `WITH ordered AS (
       SELECT sl.log_date,
              sl.steps >= (u.weekly_step_target / 7.0) AS hit,
              ROW_NUMBER() OVER (ORDER BY sl.log_date DESC) AS rn
       FROM step_logs sl JOIN users u ON u.id = sl.user_id
       WHERE sl.user_id = $1 AND sl.log_date < $2::date
     )
     SELECT COUNT(*)::int AS streak
     FROM ordered
     WHERE hit
       AND rn < COALESCE((SELECT MIN(rn) FROM ordered WHERE NOT hit), 2147483647)`,
    [userId, beforeDate],
  );
  return Number(row.rows[0]?.streak ?? 0);
}

async function nemesisContext(
  db: Db,
  weekId: string,
  userId: string,
  date: string,
): Promise<{ nemesisFlip: boolean; suddenDeathEve: boolean; nemesisName: string | null }> {
  const matchup = await db.query(
    `SELECT nm.player_a, nm.player_b, nm.daily_results, nm.status,
            to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on,
            other_user.display_name AS nemesis_name
     FROM nemesis_matchups nm
     JOIN weeks w ON w.id = nm.week_id
     JOIN users other_user ON other_user.id = CASE WHEN nm.player_a = $2 THEN nm.player_b ELSE nm.player_a END
     WHERE nm.week_id = $1 AND (nm.player_a = $2 OR nm.player_b = $2)
     LIMIT 1`,
    [weekId, userId],
  );
  if (!matchup.rowCount) return { nemesisFlip: false, suddenDeathEve: false, nemesisName: null };

  const row = matchup.rows[0];
  const mySide = row.player_a === userId ? "a" : "b";
  const otherSide = mySide === "a" ? "b" : "a";
  const results = row.daily_results as { date: string; winner: "a" | "b" | "tie" }[];
  const today = results.find((result) => result.date === date);
  const previous = results.filter((result) => result.date < date);
  const previousMine = previous.filter((result) => result.winner === mySide).length;
  const previousOther = previous.filter((result) => result.winner === otherSide).length;
  const nemesisFlip = Boolean(today && today.winner === mySide && previousMine < previousOther);
  const friday = addDays(row.starts_on, 4);
  return {
    nemesisFlip,
    suddenDeathEve: date === friday && row.status === "tiebreak",
    nemesisName: row.nemesis_name ?? null,
  };
}

async function dailyGroupContext(db: Db, weekId: string, groupId: string, date: string): Promise<BeatContext> {
  const row = await db.query(
    `WITH today AS (
       SELECT COALESCE(SUM(sl.steps), 0)::int AS steps
       FROM step_logs sl JOIN users u ON u.id = sl.user_id
       WHERE u.group_id = $2 AND sl.log_date = $3::date
     ),
     prior AS (
       SELECT sl.log_date, SUM(sl.steps)::int AS day_steps
       FROM step_logs sl JOIN users u2 ON u2.id = sl.user_id
       WHERE u2.group_id = $2 AND sl.log_date < $3::date
       GROUP BY sl.log_date
       ORDER BY sl.log_date DESC
       LIMIT 7
     ),
     week_to_date AS (
       SELECT COALESCE(SUM(sl.steps), 0)::int AS steps
       FROM step_logs sl JOIN users u3 ON u3.id = sl.user_id
       JOIN weeks iw ON iw.id = $1
       WHERE u3.group_id = $2 AND sl.log_date BETWEEN iw.starts_on AND $3::date
     )
     SELECT c.name AS city_name,
            c.route_order,
            w.group_target_steps,
            to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on,
            today.steps AS group_day_steps,
            week_to_date.steps AS week_to_date_steps,
            COALESCE((SELECT AVG(day_steps) FROM prior), 0)::numeric AS trailing_avg,
            (SELECT COALESCE(SUM(bingo_lines), 0)::int FROM bingo_cards WHERE week_id = $1) AS group_lines
     FROM weeks w
     JOIN cities c ON c.id = w.city_id
     CROSS JOIN today
     CROSS JOIN week_to_date
     WHERE w.id = $1
     LIMIT 1`,
    [weekId, groupId, date],
  );
  const trackers = await db.query(
    `SELECT id, fitbit_connected, last_synced_at FROM users WHERE group_id = $1`,
    [groupId],
  );
  const confidence = calculateDataConfidence({
    now: new Date(`${date}T23:59:00Z`),
    trackers: trackers.rows.map((tracker) => ({
      userId: tracker.id as string,
      fitbitConnected: Boolean(tracker.fitbit_connected),
      lastSyncedAt: tracker.last_synced_at ?? null,
    })),
  });
  const specialOperation = await getSpecialOperationState(db, weekId, date);
  const seasonWeek = row.rowCount
    ? seasonWeekForRouteOrder(Number(row.rows[0].route_order), row.rows[0].city_name)
    : null;
  const startsOn: string | null = row.rows[0]?.starts_on ?? null;
  const elapsedDay = startsOn
    ? Math.min(
        7,
        Math.max(1, Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${startsOn}T00:00:00Z`)) / 86_400_000) + 1),
      )
    : undefined;

  return {
    groupId,
    userId: null,
    weekId,
    date,
    city: row.rows[0]?.city_name ?? "the city",
    groupDaySteps: Number(row.rows[0]?.group_day_steps ?? 0),
    trailingGroupDailyAvg: Number(row.rows[0]?.trailing_avg ?? 0),
    hotPursuitToday: await groupHotPursuit(db, groupId, date),
    hotPursuitYesterday: await groupHotPursuit(db, groupId, addDays(date, -1)),
    dataConfidence: confidence.dataConfidence,
    weekTarget: Number(row.rows[0]?.group_target_steps ?? 0),
    weekToDateSteps: Number(row.rows[0]?.week_to_date_steps ?? 0),
    elapsedDay,
    groupLines: Number(row.rows[0]?.group_lines ?? 0),
    specialOperationActive: specialOperation.active,
    specialOperationEarnedBonus: specialOperation.earnedBonus,
    specialOperationMaxBonus: specialOperation.maxBonus,
    firstLinePayoff: seasonWeek?.fieldOps.firstLinePayoff,
    operationLabel: seasonWeek?.specialOperation.label,
  };
}

/**
 * Fire one beat by slug outside ordinary day evaluation (e.g. the
 * late-sync `result_recalculating` trust beat). Cooldown and idempotency
 * rules still apply.
 */
export async function fireBeatBySlug(
  db: Db,
  slug: string,
  ctx: Pick<BeatContext, "groupId" | "userId" | "weekId" | "date"> & Partial<BeatContext>,
): Promise<boolean> {
  const rows = await db.query<BeatDefinition>(
    `SELECT id, slug, trigger, scope, variants, cooldown_days, priority
     FROM beat_definitions WHERE slug = $1`,
    [slug],
  );
  if (!rows.rowCount) return false;
  const beat = {
    ...rows.rows[0],
    variants: Array.isArray(rows.rows[0].variants) ? rows.rows[0].variants : [],
    cooldown_days: Number(rows.rows[0].cooldown_days),
    priority: Number(rows.rows[0].priority),
  };
  const city = ctx.city
    ?? (await db.query(
      `SELECT c.name FROM weeks w JOIN cities c ON c.id = w.city_id WHERE w.id = $1`,
      [ctx.weekId],
    )).rows[0]?.name
    ?? "the city";
  return fireBeat(db, beat, { ...ctx, city } as BeatContext);
}

async function dailyUserContexts(db: Db, weekId: string, groupId: string, date: string): Promise<BeatContext[]> {
  const rows = await db.query(
    `SELECT u.id, u.weekly_step_target, c.name AS city_name,
            COALESCE(sl.steps, 0)::int AS steps
     FROM users u
     JOIN weeks w ON w.id = $1
     JOIN cities c ON c.id = w.city_id
     LEFT JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = $3::date
     WHERE u.group_id = $2
     ORDER BY u.created_at ASC`,
    [weekId, groupId, date],
  );

  const contexts: BeatContext[] = [];
  for (const row of rows.rows) {
    const dailyTarget = Number(row.weekly_step_target) / 7;
    const nemesis = await nemesisContext(db, weekId, row.id, date);
    contexts.push({
      groupId,
      userId: row.id,
      weekId,
      date,
      city: row.city_name,
      userSteps: Number(row.steps),
      dailyTarget,
      hitDailyTarget: Number(row.steps) >= dailyTarget,
      previousTargetStreak: await previousTargetStreak(db, row.id, date),
      nemesisFlip: nemesis.nemesisFlip,
      suddenDeathEve: nemesis.suddenDeathEve,
      nemesisName: nemesis.nemesisName ?? undefined,
    });
  }
  return contexts;
}

export async function evaluateDailyBeats(
  db: Db,
  weekId: string,
  groupId: string,
  date: string,
): Promise<void> {
  const defs = await definitions(db, "day");
  if (!defs.length) return;

  const groupDefs = defs.filter((beat) => beat.scope === "group");
  const userDefs = defs.filter((beat) => beat.scope === "user");
  const groupCtx = await dailyGroupContext(db, weekId, groupId, date);
  for (const beat of groupDefs) {
    if (evaluateBeatTrigger(beat.trigger, groupCtx) && await fireBeat(db, beat, groupCtx)) break;
  }

  for (const ctx of await dailyUserContexts(db, weekId, groupId, date)) {
    // User-scope Selena commentary is gated on the same group-level data
    // confidence: if the group's field reports are incomplete, she stays quiet.
    ctx.dataConfidence = groupCtx.dataConfidence;
    for (const beat of userDefs) {
      if (evaluateBeatTrigger(beat.trigger, ctx) && await fireBeat(db, beat, ctx)) break;
    }
  }
}

export async function evaluateWeekBeats(db: Db, weekId: string): Promise<void> {
  const defs = (await definitions(db, "week")).filter((beat) => beat.scope === "group");
  if (!defs.length) return;
  const row = await db.query(
    `SELECT w.group_id, to_char(w.ends_on, 'YYYY-MM-DD') AS fired_on,
            w.group_target_steps, COALESCE(w.group_total_steps, 0)::int AS group_total_steps,
            c.name AS city_name
     FROM weeks w JOIN cities c ON c.id = w.city_id
     WHERE w.id = $1`,
    [weekId],
  );
  if (!row.rowCount) return;
  const week = row.rows[0];
  const trackers = await db.query(
    `SELECT id, fitbit_connected, last_synced_at FROM users WHERE group_id = $1`,
    [week.group_id],
  );
  const confidence = calculateDataConfidence({
    now: new Date(),
    trackers: trackers.rows.map((tracker) => ({
      userId: tracker.id as string,
      fitbitConnected: Boolean(tracker.fitbit_connected),
      lastSyncedAt: tracker.last_synced_at ?? null,
    })),
  });
  const ctx: BeatContext = {
    groupId: week.group_id,
    userId: null,
    weekId,
    date: week.fired_on,
    city: week.city_name,
    weekTarget: Number(week.group_target_steps),
    weekTotal: Number(week.group_total_steps),
    weekGap: Number(week.group_target_steps) - Number(week.group_total_steps),
    dataConfidence: confidence.dataConfidence,
  };

  for (const beat of defs) {
    if (evaluateBeatTrigger(beat.trigger, ctx) && await fireBeat(db, beat, ctx)) break;
  }
}

export async function evaluateRevealBeats(db: Db, weekId: string, firedOn: string): Promise<void> {
  const defs = (await definitions(db, "reveal")).filter((beat) => beat.scope === "user");
  if (!defs.length) return;
  const rows = await db.query(
    `SELECT w.group_id, c.name AS city_name,
            nm.player_a, nm.player_b,
            a.display_name AS player_a_name,
            b.display_name AS player_b_name
     FROM nemesis_matchups nm
     JOIN weeks w ON w.id = nm.week_id
     JOIN cities c ON c.id = w.city_id
     JOIN users a ON a.id = nm.player_a
     JOIN users b ON b.id = nm.player_b
     WHERE nm.week_id = $1`,
    [weekId],
  );

  for (const row of rows.rows) {
    const contexts: BeatContext[] = [
      {
        groupId: row.group_id,
        userId: row.player_a,
        weekId,
        date: firedOn,
        city: row.city_name,
        nemesisName: row.player_b_name,
      },
      {
        groupId: row.group_id,
        userId: row.player_b,
        weekId,
        date: firedOn,
        city: row.city_name,
        nemesisName: row.player_a_name,
      },
    ];
    for (const ctx of contexts) {
      for (const beat of defs) {
        if (evaluateBeatTrigger(beat.trigger, ctx) && await fireBeat(db, beat, ctx)) break;
      }
    }
  }
}
