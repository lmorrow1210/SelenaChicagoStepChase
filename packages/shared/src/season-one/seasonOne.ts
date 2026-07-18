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

// Week 3 Pittsburgh — implemented from docs/canon/cities/week-03-pittsburgh.md.
const WEEK_THREE_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Pittsburgh"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nField reports are starting to agree on which trail she walked.",
      selena: "You committed to a trail. Brave. We will see whether it was the one I took.",
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
      headline: "TRAIL CONFIRMED",
      body: "The field reports agree: Selena took the river trail along the Monongahela, not the incline.\n\nBoth routes converge at the Point, where the three rivers meet.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "You are close enough now that the two trails stop mattering.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival picked different trails. One of you has been right all week. Today you find out which.",
  },
  specialOperationFiction:
    "Bureau analysts have narrowed Selena's crossing to three river bridges. The unit must cover every span before she reaches the far bank.",
};

// Week 4 Washington, D.C. — implemented from docs/canon/cities/week-04-washington-dc.md.
const WEEK_FOUR_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Washington, D.C."),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nEnough redactions are cleared to read the real assignment.",
      selena: "You are learning to read the black bars instead of the words. Keep going. That is where they hide things.",
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
      headline: "REDACTIONS CLEARED",
      body: "The unit has cleared enough of the archive's redactions to read the real objective. It is not the one issued Monday morning.\n\nSelena moved along the Mall, in the open, while the Bureau watched the government corridor.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "You are one page from what I already read. Hurry.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival were handed the same redacted orders. Today shows who read them better.",
  },
  specialOperationFiction:
    "Bureau analysts have narrowed Selena's route to three archive exits along the Mall. The unit must cover every door before she reaches the reading room.",
};

// Week 5 Philadelphia — implemented from docs/canon/cities/week-05-philadelphia.md.
const WEEK_FIVE_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Philadelphia"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nThe shared objective is filling in — but only where the team showed up together.",
      selena: "I can see exactly which days your unit moved as one and which days it did not. So can you, now.",
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
      headline: "CHAIN OF CUSTODY FORMING",
      body: "The ledger is coming back together — but only where enough of the team contributed at once. The gaps are the days people worked alone.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "One more custodian steps up and you have it. Not one more mile from your best walker.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "The team objective is settled. This last one is just you and your rival. Different rules — I know.",
  },
  specialOperationFiction:
    "Bureau analysts need at least three operatives to hold the exchange hall's doors at once. No single custodian can cover it alone.",
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
    {
      id: "season_one_week_03",
      seasonId,
      weekNumber: 3,
      cityName: "Pittsburgh",
      chapterTitle: "Three Rivers, Two Trails",
      complication: {
        id: "split_trail",
        label: "Split Trail",
        summary:
          "Two routes lead from the river bridge into Pittsburgh — the trail along the Monongahela and the incline up Mount Washington. Both reach the same place. Selena took one; the unit works both until her route is confirmed.",
      },
      rituals: WEEK_THREE_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 03: THREE RIVERS, TWO TRAILS",
        body: [
          "At 5:12 AM, a freight signal on the Monongahela rail bridge switched from idle to active — no scheduled train, no operator on record. By the time a rail contact reached the control house, the switch had been reset by hand.",
          "Selena was seen crossing to the south bank on foot. Two routes lead from that bridge into the city: the river trail along the Mon, and the incline up Mount Washington. Both reach the same place. She took one. The Bureau does not know which.",
          "Your unit has been assigned to work both trails until her route is confirmed — before she reaches the Point, where the three rivers meet.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Complete operations to confirm which trail Selena walked into the city." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit confirms which of the two trails Selena actually walked.",
        firstMovementPayoff: "Your route rules out the incline — she stayed low, along the water.",
      },
      specialOperation: { ...platformSweep, id: "week_03_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week03_convergence_map",
        interceptClueId: "week03_eastern_line",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit committed to the incline and worked it hard. Selena had taken the river trail — the low one, along the Mon — and reached the Point before the field reports could correct course.",
          selena: "Two trails join at the same place. You only needed to be on the right one when they did.",
          nextLead: "A folded transit map was recovered near the Monongahela rail bridge.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} worked both trails until the reports agreed, then followed the right one to the river's edge. Selena was ahead, but the unit never lost the bank.",
          selena: "You read the water before you read the map. That is the correct order.",
          nextLead: "A layered map traces two trails to the same point where the rivers meet.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} reached the Point twenty minutes behind her. A park contact confirmed she had stood at the fountain where the rivers meet, watching the far bank, before crossing north.",
          selena: "You made it to the confluence. I was still deciding which river to follow out. You nearly made the decision for me.",
          nextLead: "Two trails on the map end at the same mark at the Point.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} reached the fountain at the Point as Selena was folding a map into her coat. She let the operative see it — two trails, one destination — then walked into the crowd along the north shore and did not reappear.",
          selena: "You caught both trails at once. I did not think that was possible with the time you had. Note the feeling.",
          nextLead: "A third line on the map continues east — toward Washington.",
        },
      },
      nextCityTeaser: {
        cityName: "Washington, D.C.",
        header: "NEXT: WASHINGTON, D.C.",
        body: "The eastern line ends at a records archive off the National Mall. A contact there flagged a reading-room request filed under a researcher credential that was deactivated years ago.",
        selena: "In Washington, the important documents are the ones with the most crossed out. I am going to read one anyway.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_04",
      seasonId,
      weekNumber: 4,
      cityName: "Washington, D.C.",
      chapterTitle: "The Monument Cipher",
      complication: {
        id: "redacted_orders",
        label: "Redacted Orders",
        summary:
          "Selena is after a document in a records archive off the National Mall — one whose restricted passages are still sealed. The unit's own field objectives arrive partly redacted, and must be decoded before the true assignment is legible.",
      },
      rituals: WEEK_FOUR_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 04: THE MONUMENT CIPHER",
        body: [
          "At 9:30 AM, a reading-room request at a records archive off the National Mall was filed under a researcher credential that had been deactivated years earlier. The document pulled: a founding-era charter, portions of which remain restricted.",
          "Selena left before staff reached the desk. The request slip she left behind was itself redacted — someone had blacked out the one box that names the document.",
          "Your unit has been assigned to reconstruct what she was reading before she leaves Washington. Expect your own orders to arrive incomplete.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Decode your redacted objectives, then complete them to trace what Selena read." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit clears the first redaction and reads its true objective.",
        firstMovementPayoff: "Your route confirms she moved along the Mall, in the open, not the government corridor.",
      },
      specialOperation: { ...platformSweep, id: "week_04_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week04_redacted_charter",
        interceptClueId: "week04_unredacted_line",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit worked the objectives it was given — but the objectives were redacted, and the parts left visible led the wrong way. Selena read the charter and was gone before the real assignment came clear.",
          selena: "The Bureau counted on you reading only what it left visible.",
          nextLead: "A photostat of a founding-era charter, most of its text blacked out, was recovered from the reading room.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} cleared enough of the redactions to read the true objectives and follow Selena's path through the archive district. She stayed ahead, but the unit was reading the same document by the end.",
          selena: "You got past the black bars. Most people stop at them.",
          nextLead: "A founding-era charter under heavy redaction, its restricted passages sealed with red stamps.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} reached the reading room forty minutes after Selena signed out. The charter was still on the desk, open to the restricted section — and one seal had been lifted, cleanly, by someone who had done it before.",
          selena: "You reached the desk. You even saw which page. Redaction does not destroy the truth. It only delays it.",
          nextLead: "The red seals on the charter are modern — applied long after it was written.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} reached the reading room while Selena was still at the desk, the charter open in front of her. She turned it so the operative could see the one line she had uncovered, then walked out through the staff corridor as if her credential were still good.",
          selena: "You read it with me. Now you know it is not the document that was redacted — it is the date. Decide what that is worth to you.",
          nextLead: "One line survived the redaction, naming a signing hall in Philadelphia.",
        },
      },
      nextCityTeaser: {
        cityName: "Philadelphia",
        header: "NEXT: PHILADELPHIA",
        body: "The one line the redactors missed names a hall in Philadelphia — the room where the original charter was signed. The copy is in Washington. The original never left.",
        selena: "They kept the copy and hid the original. I am going to read the original.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_05",
      seasonId,
      weekNumber: 5,
      cityName: "Philadelphia",
      chapterTitle: "The Liberty Exchange",
      complication: {
        id: "shared_custody",
        label: "Shared Custody",
        summary:
          "The document Selena is after cannot be moved by one person — it is held under a shared-custody arrangement that requires several hands at once. The unit's objective works the same way: individual effort alone won't unlock it.",
      },
      rituals: WEEK_FIVE_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 05: THE LIBERTY EXCHANGE",
        body: [
          "The line Selena uncovered in Washington named a signing hall in Philadelphia — and the original document the Washington copy was made from. That original is held under shared custody: no single custodian can release it alone.",
          "At 7:15 AM, three of the named custodians were reported unreachable within the same ten minutes. By the time the fourth arrived, the ledger recording the document's chain of custody was gone.",
          "Your unit has been assigned to reconstruct the ledger before Selena leaves the city. It will take more than one of you — that is the point.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Contribute to shared objectives — the ledger only comes together with the whole team." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit confirms the ledger can't be lifted by one operative — it needs the whole team.",
        firstMovementPayoff: "Your contribution counts toward the shared objective, but only alongside others.",
      },
      specialOperation: { ...platformSweep, id: "week_05_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week05_custodian_ledger",
        interceptClueId: "week05_new_york_column",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "A few operatives carried most of the week, and it wasn't enough — the ledger's chain of custody needed more hands than showed up. Selena walked the document out through a gap that only exists when a team acts like individuals.",
          selena: "You worked as individuals. This was designed for people who don't.",
          nextLead: "A coded ledger was recovered near the Independence Hall archive, its columns filled in more than one hand.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} put enough hands on the shared objective to reconstruct most of the ledger and hold the chain of custody together. Selena kept ahead, but she couldn't slip through a gap the team had closed.",
          selena: "You moved together. That is rarer than distance.",
          nextLead: "A coded ledger assigns entries to cities, institutions, and stewards named only by initials.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} reconstructed the ledger with the whole team on it and reached the exchange hall thirty minutes behind her. A custodian confirmed Selena had read the chain of custody end to end before leaving — and had signed no name.",
          selena: "You held it together, all of you at once. That is how it was meant to be held. No one was ever meant to hold this alone.",
          nextLead: "Every entry in the ledger is countersigned by at least three different hands.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} filled the ledger's last entries as a unit and reached the hall while Selena was still inside. She looked at the reconstructed chain of custody, saw every name filled by the team, set the document down, and left through a door three custodians would have had to open together.",
          selena: "You did it the way it was built to be done. I did not expect a Bureau unit to manage that. Adjust accordingly.",
          nextLead: "One column in the ledger ties five stewards to a single New York address.",
        },
      },
      nextCityTeaser: {
        cityName: "New York City",
        header: "NEXT: NEW YORK CITY",
        body: "The ledger's New York column lists five stewards at one address. A contact in the city says all five have been seen this week — in five different boroughs, at the same hour.",
        selena: "Five sightings, one person, five boroughs. Decide which one is real before the Bureau tells you which to believe.",
        cta: "Continue the pursuit",
      },
    },
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
    {
      id: "week03_convergence_map",
      kind: "standard",
      seasonId,
      weekNumber: 3,
      cityName: "Pittsburgh",
      title: "THE CONVERGENCE MAP",
      body: "A layered map of Pittsburgh's rivers, freight lines, and buried water channels, with two trails traced to the same point.",
      basicBody: "A folded transit map recovered near the Monongahela rail bridge.",
      enhancedBody: "A layered map of Pittsburgh's rivers, freight lines, and buried channels. Two separate trails are drawn in — and both end at the same mark at the Point.",
      highlightedFragment: "both end at the same mark at the Point",
      iconKey: "map",
    },
    {
      id: "week03_eastern_line",
      kind: "intercept",
      seasonId,
      weekNumber: 3,
      cityName: "Pittsburgh",
      title: "THE EASTERN LINE",
      body: "A line on the map continues east past the rivers, hand-drawn, ending at a point in Washington.",
      enhancedBody: "A line continues east to Washington. It was drawn before the two Pittsburgh trails were ever walked.",
      highlightedFragment: "It was drawn before the two Pittsburgh trails were ever walked.",
      iconKey: "route",
    },
    {
      id: "week04_redacted_charter",
      kind: "standard",
      seasonId,
      weekNumber: 4,
      cityName: "Washington, D.C.",
      title: "THE REDACTED CHARTER",
      body: "A founding-era charter under heavy redaction, its restricted passages sealed with red archival stamps.",
      basicBody: "A photostat of a founding-era charter, most of its text blacked out, recovered from the archive reading room.",
      enhancedBody: "A founding-era charter under heavy redaction. The red seals are modern — applied long after the document itself was written.",
      highlightedFragment: "The red seals are modern",
      iconKey: "document",
    },
    {
      id: "week04_unredacted_line",
      kind: "intercept",
      seasonId,
      weekNumber: 4,
      cityName: "Washington, D.C.",
      title: "ONE UNREDACTED LINE",
      body: "A single line escaped the redactor's pen, naming a signing hall in Philadelphia.",
      enhancedBody: "One line survived the redaction, naming a hall in Philadelphia — beside a date that does not match the official record.",
      highlightedFragment: "a date that does not match the official record",
      iconKey: "seal",
    },
    {
      id: "week05_custodian_ledger",
      kind: "standard",
      seasonId,
      weekNumber: 5,
      cityName: "Philadelphia",
      title: "THE CUSTODIAN LEDGER",
      body: "A coded ledger assigning entries to cities, institutions, and stewards named only by initials — no single owner anywhere in it.",
      basicBody: "A coded ledger recovered near the Independence Hall archive, its columns filled in more than one hand.",
      enhancedBody: "A coded ledger with no single owner. Every entry is countersigned by at least three different hands.",
      highlightedFragment: "countersigned by at least three different hands",
      iconKey: "ledger",
    },
    {
      id: "week05_new_york_column",
      kind: "intercept",
      seasonId,
      weekNumber: 5,
      cityName: "Philadelphia",
      title: "THE NEW YORK COLUMN",
      body: "One column ties five separate stewards to a single New York address.",
      enhancedBody: "Five stewards, one New York address — and none of the five names appears anywhere else in the ledger.",
      highlightedFragment: "none of the five names appears anywhere else in the ledger",
      iconKey: "column",
    },
    // Weeks 6-13 remain structural stubs — generic sealed evidence until each
    // week's content pack is implemented (see docs/canon/IMPLEMENTING-A-CITY.md).
    ...Array.from({ length: 8 }, (_, index) => {
      const week = index + 6;
      const config = structuralWeek(
        week,
        ["New York City", "Boston", "Savannah", "New Orleans", "Austin", "Santa Fe", "Los Angeles", "San Francisco"][index],
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
