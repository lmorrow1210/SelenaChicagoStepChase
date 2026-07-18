import { Router } from "express";
import { pool } from "../db/pool.js";
import { SEASON_ONE_CONFIG, getSeasonWeek, getEvidence } from "@one-step-ahead/shared/season-one/seasonOne";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { calculateChase } from "@one-step-ahead/shared/season-one/chase";
import { calculateDataConfidence } from "@one-step-ahead/shared/season-one/dataConfidence";
import { selectPrimaryAction } from "@one-step-ahead/shared/season-one/primaryAction";
import { selectPrimaryBeat } from "@one-step-ahead/shared/season-one/primaryBeat";
import { calculateWeeklyPhase } from "@one-step-ahead/shared/season-one/weeklyPhase";
import { getSpecialOperationState } from "../services/specialOperations.js";
import type { WeeklyOutcome } from "@one-step-ahead/shared";

export const weeksRouter = Router();
weeksRouter.use(requireAuth);

const SELENA_MIN_LEAD_STEPS = 5000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

interface CityRow {
  id: number;
  name: string;
  country: string;
  route_order: number;
  lat: string | number;
  lng: string | number;
}

interface WeekRow {
  id: string;
  starts_on: string;
  ends_on: string;
  group_target_steps: number;
  status: "scheduled" | "active" | "closed";
  city_id: number;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function localDateTimeParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function zonedMidnightToUtcIso(date: string, timeZone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const targetUtc = Date.UTC(year, month - 1, day);
  let guess = new Date(targetUtc);

  for (let i = 0; i < 3; i += 1) {
    const parts = localDateTimeParts(guess, timeZone);
    const renderedUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess = new Date(guess.getTime() - (renderedUtc - targetUtc));
  }

  return guess.toISOString();
}

function cityPayload(city: CityRow | null) {
  if (!city) return null;
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    route_order: city.route_order,
    lat: Number(city.lat),
    lng: Number(city.lng),
  };
}

function seasonWeekForCity(city: CityRow | null) {
  if (!city) return null;
  const seasonWeek = getSeasonWeek(city.route_order);
  return seasonWeek?.cityName === city.name ? seasonWeek : null;
}

function localDate(now: Date, timeZone: string): string {
  const parts = localDateTimeParts(now, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function elapsedFractionOfWeek(week: WeekRow, timezone: string, now: Date): number {
  const start = new Date(zonedMidnightToUtcIso(week.starts_on, timezone)).getTime();
  const end = new Date(zonedMidnightToUtcIso(addDays(week.ends_on, 1), timezone)).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
}

function weekPayload(week: WeekRow) {
  return {
    id: week.id,
    starts_on: week.starts_on,
    ends_on: week.ends_on,
    group_target_steps: week.group_target_steps,
    status: week.status,
  };
}

weeksRouter.get("/current", async (req, res, next) => {
  try {
    const me = await pool.query(
      `SELECT u.group_id, g.timezone
       FROM users u
       LEFT JOIN groups g ON g.id = u.group_id
       WHERE u.id = $1`,
      [req.userId],
    );
    if (!me.rowCount) throw errors.unauthenticated();
    const groupId = me.rows[0].group_id as string | null;
    if (!groupId) {
      res.json({
        week: null,
        city: null,
        nextCity: null,
        selenaLeadSteps: SELENA_MIN_LEAD_STEPS,
        route: [],
        progressStrip: [],
        leaderboard: [],
        countdown: null,
        lastSyncedAt: null,
        seasonState: null,
        state: "no_group",
      });
      return;
    }

    const timezone = me.rows[0].timezone ?? "America/Chicago";
    const activeWeek = await pool.query(
      `SELECT *
       FROM weeks
       WHERE group_id = $1 AND status = 'active'
       ORDER BY starts_on DESC
       LIMIT 1`,
      [groupId],
    );
    const weekResult = activeWeek.rowCount
      ? activeWeek
      : await pool.query(
          `SELECT *
           FROM weeks
           WHERE group_id = $1
           ORDER BY starts_on DESC
           LIMIT 1`,
          [groupId],
        );

    if (!weekResult.rowCount) {
      res.json({
        week: null,
        city: null,
        nextCity: null,
        selenaLeadSteps: SELENA_MIN_LEAD_STEPS,
        route: [],
        progressStrip: [],
        leaderboard: [],
        countdown: null,
        lastSyncedAt: null,
        seasonState: null,
        state: "no_group",
      });
      return;
    }

    const week = weekResult.rows[0] as WeekRow & {
      final_outcome: WeeklyOutcome | null;
      finalized_at: Date | null;
      final_progress: string | null;
      base_progress: string | null;
      remaining_lead: number | null;
      bonus_breakdown: Record<string, number> | null;
      data_confidence: string | null;
    };
    const now = new Date();
    const localToday = localDate(now, timezone);
    const [cities, members, lastSync, fieldOps, prediction, nemesis, ritualViews, specialOperation, viewerToday, previousCaseRow] = await Promise.all([
      pool.query<CityRow>(
        `SELECT id, name, country, route_order, lat, lng
         FROM cities
         ORDER BY route_order`,
      ),
      pool.query(
        `SELECT u.id AS user_id,
                u.display_name,
                u.avatar_skin,
                u.avatar_hair,
                u.avatar_colorway,
                u.weekly_step_target AS target,
                u.fitbit_connected,
                u.last_synced_at,
                COALESCE(cur.steps, 0)::int AS steps,
                COALESCE(prev.steps, 0)::int AS previous_steps
         FROM users u
         LEFT JOIN (
           SELECT user_id, SUM(steps)::int AS steps
           FROM step_logs
           WHERE log_date BETWEEN $2::date AND $3::date
           GROUP BY user_id
         ) cur ON cur.user_id = u.id
         LEFT JOIN (
           SELECT user_id, SUM(steps)::int AS steps
           FROM step_logs
           WHERE log_date BETWEEN ($2::date - INTERVAL '7 days')::date
                             AND ($2::date - INTERVAL '1 day')::date
           GROUP BY user_id
         ) prev ON prev.user_id = u.id
         WHERE u.group_id = $1
         ORDER BY COALESCE(cur.steps, 0) DESC, u.created_at ASC`,
        [groupId, week.starts_on, week.ends_on],
      ),
      pool.query("SELECT MAX(last_synced_at) AS last_synced_at FROM users WHERE group_id = $1", [
        groupId,
      ]),
      pool.query(
        `SELECT COALESCE(SUM(bingo_lines), 0)::int AS total_qualifying_lines
         FROM bingo_cards
         WHERE week_id = $1`,
        [week.id],
      ),
      pool.query(
        `SELECT COUNT(*)::int AS submitted_count,
                BOOL_OR(user_id = $2) AS submitted_by_viewer
         FROM predictions
         WHERE week_id = $1`,
        [week.id, req.userId],
      ),
      pool.query(
        `SELECT
           COUNT(*)::int AS matchup_count,
           COUNT(*) FILTER (WHERE status = 'tiebreak')::int AS tiebreak_count,
           COUNT(*) FILTER (WHERE status IN ('active', 'tiebreak'))::int AS unresolved_count
         FROM nemesis_matchups
         WHERE week_id = $1`,
        [week.id],
      ),
      pool.query(
        `SELECT ritual_id FROM week_ritual_views WHERE week_id = $1 AND user_id = $2`,
        [week.id, req.userId],
      ),
      getSpecialOperationState(pool, week.id, localToday),
      pool.query(
        `SELECT COALESCE(sl.steps, 0)::int AS steps, u.weekly_step_target
         FROM users u
         LEFT JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = $2::date
         WHERE u.id = $1`,
        [req.userId, localToday],
      ),
      pool.query(
        `SELECT w.id, w.final_outcome, w.finalized_at, w.season_week_number,
                w.final_progress, w.base_progress, w.remaining_lead, w.bonus_breakdown,
                w.group_total_steps, w.group_target_steps, w.data_confidence,
                c.route_order, c.name AS city_name,
                EXISTS (
                  SELECT 1 FROM week_ritual_views v
                  WHERE v.week_id = w.id AND v.user_id = $2 AND v.ritual_id = 'case_closed'
                ) AS case_closed_viewed
         FROM weeks w JOIN cities c ON c.id = w.city_id
         WHERE w.group_id = $1 AND w.status = 'closed' AND w.finalized_at IS NOT NULL
         ORDER BY w.starts_on DESC
         LIMIT 1`,
        [groupId, req.userId],
      ),
    ]);

    const currentCity = cities.rows.find((city) => city.id === week.city_id) ?? null;
    const nextCity =
      cities.rows.find((city) => city.route_order === (currentCity?.route_order ?? 0) + 1) ??
      null;
    const groupSteps = members.rows.reduce((sum, member) => sum + Number(member.steps), 0);
    const countdown = zonedMidnightToUtcIso(addDays(week.ends_on, 1), timezone);
    const msUntilEnd = new Date(countdown).getTime() - now.getTime();
    const state =
      week.status === "closed" && msUntilEnd <= 0 && Math.abs(msUntilEnd) <= ONE_HOUR_MS
        ? "arrival"
        : week.status === "active" && msUntilEnd > 0 && msUntilEnd < ONE_DAY_MS
          ? "closing_soon"
          : "in_progress";
    const dataConfidence = calculateDataConfidence({
      now,
      trackers: members.rows.map((member) => ({
        userId: member.user_id as string,
        fitbitConnected: Boolean(member.fitbit_connected),
        lastSyncedAt: member.last_synced_at ?? null,
      })),
    });
    const totalQualifyingLines = Number(fieldOps.rows[0]?.total_qualifying_lines ?? 0);
    const submittedCount = Number(prediction.rows[0]?.submitted_count ?? 0);
    const activePlayerCount = members.rowCount ?? members.rows.length;
    const viewerSubmittedPrediction = Boolean(prediction.rows[0]?.submitted_by_viewer);
    const suddenDeathActive = Number(nemesis.rows[0]?.tiebreak_count ?? 0) > 0;
    const matchupCount = Number(nemesis.rows[0]?.matchup_count ?? 0);
    const unresolvedNemesisCount = Number(nemesis.rows[0]?.unresolved_count ?? 0);
    const membersWithActivity = members.rows.filter((member) => Number(member.steps) > 0).length;
    const viewedRituals = new Set(ritualViews.rows.map((row) => row.ritual_id as string));
    const chase = calculateChase({
      activePlayers: members.rows.map((member) => ({
        userId: member.user_id as string,
        weeklyTarget: Number(member.target),
        stepsThisWeek: Number(member.steps),
        lastSyncedAt: member.last_synced_at ?? null,
        fitbitConnected: Boolean(member.fitbit_connected),
      })),
      fieldOps: { activePlayerCount, totalQualifyingLines },
      specialOperation: {
        maxBonus: specialOperation.maxBonus,
        earnedBonus: specialOperation.earnedBonus,
        contributors: specialOperation.contributors,
        eligiblePlayers: specialOperation.eligiblePlayers,
      },
      nemesis: {
        activePlayerCount,
        participantsWithActivity: membersWithActivity,
        allMatchupsResolved: matchupCount > 0 && unresolvedNemesisCount === 0,
      },
      prediction: { activePlayerCount, submittedCount },
      trackerSync: dataConfidence.trackers,
      elapsedFractionOfWeek: elapsedFractionOfWeek(week, timezone, now),
      now,
      groupWeeklyTargetSnapshot: Number(week.group_target_steps),
      dataConfidence: dataConfidence.dataConfidence,
      final: week.status === "closed",
    });
    // A finalized week's persisted result is authoritative — the live
    // recalculation never overrides what rollover reconciled and stored.
    const finalOutcome: WeeklyOutcome | null = week.final_outcome ?? chase.finalOutcome;
    const phaseResult = calculateWeeklyPhase({
      startsOn: week.starts_on,
      endsOn: week.ends_on,
      timezone,
      weekStatus: week.status,
      finalOutcome,
      finalizedAt: week.finalized_at ?? null,
      dataConfidence: dataConfidence.dataConfidence,
      briefingViewed: viewedRituals.has("monday_briefing"),
      midweekViewed: viewedRituals.has("midweek_update"),
      finalPushViewed: viewedRituals.has("final_push"),
      caseClosedViewed: viewedRituals.has("case_closed"),
      suddenDeathActive,
      now,
    });
    const incompletePlayerCount =
      dataConfidence.counts.stale + dataConfidence.counts.missing + dataConfidence.counts.disconnected;
    const stalePlayerCount = dataConfidence.counts.stale;
    const seasonWeek = seasonWeekForCity(currentCity);

    // Season Evidence preview for the current chapter (locked until close).
    const evidenceUnlocks = seasonWeek
      ? await pool.query(
          `SELECT evidence_id FROM group_evidence_unlocks
           WHERE group_id = $1 AND season_id = $2 AND evidence_id = ANY($3)`,
          [groupId, seasonWeek.seasonId, [
            seasonWeek.evidence.standardEvidenceId,
            seasonWeek.evidence.interceptClueId,
          ]],
        )
      : null;
    const unlockedEvidenceIds = new Set(
      (evidenceUnlocks?.rows ?? []).map((row) => row.evidence_id as string),
    );

    // The most recent finalized case — the Case Closed report stays
    // available after Monday rollover opens the next chapter.
    const prevRow = previousCaseRow.rows[0] ?? null;
    const prevSeasonWeek = prevRow ? getSeasonWeek(Number(prevRow.route_order)) : null;
    const previousCase =
      prevRow && prevSeasonWeek && prevSeasonWeek.cityName === prevRow.city_name && prevRow.final_outcome
        ? {
            weekId: prevRow.id as string,
            weekNumber: prevSeasonWeek.weekNumber,
            cityName: prevSeasonWeek.cityName,
            chapterTitle: prevSeasonWeek.chapterTitle,
            outcome: prevRow.final_outcome as WeeklyOutcome,
            baseProgress: prevRow.base_progress != null ? Number(prevRow.base_progress) : null,
            finalProgress: prevRow.final_progress != null ? Number(prevRow.final_progress) : null,
            remainingLead: prevRow.remaining_lead != null ? Number(prevRow.remaining_lead) : null,
            bonuses: prevRow.bonus_breakdown ?? null,
            groupTotalSteps: prevRow.group_total_steps != null ? Number(prevRow.group_total_steps) : null,
            groupTargetSteps: Number(prevRow.group_target_steps),
            dataConfidence: (prevRow.data_confidence ?? "verified") as string,
            finalizedAt: new Date(prevRow.finalized_at).toISOString(),
            viewed: Boolean(prevRow.case_closed_viewed),
          }
        : null;

    const briefingAvailable = Boolean(seasonWeek) && week.status === "active"
      && !viewedRituals.has("monday_briefing");
    const caseResultAvailable = Boolean(previousCase && !previousCase.viewed);
    const dailyTarget = viewerToday.rows[0] ? Number(viewerToday.rows[0].weekly_step_target) / 7 : 0;
    const viewerStepsToday = viewerToday.rows[0] ? Number(viewerToday.rows[0].steps) : 0;

    const seasonState = seasonWeek
      ? {
          season: {
            id: SEASON_ONE_CONFIG.id,
            title: SEASON_ONE_CONFIG.title,
            weekNumber: seasonWeek.weekNumber,
            totalWeeks: SEASON_ONE_CONFIG.route.length,
          },
          chapter: {
            city: seasonWeek.cityName,
            title: seasonWeek.chapterTitle,
            complication: seasonWeek.complication.label,
            nextCity: seasonWeek.nextCityTeaser.cityName || null,
          },
          phase: phaseResult.phase,
          dataConfidence: dataConfidence.dataConfidence,
          chase: {
            verifiedGroupSteps: chase.verifiedGroupSteps,
            snapshottedTarget: chase.groupWeeklyTarget,
            baseProgress: chase.baseProgress,
            fieldOpsBonus: chase.bonuses.fieldOps,
            specialOperationBonus: chase.bonuses.specialOperation,
            nemesisParticipationBonus: chase.bonuses.nemesisParticipation,
            predictionParticipationBonus: chase.bonuses.predictionParticipation,
            totalNonStepBonus: chase.bonuses.total,
            finalProgress: chase.finalProgress,
            remainingLead: chase.remainingLead,
            projectedOutcome: chase.projectedOutcome,
            finalOutcome,
          },
          primaryAction: selectPrimaryAction({
            dataConfidence: dataConfidence.dataConfidence,
            incompletePlayerCount,
            briefingAvailable,
            caseResultAvailable,
            phase: phaseResult.phase,
            suddenDeathActive,
            specialOperationActive:
              specialOperation.active && specialOperation.earnedBonus < specialOperation.maxBonus,
            predictionActionAvailable: localToday === week.starts_on && !viewerSubmittedPrediction,
            fieldOpsNearReward:
              totalQualifyingLines > 0 && activePlayerCount > 0
              && totalQualifyingLines / activePlayerCount < 3,
            nemesisClose: false,
            dailyTargetWithinReach:
              dailyTarget > 0 && viewerStepsToday >= dailyTarget * 0.5 && viewerStepsToday < dailyTarget,
          }),
          primaryBeat: selectPrimaryBeat({
            weekConfig: seasonWeek,
            phase: phaseResult.phase,
            dataConfidence: dataConfidence.dataConfidence,
            projectedOutcome: chase.projectedOutcome,
            finalOutcome,
            remainingLead: chase.remainingLead,
            firstLineComplete: totalQualifyingLines >= 1,
            platformSweepActive: specialOperation.active,
            platformSweepEarnedBonus: specialOperation.earnedBonus,
            platformSweepMaxBonus: specialOperation.maxBonus,
          }),
          platformSweep: specialOperation,
          evidencePreview: {
            standardEvidenceId: seasonWeek.evidence.standardEvidenceId,
            standardTitle: unlockedEvidenceIds.has(seasonWeek.evidence.standardEvidenceId)
              ? getEvidence(seasonWeek.evidence.standardEvidenceId)?.title ?? null
              : null,
            unlocked: unlockedEvidenceIds.has(seasonWeek.evidence.standardEvidenceId),
            interceptUnlocked: unlockedEvidenceIds.has(seasonWeek.evidence.interceptClueId),
          },
          ritualViews: {
            mondayBriefing: viewedRituals.has("monday_briefing"),
            midweekUpdate: viewedRituals.has("midweek_update"),
            finalPush: viewedRituals.has("final_push"),
            caseClosed: viewedRituals.has("case_closed"),
          },
          previousCase,
          sync: {
            lastUpdatedAt: lastSync.rows[0]?.last_synced_at?.toISOString?.() ?? null,
            incompletePlayerCount,
            stalePlayerCount,
          },
        }
      : null;

    const progressStrip = members.rows.map((member) => {
      const steps = Number(member.steps);
      const target = Number(member.target);
      return {
        user_id: member.user_id,
        display_name: member.display_name,
        avatar_skin: member.avatar_skin,
        avatar_hair: member.avatar_hair,
        avatar_colorway: member.avatar_colorway,
        steps,
        target,
        pct: target > 0 ? Math.min(100, Math.round((steps / target) * 100)) : 0,
      };
    });

    const leaderboard = members.rows.map((member, index) => ({
      rank: index + 1,
      user_id: member.user_id,
      display_name: member.display_name,
      avatar_skin: member.avatar_skin,
      avatar_hair: member.avatar_hair,
      avatar_colorway: member.avatar_colorway,
      steps: Number(member.steps),
      deltaVsLastWeek: Number(member.steps) - Number(member.previous_steps),
    }));

    res.json({
      week: weekPayload(week),
      city: cityPayload(currentCity),
      nextCity: cityPayload(nextCity),
      selenaLeadSteps: seasonState ? seasonState.chase.remainingLead : Math.max(week.group_target_steps - groupSteps, SELENA_MIN_LEAD_STEPS),
      route: cities.rows.map((city) => ({
        city_id: city.id,
        name: city.name,
        visited: currentCity ? city.route_order < currentCity.route_order : false,
      })),
      progressStrip,
      leaderboard,
      countdown,
      lastSyncedAt: lastSync.rows[0]?.last_synced_at?.toISOString?.() ?? null,
      seasonState,
      state,
    });
  } catch (e) {
    next(e);
  }
});
