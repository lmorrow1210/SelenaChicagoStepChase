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

export interface RitualVariantCopy {
  headline: string;
  body: string;
  selena?: string;
  cta?: string;
}

export interface WeekRitualCopy {
  midweek: {
    strongPace: RitualVariantCopy;
    expectedPace: RitualVariantCopy;
    recoveryNeeded: RitualVariantCopy;
    incompleteData: RitualVariantCopy;
    storyReveal: RitualVariantCopy;
  };
  finalPush: {
    label: string;
    selena: string;
  };
  suddenDeath: RitualVariantCopy;
  caseClosing: RitualVariantCopy & { supporting: string };
  specialOperationFiction: string;
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
  rituals: WeekRitualCopy;
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

// Exactly 24 codes — one per non-free board slot. The two Chicago story
// tiles from the product doc (Trace the Grid, Find the Platform) are story
// payoffs triggered by board state, not tiles (a "complete a line" tile on
// the board it completes would be circular). Long Route, Quick Recovery, and
// Split Shift use the approved V1 substitutions from the technical plan.
const fieldOpsCodes = [
  "steps_1k_day",
  "steps_5k_day",
  "steps_10k_day",
  "target_50pct_day",
  "target_100pct_day",
  "steps_2k_two_days",
  "steps_any_three_days",
  "steps_12k_day", // Long Route V1 substitution
  "steps_8k_day", // Quick Recovery V1 substitution
  "weekly_steps_15k",
  "steps_1k_noon",
  "steps_1k_after_6",
  "split_shift_1k", // Split Shift — needs intraday data; never false-fires without it
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
  "workout_today", // accessible filler — board needs 24, story tiles became payoffs
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

const defaultRituals = (cityName: string): WeekRitualCopy => ({
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.",
      selena: "You are moving quickly. I have corrected my estimate.",
      cta: "Review the new lead",
    },
    expectedPace: {
      headline: "PURSUIT MAINTAINED",
      body: "The unit remains on pace to keep Selena within reach.",
      selena: "Adequate. The Bureau does enjoy an adequate performance.",
    },
    recoveryNeeded: {
      headline: "THE TRAIL IS COOLING",
      body: "The unit is currently projected to lose contact before Sunday.",
      cta: "See the recovery plan",
    },
    incompleteData: {
      headline: "FIELD REPORTS INCOMPLETE",
      body: "The Bureau cannot calculate a reliable pursuit estimate until trackers respond.",
      cta: "Review sync status",
    },
    storyReveal: {
      headline: "LOCAL LEAD CONFIRMED",
      body: `The unit's field work has confirmed Selena's movements inside ${cityName}.`,
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "You are close enough to become inconvenient.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Today decides the matchup. Most verified steps by midnight wins.",
  },
  caseClosing: {
    headline: "CASE CLOSING",
    body: "Final field reports are being reconciled.",
    supporting: "This may update the group's pursuit result, nemesis matchups, and Oracle award.",
  },
  specialOperationFiction: `Bureau analysts have narrowed Selena's position inside ${cityName}. The unit must cover the exits before she moves on.`,
});

const WEEK_ONE_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Chicago"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nSurveillance now places her near the elevated lines.",
      selena: "You are moving quickly. I wonder whether you are watching the right train.",
      cta: "Review the new lead",
    },
    expectedPace: {
      headline: "PURSUIT MAINTAINED",
      body: "The unit remains on pace to keep Selena within reach.",
      selena: "Adequate. The Bureau does enjoy an adequate performance.",
    },
    recoveryNeeded: {
      headline: "THE TRAIL IS COOLING",
      body: "The unit is currently projected to lose contact before Sunday.",
      cta: "See the recovery plan",
    },
    incompleteData: {
      headline: "FIELD REPORTS INCOMPLETE",
      body: "The Bureau cannot calculate a reliable pursuit estimate until trackers respond.",
      cta: "Review sync status",
    },
    storyReveal: {
      headline: "DEPARTURE ROUTE CONFIRMED",
      body: "Selena boarded a northbound train—but exited before the next confirmed camera sighting.\n\nInvestigators recovered a partial image of a brass dial marked with thirteen positions.",
    },
  },
  specialOperationFiction:
    "Bureau analysts have narrowed Selena's route to three elevated platforms. The unit must cover all exits before she changes lines.",
};

// Week 2 Detroit — implemented from docs/canon/cities/week-02-detroit.md.
// Built like WEEK_ONE_RITUALS: defaults for the standard states, Detroit copy
// for the strong-pace taunt and the story reveal.
const WEEK_TWO_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Detroit"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nField Ops now place her in the freight corridor near the river.",
      selena: "Halfway through the week and you are still reading the grid wrong. Try the one beneath it.",
      cta: "Review the new lead",
    },
    expectedPace: {
      headline: "PURSUIT MAINTAINED",
      body: "The unit remains on pace to keep Selena within reach.",
      selena: "Adequate. The Bureau does enjoy an adequate performance.",
    },
    recoveryNeeded: {
      headline: "THE TRAIL IS COOLING",
      body: "The unit is currently projected to lose contact before Sunday.",
      cta: "See the recovery plan",
    },
    incompleteData: {
      headline: "FIELD REPORTS INCOMPLETE",
      body: "The Bureau cannot calculate a reliable pursuit estimate until trackers respond.",
      cta: "Review sync status",
    },
    storyReveal: {
      headline: "FREIGHT CORRIDOR CONFIRMED",
      body: "Selena moved from the plant district to the old freight line along the river—off the street grid the whole way.\n\nField teams recovered a routing diagram with hand-marked revisions.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "You are close enough that I have started checking the platform twice.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "Your nemesis has the same idea you do. One of you is wrong about which route to take.",
  },
  specialOperationFiction:
    "Bureau analysts have narrowed Selena's route to three freight gates on Detroit's east side. The unit must cover every gate before she changes lines.",
};

const structuralBriefing = (weekNumber: number, cityName: string, chapterTitle: string) => ({
  label: "BUREAU FIELD BRIEFING",
  title: `CASE ${String(weekNumber).padStart(2, "0")}: ${chapterTitle.toUpperCase()}`,
  body: [`The pursuit has reached ${cityName}.`, "Local briefing details remain sealed until this chapter opens."],
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
    summary: `${cityName} chapter field complication.`,
  },
  rituals: defaultRituals(cityName),
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
    body: nextCityName ? `The trail continues to ${nextCityName}.` : "The Season One file is ready for final review.",
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
        summary:
          "The team begins with incomplete surveillance. Completing the first qualifying Field Ops line identifies Selena's real departure route.",
      },
      rituals: WEEK_ONE_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 01: THE LAKEFRONT JOB",
        body: [
          "At 4:18 AM, Selena Chicago entered a sealed infrastructure chamber beneath the city.",
          "Eleven minutes later, a sealed brass component was missing.",
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
          story: "{{groupName}} confirmed Selena's departure route and kept her within operational range. She left Chicago before the unit reached the platform.",
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
          story: "{{groupName}} reached Selena before the train cleared the platform. For seventeen seconds, the pursuit was over.\n\nThe lights failed. When power returned, Selena was gone.",
          selena: "Seventeen seconds. That is the closest anyone has come to me. Remember the feeling — it does not repeat often.",
          nextLead: "A calling card was recovered with the Brass Dial.",
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
    // Weeks 2-13 are structural stubs; chapter title + complication label are
    // synced to docs/canon/season-one-route.md (the authoritative roadmap) and
    // stripped of parked Meridian lore. The 5th/6th args (evidence/intercept
    // titles) are currently unused by structuralWeek; kept as cleaned
    // placeholders. Each week is fully replaced when its content pack ships.
    {
      id: "season_one_week_02",
      seasonId,
      weekNumber: 2,
      cityName: "Detroit",
      chapterTitle: "The Machine Restarted",
      complication: {
        id: "assembly_line",
        label: "Assembly Line",
        summary:
          "Selena is moving through Detroit's old manufacturing infrastructure — long corridors, loading bays, and freight routes the city grid doesn't show. The unit starts cold before the first field operative logs movement.",
      },
      rituals: WEEK_TWO_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 02: THE MACHINE RESTARTED",
        body: [
          "At 6:40 AM, a decommissioned stamping plant in the Milwaukee Junction district powered on without authorization. Security footage shows the facility operating under its own systems for eleven minutes before the grid cut out.",
          "Selena was identified leaving the building via a service corridor that runs beneath Woodward Avenue. She was carrying something. The footage did not capture what.",
          "Your unit has been assigned to track her through Detroit's industrial infrastructure before she reaches the Michigan Central corridor.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Complete operations to uncover Selena's route through Detroit's industrial grid." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        // Decision A (2026-07-17): reuse the shared 24 detector codes; the
        // Detroit-flavored bingo labels in the pack are a later migration.
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit identifies which corridor Selena used to leave the plant.",
        firstMovementPayoff: "Your route confirms Selena is moving along the old freight line, not the street grid.",
      },
      specialOperation: { ...platformSweep, id: "week_02_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week02_routing_diagram",
        interceptClueId: "week02_pittsburgh_corridor",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit covered ground but not the right ground. Selena used the service tunnels beneath the Woodward corridor — routes that don't appear on the Bureau's maps — and was two hours ahead before the first field report came in.",
          selena: "Detroit has an underground grid. Most people do not know it exists. Now you do.",
          nextLead: "A worn routing diagram was recovered near the freight entrance of the Milwaukee Junction plant.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} tracked Selena through the industrial district and confirmed her departure route before she cleared the city. She was moving, but the unit kept pace.",
          selena: "You read the freight lines. That is more than the Bureau managed.",
          nextLead: "A worn routing diagram shows hand-marked revisions to Detroit's original industrial corridor layout.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} reached the Michigan Central corridor ninety minutes after Selena. A Bureau contact confirmed she had been in the main hall — watching the windows — before departing north.",
          selena: "You found the station. I was watching from the upper level. Another few hours and that would have been a different kind of conversation.",
          nextLead: "One corridor on the diagram is circled and dated in a different ink — three weeks before the plant powered on.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} reached the Michigan Central main hall as Selena was crossing the platform. She did not run. She waited just long enough to look at the diagram in the operative's hand, then stepped through a service door that shouldn't have opened.",
          selena: "You found it. I expected that would take another week. Adjust your estimate of yourself accordingly.",
          nextLead: "A second corridor is marked on the diagram — in Pittsburgh.",
        },
      },
      nextCityTeaser: {
        cityName: "Pittsburgh",
        header: "NEXT: PITTSBURGH",
        body: "The corridor in the diagram leads to a freight bridge above the Monongahela. A rail contact in Pittsburgh confirmed activity at the south end — three days ago.",
        selena: "Steel cities have long memories. The question is whether you know how to read them.",
        cta: "Continue the pursuit",
      },
    },
    structuralWeek(3, "Pittsburgh", "Three Rivers, Two Trails", "Split Trail", "The Convergence Map", "", "Washington, D.C."),
    structuralWeek(4, "Washington, D.C.", "The Monument Cipher", "Redacted Orders", "The Redacted Charter", "", "Philadelphia"),
    structuralWeek(5, "Philadelphia", "The Liberty Exchange", "Shared Custody", "The Custodian Ledger", "", "New York City"),
    structuralWeek(6, "New York City", "Five Borough Decoy", "False Positives", "The Identity Cascade", "", "Boston"),
    structuralWeek(7, "Boston", "The Midnight Signal", "Signal Window", "The Continuity Protocol", "", "Savannah"),
    structuralWeek(8, "Savannah", "The Garden of Shadows", "Unwritten Route", "The Missing Square", "", "New Orleans"),
    structuralWeek(9, "New Orleans", "The Second Line", "Changing Rhythm", "The Rhythmic Key", "", "Austin"),
    structuralWeek(10, "Austin", "Dead Air", "Signal Interference", "The Override Frequency", "", "Santa Fe"),
    structuralWeek(11, "Santa Fe", "True North", "Alignment", "The Alignment Chart", "", "Los Angeles"),
    structuralWeek(12, "Los Angeles", "The Moving Picture", "Edited Reality", "The Composite Record", "", "San Francisco"),
    structuralWeek(13, "San Francisco", "One Step Ahead", "Final Convergence", "The Final Record", "", ""),
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
      basicBody: "A mechanical dial marked with thirteen positions was recovered near the sealed chamber beneath the city.",
      enhancedBody: "The Brass Dial shows recent use, fresh tool marks, and one position engraved with Chicago's coordinates.",
      iconKey: "dial",
    },
    {
      id: "week01_access_before_entry",
      kind: "intercept",
      seasonId,
      weekNumber: 1,
      cityName: "Chicago",
      title: "THE CALLING CARD",
      body: "Left at the chamber entrance: a card showing one footprint set ahead of another. On the back, one handwritten line — 'You are faster than they told me.'",
      highlightedFragment: "You are faster than they told me.",
      iconKey: "card",
    },
    {
      id: "week02_routing_diagram",
      kind: "standard",
      seasonId,
      weekNumber: 2,
      cityName: "Detroit",
      title: "THE ROUTING DIAGRAM",
      body: "A worn routing diagram showing hand-marked revisions to Detroit's original industrial corridor layout.",
      basicBody: "A worn routing diagram recovered near the freight entrance of the Milwaukee Junction plant.",
      enhancedBody: "A worn routing diagram with hand-marked revisions. One corridor is circled and dated in a different ink — three weeks before the plant powered on.",
      highlightedFragment: "circled and dated in a different ink",
      iconKey: "diagram",
    },
    {
      id: "week02_pittsburgh_corridor",
      kind: "intercept",
      seasonId,
      weekNumber: 2,
      cityName: "Detroit",
      title: "SECOND CORRIDOR",
      body: "A routing diagram with a second corridor marked in Pittsburgh — in different ink, added later.",
      enhancedBody: "A routing diagram with a second corridor marked in Pittsburgh. The handwriting matches nothing in the Bureau's records.",
      highlightedFragment: "The handwriting matches nothing in the Bureau's records.",
      iconKey: "corridor",
    },
    // Weeks 3-13 remain structural stubs — generic sealed evidence until each
    // week's content pack is implemented (see docs/canon/IMPLEMENTING-A-CITY.md).
    ...Array.from({ length: 11 }, (_, index) => {
      const week = index + 3;
      const config = structuralWeek(
        week,
        ["Pittsburgh", "Washington, D.C.", "Philadelphia", "New York City", "Boston", "Savannah", "New Orleans", "Austin", "Santa Fe", "Los Angeles", "San Francisco"][index],
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
          body: "Evidence details remain sealed until this chapter is fully briefed.",
        },
        {
          id: config.evidence.interceptClueId,
          kind: "intercept" as const,
          seasonId,
          weekNumber: week,
          cityName: config.cityName,
          title: `WEEK ${String(week).padStart(2, "0")} INTERCEPT CLUE`,
          body: "Intercept details remain sealed until this chapter is fully briefed.",
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
