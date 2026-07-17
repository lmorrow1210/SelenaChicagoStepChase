import type { WeeklyOutcome } from "@one-step-ahead/shared";

export type EvidenceKind = "standard" | "intercept";

export interface EvidenceConfig {
  id: string;
  kind: EvidenceKind;
  seasonId: string;
  weekNumber: number;
  cityName: string;
  title: string;
  body: string;
  basicBody?: string;
  enhancedBody?: string;
  highlightedFragment?: string;
  iconKey?: string;
}

export interface ParticipationThresholdOperationConfig {
  id: string;
  type: "participation_threshold";
  label: string;
  minimumVerifiedStepsPerPlayer: number;
  startDay: 5;
  endDay: 6;
  tiers: Array<{ requiredRatio: number; bonus: number }>;
}

export interface SeasonWeekConfig {
  id: string;
  seasonId: string;
  weekNumber: number;
  cityName: string;
  chapterTitle: string;
  complication: {
    id: string;
    label: string;
    summary: string;
  };
  briefing: {
    label: string;
    title: string;
    body: string[];
    supportingCards: Array<{ id: string; title: string; body: string }>;
    primaryCta: string;
    secondaryCta: string;
  };
  fieldOps: {
    fixedChallengeCodes: string[];
    firstLinePayoff: string;
    firstMovementPayoff: string;
  };
  specialOperation: ParticipationThresholdOperationConfig;
  evidence: {
    standardEvidenceId: string;
    interceptClueId: string;
  };
  closeCopy: Record<WeeklyOutcome, {
    headline: string;
    story: string;
    selena: string;
    nextLead: string;
  }>;
  nextCityTeaser: {
    cityName: string;
    header: string;
    body: string;
    selena: string;
    cta: string;
  };
}

export interface SeasonConfig {
  id: string;
  title: string;
  seasonNumber: number;
  route: SeasonWeekConfig[];
  evidence: EvidenceConfig[];
}

const seasonId = "season_one";

const fieldOpsCodes = [
  "steps_1k_day",
  "steps_5k_day",
  "steps_10k_day",
  "target_50pct_day",
  "target_100pct_day",
  "steps_2k_two_days",
  "steps_any_three_days",
  "steps_12k_day",
  "target_100pct_day_recovery_sub",
  "weekly_steps_15k",
  "steps_1k_noon",
  "steps_1k_after_6",
  "morning_after_hours_pair",
  "active_500_five_days",
  "active_nonzero_seven_days",
  "assist_sent",
  "assist_received",
  "unit_mobilized_50pct",
  "full_team_report_sync",
  "take_long_way",
  "eyes_up",
  "walk_with_someone",
  "choose_longer_route",
  "trace_the_grid",
  "find_the_platform",
] as const;

const platformSweep: ParticipationThresholdOperationConfig = {
  id: "platform_sweep",
  type: "participation_threshold",
  label: "Platform Sweep",
  minimumVerifiedStepsPerPlayer: 2000,
  startDay: 5,
  endDay: 6,
  tiers: [
    { requiredRatio: 0.4, bonus: 0.01 },
    { requiredRatio: 0.6, bonus: 0.02 },
    { requiredRatio: 0.8, bonus: 0.03 },
  ],
};

const defaultCloseCopy: Record<WeeklyOutcome, {
  headline: string;
  story: string;
  selena: string;
  nextLead: string;
}> = {
  trail_lost: {
    headline: "TRAIL LOST",
    story: "The unit lost contact before the case could be resolved.",
    selena: "You followed the obvious route.",
    nextLead: "The next signal has already appeared.",
  },
  pursuit_maintained: {
    headline: "PURSUIT MAINTAINED",
    story: "The unit kept Selena within operational range.",
    selena: "Close enough to keep watching.",
    nextLead: "The route continues to the next city.",
  },
  close_encounter: {
    headline: "CLOSE ENCOUNTER",
    story: "The unit arrived moments after Selena moved on.",
    selena: "Another minute would have changed the file.",
    nextLead: "The recovered evidence points to the next city.",
  },
  interception: {
    headline: "SELENA INTERCEPTED",
    story: "The unit reached Selena before she escaped through a contingency.",
    selena: "Ask what opened before I arrived.",
    nextLead: "The intercept clue points to the next city.",
  },
};

const structuralBriefing = (weekNumber: number, cityName: string, chapterTitle: string) => ({
  label: "BUREAU FIELD BRIEFING",
  title: `CASE ${String(weekNumber).padStart(2, "0")}: ${chapterTitle.toUpperCase()}`,
  body: [`The pursuit has reached ${cityName}.`, "Full chapter copy will be supplied when this week is promoted from structural config."],
  supportingCards: [
    { id: "field_ops", title: "FIELD OPS", body: "Complete operations to improve the pursuit and uncover city intel." },
    { id: "prediction", title: "PREDICTION", body: "Estimate how far the team will get before the case closes." },
    { id: "nemesis", title: "NEMESIS", body: "Outwalk your assigned rival in a five-day duel." },
  ],
  primaryCta: "Begin the pursuit",
  secondaryCta: "Review assignment",
});

const structuralWeek = (
  weekNumber: number,
  cityName: string,
  chapterTitle: string,
  complicationLabel: string,
  evidenceTitle: string,
  interceptTitle: string,
  nextCityName: string,
): SeasonWeekConfig => ({
  id: `season_one_week_${String(weekNumber).padStart(2, "0")}`,
  seasonId,
  weekNumber,
  cityName,
  chapterTitle,
  complication: {
    id: chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    label: complicationLabel,
    summary: `${cityName} chapter complication placeholder.`,
  },
  briefing: structuralBriefing(weekNumber, cityName, chapterTitle),
  fieldOps: {
    fixedChallengeCodes: [],
    firstLinePayoff: "The first local lead is confirmed.",
    firstMovementPayoff: "The unit files its first verified movement report.",
  },
  specialOperation: { ...platformSweep, id: `week_${String(weekNumber).padStart(2, "0")}_operation`, label: "Special Operation" },
  evidence: {
    standardEvidenceId: `week${String(weekNumber).padStart(2, "0")}_standard_evidence`,
    interceptClueId: `week${String(weekNumber).padStart(2, "0")}_intercept_clue`,
  },
  closeCopy: defaultCloseCopy,
  nextCityTeaser: {
    cityName: nextCityName,
    header: nextCityName ? `NEXT: ${nextCityName.toUpperCase()}` : "SEASON FINALE",
    body: nextCityName ? `The next Meridian signal points to ${nextCityName}.` : "The Season One file is ready for final review.",
    selena: nextCityName ? "Bring what you found." : "Now you understand the shape of it.",
    cta: nextCityName ? "Continue the pursuit" : "Review the season file",
  },
});

export const SEASON_ONE_CONFIG = {
  id: seasonId,
  title: "The Lakefront Job",
  seasonNumber: 1,
  route: [
    {
      id: "season_one_week_01",
      seasonId,
      weekNumber: 1,
      cityName: "Chicago",
      chapterTitle: "The Lakefront Job",
      complication: {
        id: "cold_start",
        label: "Cold Start",
        summary: "Selena's lead begins as the full snapshotted group weekly target.",
      },
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 01: THE LAKEFRONT JOB",
        body: [
          "At 4:18 AM, Selena Chicago entered a sealed infrastructure chamber beneath the city.",
          "Eleven minutes later, a Meridian component was missing.",
          "She was last seen moving toward the elevated lines. Your unit has been assigned to recover the component before she leaves Chicago.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Complete operations to improve the pursuit and uncover city intel." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team will get before the case closes." },
          { id: "nemesis", title: "NEMESIS", body: "Outwalk your assigned rival in a five-day duel." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit identifies Selena's departure platform.",
        firstMovementPayoff: "Your route confirms Selena is using Chicago's grid to disguise her direction.",
      },
      specialOperation: platformSweep,
      evidence: {
        standardEvidenceId: "week01_brass_dial",
        interceptClueId: "week01_access_before_entry",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit reached the elevated line after Selena's signal disappeared. Surveillance could not confirm which route she took out of the city.",
          selena: "You searched the streets. You should have searched beneath them.",
          nextLead: "A matching mechanical signature has appeared in Detroit.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "The {{groupName}} confirmed Selena's departure route and kept her within operational range. She left Chicago before the unit reached the platform.",
          selena: "You found the route. Not the reason.",
          nextLead: "A mechanical dial marked with thirteen positions. One position is engraved with Chicago's coordinates.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "The unit reached the correct platform moments after Selena's train departed. A red glove was recovered beside the track.",
          selena: "Another platform. Another minute. That was the difference.",
          nextLead: "The Brass Dial shows recent use and fresh tool marks.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "The {{groupName}} reached Selena before the train cleared the platform. For seventeen seconds, the pursuit was over.\n\nThe lights failed. When power returned, Selena was gone.",
          selena: "Someone opened the Chicago node before I did. Ask your Bureau why.",
          nextLead: "Access Before Entry was recovered with the Brass Dial.",
        },
      },
      nextCityTeaser: {
        cityName: "Detroit",
        header: "NEXT: DETROIT",
        body: "A manufacturing system dormant for decades has restarted without an operator. Its mechanical signature matches the dial recovered in Chicago.",
        selena: "Bring the dial. You will understand it when the machine starts.",
        cta: "Continue the pursuit",
      },
    },
    structuralWeek(2, "Detroit", "The Machine Restarted", "Assembly Line", "Dormant Gear", "Unauthorized Restart", "Pittsburgh"),
    structuralWeek(3, "Pittsburgh", "Steel Signal", "Bridge Pressure", "Steel Key", "Pressure Record", "Washington, D.C."),
    structuralWeek(4, "Washington, D.C.", "The Redacted Mile", "Redaction", "Redacted Map", "Witness Timestamp", "Philadelphia"),
    structuralWeek(5, "Philadelphia", "The First Ledger", "Ledger Gap", "Founding Ledger", "Altered Seal", "New York City"),
    structuralWeek(6, "New York City", "Vertical Hold", "Signal Stack", "Stacked Relay", "Access Echo", "Boston"),
    structuralWeek(7, "Boston", "Old Current", "Harbor Drift", "Harbor Key", "Archive Wake", "Savannah"),
    structuralWeek(8, "Savannah", "The Missing Square", "Grid Shift", "Custodian Fragment", "Community List", "New Orleans"),
    structuralWeek(9, "New Orleans", "The Second Line", "Changing Rhythm", "Rhythmic Key", "Synthetic Pattern", "Austin"),
    structuralWeek(10, "Austin", "Dead Air", "Signal Interference", "Override Frequency", "Early Override", "Santa Fe"),
    structuralWeek(11, "Santa Fe", "The Missing Meridian", "Alignment", "The Continental Overlay", "Fourteenth Pulse", "Los Angeles"),
    structuralWeek(12, "Los Angeles", "Backlot System", "False Front", "Stage Door Key", "Scripted Pursuit", "San Francisco"),
    structuralWeek(13, "San Francisco", "The Meridian Opens", "Final Layer", "Regional Map", "Global Meridian", ""),
  ],
  evidence: [
    {
      id: "week01_brass_dial",
      kind: "standard",
      seasonId,
      weekNumber: 1,
      cityName: "Chicago",
      title: "THE BRASS DIAL",
      body: "A mechanical dial marked with thirteen positions. One position is engraved with Chicago's coordinates.",
      basicBody: "A mechanical dial marked with thirteen positions was recovered near the Chicago node.",
      enhancedBody: "The Brass Dial shows recent use, fresh tool marks, and one position engraved with Chicago's coordinates.",
      iconKey: "dial",
    },
    {
      id: "week01_access_before_entry",
      kind: "intercept",
      seasonId,
      weekNumber: 1,
      cityName: "Chicago",
      title: "ACCESS BEFORE ENTRY",
      body: "A surveillance photograph shows a credentialed Bureau figure entering the Chicago node before Selena arrived. The identity is obscured, but the timestamp is intact.",
      highlightedFragment: "before Selena arrived",
      iconKey: "credential",
    },
    ...Array.from({ length: 12 }, (_, index) => {
      const week = index + 2;
      const config = structuralWeek(
        week,
        ["Detroit", "Pittsburgh", "Washington, D.C.", "Philadelphia", "New York City", "Boston", "Savannah", "New Orleans", "Austin", "Santa Fe", "Los Angeles", "San Francisco"][index],
        "",
        "",
        "",
        "",
        "",
      );
      return [
        {
          id: config.evidence.standardEvidenceId,
          kind: "standard" as const,
          seasonId,
          weekNumber: week,
          cityName: config.cityName,
          title: `WEEK ${String(week).padStart(2, "0")} STANDARD EVIDENCE`,
          body: "Structural Season One evidence slot.",
        },
        {
          id: config.evidence.interceptClueId,
          kind: "intercept" as const,
          seasonId,
          weekNumber: week,
          cityName: config.cityName,
          title: `WEEK ${String(week).padStart(2, "0")} INTERCEPT CLUE`,
          body: "Structural Season One intercept clue slot.",
        },
      ];
    }).flat(),
  ],
} satisfies SeasonConfig;

export const WEEK_ONE_CHICAGO = SEASON_ONE_CONFIG.route[0];

export function getSeasonWeek(weekNumber: number): SeasonWeekConfig | undefined {
  return SEASON_ONE_CONFIG.route.find((week) => week.weekNumber === weekNumber);
}

export function getEvidence(evidenceId: string): EvidenceConfig | undefined {
  return SEASON_ONE_CONFIG.evidence.find((evidence) => evidence.id === evidenceId);
}
