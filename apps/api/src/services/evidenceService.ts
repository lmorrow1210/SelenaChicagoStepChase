import type { Pool, PoolClient } from "pg";
import type { WeeklyOutcome } from "@one-step-ahead/shared";
import {
  SEASON_ONE_CONFIG,
  getEvidence,
  getSeasonWeek,
  type EvidenceConfig,
  type SeasonWeekConfig,
} from "@one-step-ahead/shared/season-one/seasonOne";

type Db = Pool | PoolClient;

/**
 * Unlock the week's Season Evidence for a finalized outcome. Standard
 * evidence unlocks for every finalized week; the Intercept Clue only for
 * interception. ON CONFLICT DO NOTHING keeps rollover reruns and late-sync
 * recalculations from duplicating evidence. Evidence is never revoked —
 * once seen, the fiction stays seen.
 */
export async function unlockWeekEvidence(
  db: Db,
  weekId: string,
  groupId: string,
  seasonWeek: SeasonWeekConfig,
  outcome: WeeklyOutcome,
): Promise<{ unlockedStandard: boolean; unlockedIntercept: boolean }> {
  const standard = await insertUnlock(
    db,
    groupId,
    weekId,
    seasonWeek,
    seasonWeek.evidence.standardEvidenceId,
    "standard",
    outcome,
  );
  let intercept = false;
  if (outcome === "interception") {
    intercept = await insertUnlock(
      db,
      groupId,
      weekId,
      seasonWeek,
      seasonWeek.evidence.interceptClueId,
      "intercept",
      outcome,
    );
  }
  return { unlockedStandard: standard, unlockedIntercept: intercept };
}

async function insertUnlock(
  db: Db,
  groupId: string,
  weekId: string,
  seasonWeek: SeasonWeekConfig,
  evidenceId: string,
  kind: "standard" | "intercept",
  outcome: WeeklyOutcome,
): Promise<boolean> {
  const inserted = await db.query(
    `INSERT INTO group_evidence_unlocks
       (group_id, week_id, season_id, season_week_number, evidence_id, kind, outcome)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (group_id, season_id, evidence_id) DO NOTHING
     RETURNING id`,
    [groupId, weekId, seasonWeek.seasonId, seasonWeek.weekNumber, evidenceId, kind, outcome],
  );
  return Boolean(inserted.rowCount);
}

export interface EvidenceSlotDisplay {
  id: string;
  kind: "standard" | "intercept";
  title: string;
  body: string | null;
  highlightedFragment: string | null;
  iconKey: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface EvidenceBoardPayload {
  season: { id: string; title: string; totalWeeks: number };
  interceptionCount: number;
  finaleDepthTier: 1 | 2 | 3 | 4;
  weeks: Array<{
    weekNumber: number;
    cityName: string;
    chapterTitle: string;
    outcome: WeeklyOutcome | null;
    standardEvidence: EvidenceSlotDisplay;
    interceptClue: EvidenceSlotDisplay;
  }>;
}

export function finaleDepthTier(interceptionCount: number): 1 | 2 | 3 | 4 {
  if (interceptionCount >= 11) return 4;
  if (interceptionCount >= 8) return 3;
  if (interceptionCount >= 4) return 2;
  return 1;
}

/** Evidence body for the outcome that earned it (basic/full/enhanced). */
export function evidenceBodyForOutcome(evidence: EvidenceConfig, outcome: WeeklyOutcome): string {
  if (outcome === "trail_lost" && evidence.basicBody) return evidence.basicBody;
  if ((outcome === "close_encounter" || outcome === "interception") && evidence.enhancedBody) {
    return evidence.enhancedBody;
  }
  return evidence.body;
}

/**
 * The group's 13-slot Evidence Board. Locked slots never leak evidence
 * content (spoiler rule applies to Season Evidence exactly as it does to
 * Field Ops intel).
 */
export async function getEvidenceBoard(db: Db, groupId: string): Promise<EvidenceBoardPayload> {
  const unlocks = await db.query(
    `SELECT evidence_id, kind, outcome, unlocked_at
     FROM group_evidence_unlocks
     WHERE group_id = $1 AND season_id = $2`,
    [groupId, SEASON_ONE_CONFIG.id],
  );
  const byEvidenceId = new Map<string, { outcome: WeeklyOutcome; unlockedAt: string }>(
    unlocks.rows.map((row) => [
      row.evidence_id as string,
      { outcome: row.outcome as WeeklyOutcome, unlockedAt: new Date(row.unlocked_at).toISOString() },
    ]),
  );

  const weeks = SEASON_ONE_CONFIG.route.map((week) => {
    const standardUnlock = byEvidenceId.get(week.evidence.standardEvidenceId) ?? null;
    const interceptUnlock = byEvidenceId.get(week.evidence.interceptClueId) ?? null;
    return {
      weekNumber: week.weekNumber,
      cityName: week.cityName,
      chapterTitle: week.chapterTitle,
      outcome: standardUnlock?.outcome ?? null,
      standardEvidence: slotDisplay(week.evidence.standardEvidenceId, "standard", standardUnlock),
      interceptClue: slotDisplay(week.evidence.interceptClueId, "intercept", interceptUnlock),
    };
  });

  const interceptionCount = weeks.filter((week) => week.interceptClue.unlocked).length;
  return {
    season: {
      id: SEASON_ONE_CONFIG.id,
      title: SEASON_ONE_CONFIG.title,
      totalWeeks: SEASON_ONE_CONFIG.route.length,
    },
    interceptionCount,
    finaleDepthTier: finaleDepthTier(interceptionCount),
    weeks,
  };
}

function slotDisplay(
  evidenceId: string,
  kind: "standard" | "intercept",
  unlock: { outcome: WeeklyOutcome; unlockedAt: string } | null,
): EvidenceSlotDisplay {
  const evidence = getEvidence(evidenceId);
  const unlocked = Boolean(unlock && evidence);
  return {
    id: evidenceId,
    kind,
    // Locked slots ship a neutral label only — never the evidence content.
    title: unlocked && evidence ? evidence.title : kind === "standard" ? "SEALED EVIDENCE" : "INTERCEPT CLUE",
    body: unlocked && evidence ? evidenceBodyForOutcome(evidence, unlock!.outcome) : null,
    highlightedFragment: unlocked && evidence ? evidence.highlightedFragment ?? null : null,
    iconKey: unlocked && evidence ? evidence.iconKey ?? null : null,
    unlocked,
    unlockedAt: unlock?.unlockedAt ?? null,
  };
}

export function seasonWeekForRouteOrder(routeOrder: number, cityName: string): SeasonWeekConfig | null {
  const seasonWeek = getSeasonWeek(routeOrder);
  return seasonWeek && seasonWeek.cityName === cityName ? seasonWeek : null;
}
