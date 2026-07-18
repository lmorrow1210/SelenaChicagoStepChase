import type { DataConfidence, WeekPhase, WeeklyOutcome } from "@one-step-ahead/shared";
import type { SeasonWeekConfig } from "@one-step-ahead/shared/season-one/seasonOne";

export type PrimaryBeatCategory = "trust" | "ritual" | "pursuit" | "field_ops" | "system";

export interface PrimaryBeat {
  id: string;
  category: PrimaryBeatCategory;
  headline: string;
  body: string;
  selena?: string;
  ctaLabel?: string;
  ctaHref?: string;
  dataConfidence: DataConfidence;
}

export interface PrimaryBeatInput {
  weekConfig: SeasonWeekConfig;
  phase: WeekPhase;
  dataConfidence: DataConfidence;
  projectedOutcome: WeeklyOutcome | null;
  finalOutcome: WeeklyOutcome | null;
  remainingLead: number;
  firstLineComplete: boolean;
  platformSweepActive: boolean;
  platformSweepEarnedBonus: number;
  platformSweepMaxBonus: number;
}

const OUTCOME_HEADLINES: Record<WeeklyOutcome, string> = {
  trail_lost: "TRAIL LOST",
  pursuit_maintained: "PURSUIT MAINTAINED",
  close_encounter: "CLOSE ENCOUNTER",
  interception: "SELENA INTERCEPTED",
};

function formatSteps(value: number): string {
  return Math.max(0, Math.round(value)).toLocaleString("en-US");
}

/**
 * One primary beat for the main chase surface. Deterministic priority:
 * trust states first (the fiction never outruns the data), then ritual
 * beats, then pursuit commentary. Selena performance lines only attach
 * when data confidence is verified.
 */
export function selectPrimaryBeat(input: PrimaryBeatInput): PrimaryBeat {
  const { weekConfig, dataConfidence } = input;
  const rituals = weekConfig.rituals;

  // Trust beats override everything, including Selena commentary.
  if (dataConfidence === "recalculating") {
    return {
      id: "result_recalculating",
      category: "trust",
      headline: "RESULT RECALCULATING",
      body: "Late field reports arrived. The pursuit result is being reconciled before anything is final.",
      dataConfidence,
    };
  }
  if (dataConfidence === "incomplete" && input.phase !== "case_closed") {
    return {
      id: "group_data_incomplete",
      category: "trust",
      headline: "AWAITING FIELD REPORTS",
      body: "Operative trackers have not reported. Pursuit analysis is suspended until trackers respond.",
      ctaLabel: "Review sync status",
      ctaHref: "/profile",
      dataConfidence,
    };
  }

  // Ritual beats by phase.
  switch (input.phase) {
    case "briefing":
      return {
        id: "monday_briefing",
        category: "ritual",
        headline: "NEW CASE OPEN",
        body: `${weekConfig.cityName} — ${weekConfig.chapterTitle}. The field briefing is ready.`,
        ctaLabel: "Open the briefing",
        dataConfidence,
      };
    case "midweek_update":
      return midweekBeat(input);
    case "final_push":
      return finalPushBeat(input);
    case "sudden_death":
      return {
        id: "sudden_death",
        category: "ritual",
        headline: rituals.suddenDeath.headline,
        body: rituals.suddenDeath.body,
        ctaLabel: "Open the duel",
        ctaHref: "/nemesis",
        dataConfidence,
      };
    case "case_closing":
      return {
        id: "case_closing",
        category: "ritual",
        headline: rituals.caseClosing.headline,
        body: `${rituals.caseClosing.body} ${rituals.caseClosing.supporting}`,
        dataConfidence,
      };
    case "case_closed": {
      const outcome = input.finalOutcome ?? "pursuit_maintained";
      return {
        id: "case_closed",
        category: "ritual",
        headline: OUTCOME_HEADLINES[outcome],
        body: `Case ${String(weekConfig.weekNumber).padStart(2, "0")} is closed. The report is ready.`,
        selena: dataConfidence === "verified" ? weekConfig.closeCopy[outcome].selena : undefined,
        ctaLabel: "View the case report",
        dataConfidence,
      };
    }
    default:
      break;
  }

  // Field Ops / pursuit beats during the active phase.
  if (input.platformSweepActive) {
    const complete = input.platformSweepEarnedBonus >= input.platformSweepMaxBonus
      && input.platformSweepMaxBonus > 0;
    return complete
      ? {
          id: "platform_sweep_completed",
          category: "field_ops",
          headline: "PLATFORM SWEEP COMPLETE",
          body: "Every exit is covered. The full special-operation bonus is secured.",
          dataConfidence,
        }
      : {
          id: "platform_sweep_started",
          category: "field_ops",
          headline: "PLATFORM SWEEP ACTIVE",
          body: weekConfig.rituals.specialOperationFiction,
          ctaLabel: "View the operation",
          dataConfidence,
        };
  }

  if (input.firstLineComplete) {
    return {
      id: "first_field_ops_line",
      category: "field_ops",
      headline: "FIELD OPS LINE COMPLETE",
      body: weekConfig.fieldOps.firstLinePayoff,
      ctaLabel: "Open Field Ops",
      ctaHref: "/fieldops",
      dataConfidence,
    };
  }

  if (dataConfidence === "verified" && input.projectedOutcome === "interception") {
    return {
      id: "interception_projected",
      category: "pursuit",
      headline: "INTERCEPTION PROJECTED",
      body: `At the current pace the unit reaches Selena before the case closes. ${formatSteps(input.remainingLead)} pursuit steps remain.`,
      dataConfidence,
    };
  }
  if (dataConfidence === "verified" && input.projectedOutcome === "trail_lost") {
    return {
      id: "team_behind_pace",
      category: "pursuit",
      headline: "THE LEAD IS WIDENING",
      body: "The unit is currently below interception pace.",
      ctaLabel: "View what is still achievable",
      dataConfidence,
    };
  }

  return {
    id: "field_report",
    category: "system",
    headline: "FIELD REPORT",
    body: `The first confirmed movement reports have reached the Bureau. Selena is still inside ${weekConfig.cityName}.`,
    dataConfidence,
  };
}

function midweekBeat(input: PrimaryBeatInput): PrimaryBeat {
  const { weekConfig, dataConfidence } = input;
  const midweek = weekConfig.rituals.midweek;
  if (dataConfidence !== "verified" && dataConfidence !== "estimated") {
    return {
      id: "midweek_update",
      category: "ritual",
      headline: midweek.incompleteData.headline,
      body: midweek.incompleteData.body,
      ctaLabel: midweek.incompleteData.cta,
      ctaHref: "/profile",
      dataConfidence,
    };
  }
  const variant = input.projectedOutcome === "interception"
    ? midweek.strongPace
    : input.projectedOutcome === "trail_lost"
      ? midweek.recoveryNeeded
      : midweek.expectedPace;
  return {
    id: "midweek_update",
    category: "ritual",
    headline: variant.headline,
    body: variant.body,
    selena: dataConfidence === "verified" ? variant.selena : undefined,
    ctaLabel: variant.cta,
    dataConfidence,
  };
}

function finalPushBeat(input: PrimaryBeatInput): PrimaryBeat {
  const { weekConfig, dataConfidence } = input;
  const projected = input.projectedOutcome;
  const projectedLine = projected && dataConfidence === "verified"
    ? `${OUTCOME_HEADLINES[projected]} PROJECTED. `
    : "";
  return {
    id: "final_push",
    category: "ritual",
    headline: weekConfig.rituals.finalPush.label,
    body: `${projectedLine}${formatSteps(input.remainingLead)} pursuit steps remain before the Sunday cutoff.`,
    selena: dataConfidence === "verified" ? weekConfig.rituals.finalPush.selena : undefined,
    dataConfidence,
  };
}
