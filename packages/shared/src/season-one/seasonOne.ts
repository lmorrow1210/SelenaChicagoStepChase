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

// Week 6 New York City — implemented from docs/canon/cities/week-06-new-york-city.md.
const WEEK_SIX_RITUALS: WeekRitualCopy = {
  ...defaultRituals("New York City"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nTwo of the five sightings have already collapsed under their own timing.",
      selena: "You are throwing out the fakes faster than the Bureau expected. Keep discarding. The truth is what's left.",
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
      headline: "DECOYS COLLAPSING",
      body: "Two of the five borough sightings have fallen apart under their own timing. Three remain, and the unit's predictions are sharpening the field.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "You found the real one. Now the only question is speed.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival each backed a different sighting. Today, one of you was watching a ghost.",
  },
  specialOperationFiction:
    "Bureau analysts have narrowed the real Selena to three of the five boroughs. The unit must cover every candidate before the decoys reset.",
};

// Week 7 Boston — implemented from docs/canon/cities/week-07-boston.md.
const WEEK_SEVEN_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Boston"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nThe unit has answered the harbor signal on two nights now — enough hands, in time.",
      selena: "You are learning to be in the right place at the right hour. Most operatives only manage the place.",
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
      headline: "SIGNAL ANSWERED",
      body: "The unit hit the evening window enough nights to answer the harbor signal. The nights it missed are just as visible.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "Answer one more signal and you are level with me. After dark. Don't be late.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival both know when the signal goes out. Tonight it comes down to who is standing in the window.",
  },
  specialOperationFiction:
    "The harbor signal only answers after dark. Bureau analysts need enough of the unit in the field during the evening window before it closes.",
};

// Week 8 Savannah — implemented from docs/canon/cities/week-08-savannah.md.
const WEEK_EIGHT_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Savannah"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nThe route is surfacing — but only where the unit did different kinds of field work.",
      selena: "You are finding the turns the surveyors missed. That takes range, not mileage.",
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
      headline: "ROUTE SURFACING",
      body: "The unwritten route is coming into view where the unit varied its field work. The stretches it tried to brute-force are still blank.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "One more kind of effort and the whole route is yours. Not one more lap.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival both learned the city's real paths this week. Today, one of you walks them faster.",
  },
  specialOperationFiction:
    "Selena's route runs through squares the surveyors left off the map. Bureau analysts need the unit to reveal each one through varied field work before she reaches the last.",
};

// Week 9 New Orleans — implemented from docs/canon/cities/week-09-new-orleans.md.
const WEEK_NINE_RITUALS: WeekRitualCopy = {
  ...defaultRituals("New Orleans"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nThe unit that kept a steady tempo is well into the route.",
      selena: "You are keeping time. That is harder than going fast, and it is the only thing that reads here.",
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
      headline: "TEMPO FOUND",
      body: "The rhythm is reading where the unit kept a steady tempo. The days someone tried to make up the whole week at once barely moved it.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "Hold the tempo two more days and you are even with me. Do not rush the ending.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival both kept the rhythm all week. Today is the one measure where only volume counts.",
  },
  specialOperationFiction:
    "The second line only holds if enough of the unit keeps the beat together. Bureau analysts need the group in step through the parade window.",
};

// Week 10 Austin — implemented from docs/canon/cities/week-10-austin.md.
const WEEK_TEN_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Austin"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nThe unit's synced days are reading as verified pursuit; the un-synced ones are still static.",
      selena: "You are learning the difference between a signal and the noise that resembles it. Most never do.",
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
      headline: "SIGNAL CLEARING",
      body: "The unit's verified pursuit is separating from the static. The real gap is smaller than the estimate — or larger. Confirm to find out.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "Your verified pursuit puts you right behind me. Do not let an estimate tell you otherwise.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it — on verified steps only.",
    selena: "Static will not help either of you today. Only what your trackers can confirm counts.",
  },
  specialOperationFiction:
    "Only verified steps cut through the interference. Bureau analysts need the unit synced and confirmed before the window closes.",
};

// Week 11 Santa Fe — implemented from docs/canon/cities/week-11-santa-fe.md.
// Ships simplified: the "Alignment" bonus is the existing participation-threshold
// bonus (no season-evidence dependency).
const WEEK_ELEVEN_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Santa Fe"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nWhen the unit pulled together, the alignment bonus climbed.",
      selena: "You are learning to hold a bearing as a group. That is rarer out here than water.",
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
      headline: "ALIGNMENT HOLDING",
      body: "The survey markers only mean something when the unit holds the same bearing. Where it did, the alignment bonus built; where it scattered, the markers stayed just points.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "One more aligned day and you have the whole figure. Hold the bearing.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "The alignment was the team's work. This last measure is just you and your rival, holding your own line.",
  },
  specialOperationFiction:
    "The markers only align when enough of the unit holds the same bearing. Bureau analysts need the whole team pulling one direction.",
};

// Week 12 Los Angeles — implemented from docs/canon/cities/week-12-los-angeles.md.
const WEEK_TWELVE_RITUALS: WeekRitualCopy = {
  ...defaultRituals("Los Angeles"),
  midweek: {
    strongPace: {
      headline: "THE GAP IS CLOSING",
      body: "{{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nThe unit's field work has thrown out two of the staged reports already.",
      selena: "You stopped trusting your eyes and started reading the timestamps. That is the only way through this city.",
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
      headline: "METADATA SURFACING",
      body: "The footage still looks convincing. The data underneath it does not — and the unit has already discarded two of the staged reports.",
    },
  },
  finalPush: {
    label: "FINAL PUSH",
    selena: "You have nearly found the real footage. Do not let the pretty one distract you now.",
  },
  suddenDeath: {
    headline: "SUDDEN DEATH",
    body: "Five days even. Saturday decides it.",
    selena: "You and your rival were handed the same edited reel. Today, one of you believed a fake.",
  },
  specialOperationFiction:
    "Every convincing clip is a lead the unit has to check. Bureau analysts need the metadata surfaced before the real footage is buried.",
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
    {
      id: "season_one_week_06",
      seasonId,
      weekNumber: 6,
      cityName: "New York City",
      chapterTitle: "Five Borough Decoy",
      complication: {
        id: "false_positives",
        label: "False Positives",
        summary:
          "Selena is reported in all five boroughs at once. Most of the sightings are decoys — relays and stand-ins timed to look real. The unit must sort the false leads from the one that isn't before committing the week.",
      },
      rituals: WEEK_SIX_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 06: FIVE BOROUGH DECOY",
        body: [
          "Overnight, Selena was reported in all five boroughs — the harbor, midtown, the Bronx, Brooklyn, and Queens — within the same hour. Every sighting checked out on its own. Together, they are impossible.",
          "The Philadelphia ledger named five stewards at one New York address. The Bureau now believes the five sightings and the five names are the same trick: one person, made to look like many.",
          "Your unit has been assigned to find the sighting that is real. Four of them want your attention. Only one deserves it.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Complete operations to rule out the staged sightings and narrow the real lead." },
          { id: "prediction", title: "PREDICTION", body: "A sharper prediction improves the route estimate — accuracy matters this week." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit rules out its first decoy sighting.",
        firstMovementPayoff: "Your route confirms one borough's lead was staged — the timing doesn't hold.",
      },
      specialOperation: { ...platformSweep, id: "week_06_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week06_identity_cascade",
        interceptClueId: "week06_boston_feed",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit committed to the borough with the clearest footage. It was the best-made decoy — a relayed feed and a stand-in with a matching coat. The real Selena moved through a borough no one was watching.",
          selena: "You chased the face that was chosen for you.",
          nextLead: "A surveillance printout logs five simultaneous sightings across five boroughs.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} discarded the staged sightings one by one and kept pace with the lead that held up. Selena stayed ahead, but the unit never spent a day on a ghost.",
          selena: "You stopped trusting the obvious feed. That is the whole lesson of this city.",
          nextLead: "A surveillance record shows five sightings sharing one movement pattern.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} narrowed the five leads to one and reached the borough twenty-five minutes behind her. A transit contact confirmed only one set of footsteps had ever really been Selena's — the unit had been watching the right one for two days.",
          selena: "You found the real sighting and stayed on it. A system that recognizes everyone can misidentify anyone — but you didn't.",
          nextLead: "Of five sightings, only one gait was ever really hers.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} collapsed four decoys and caught the fifth in motion — Selena, crossing between platforms, no stand-in, no relay. She raised an eyebrow at being the one they picked, then stepped onto a train the board said wasn't running.",
          selena: "Four decoys and you chose me. The Bureau has never once managed that on the first try. Note it.",
          nextLead: "A sixth feed on the record came from Boston, an hour ahead of the New York clock.",
        },
      },
      nextCityTeaser: {
        cityName: "Boston",
        header: "NEXT: BOSTON",
        body: "The sixth feed traces to a harbor camera in Boston, running an hour ahead of the New York clock. A contact there says a signal goes out from the harbor every night at the same minute.",
        selena: "There is a signal in Boston that only transmits at night. I intend to be listening when it does.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_07",
      seasonId,
      weekNumber: 7,
      cityName: "Boston",
      chapterTitle: "The Midnight Signal",
      complication: {
        id: "signal_window",
        label: "Signal Window",
        summary:
          "A signal leaves Boston harbor every night at the same minute, and it can only be answered during a narrow evening window. The unit doesn't need everyone at once — but enough operatives have to contribute before the window closes.",
      },
      rituals: WEEK_SEVEN_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 07: THE MIDNIGHT SIGNAL",
        body: [
          "The sixth feed from New York traced to a harbor camera in Boston. It runs an hour ahead of the New York clock for a reason: a signal leaves the harbor here every night at the same minute, and it has for longer than anyone can explain.",
          "Selena arrived in Boston to answer it. The signal can only be received during a narrow window after dark — miss the window, and the night's message is gone until tomorrow.",
          "Your unit has been assigned to be in the field, together, before the window closes. Not all at once — but enough of you, in time.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Contribute during the evening window — the signal only answers before it closes." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit confirms the signal only answers inside the evening window.",
        firstMovementPayoff: "Your evening contribution lands inside the window — it counts.",
      },
      specialOperation: { ...platformSweep, id: "week_07_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week07_continuity_protocol",
        interceptClueId: "week07_unwritten_leg",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit worked hard, but always at the wrong hour — the evening windows closed with too few operatives in the field. The signal went out each night, unanswered, and Selena read it alone.",
          selena: "The signal was sent. Your unit was not listening.",
          nextLead: "A set of old signal instructions was recovered near the Old North Church, written for use after dark.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} caught enough of the evening windows to stay in the conversation. The unit answered the signal on most nights and kept Selena within reach of the harbor.",
          selena: "You made it into the window more nights than not. Timing is harder than distance.",
          nextLead: "Historic instructions describe a chain of signals meant to run at night.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} answered the signal nearly every night and reached the harbor twenty minutes after the last transmission. A dockworker confirmed Selena had stood at the water's edge until the harbor lights went dark, then walked south.",
          selena: "You were in the window when it mattered. Some messages are meant for the moment the lights go out — and you were there for it.",
          nextLead: "The relay is timed to the exact minute the harbor lights go dark.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} answered every window and reached the harbor as the signal was still going out. Selena was there, reading it, and did not startle. She let the operative watch the lights fall dark on schedule, then stepped onto a pier boat that wasn't lit.",
          selena: "You kept the whole week's schedule. I have met few units that could. Consider what that means about you.",
          nextLead: "One leg of the relay has no address — only an instruction to ask in Savannah.",
        },
      },
      nextCityTeaser: {
        cityName: "Savannah",
        header: "NEXT: SAVANNAH",
        body: "The relay's next leg has no address. The only instruction is to ask in Savannah — where, the protocol says, the route is never written down.",
        selena: "Some cities keep their directions in people, not on paper. Savannah is one of them.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_08",
      seasonId,
      weekNumber: 8,
      cityName: "Savannah",
      chapterTitle: "The Garden of Shadows",
      complication: {
        id: "unwritten_route",
        label: "Unwritten Route",
        summary:
          "Selena's route through Savannah isn't on any map. The city keeps its real directions in the people who live there, not on paper. The unit reveals the route through varied field work — raw distance alone won't uncover it.",
      },
      rituals: WEEK_EIGHT_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 08: THE GARDEN OF SHADOWS",
        body: [
          "The Boston relay's next leg had no address — only an instruction to ask in Savannah, where the route is never written down. The Bureau's maps of the city are complete except for one thing: they cannot tell you where Selena went.",
          "Savannah keeps its directions in its people. The squares, the lanes behind the squares, the paths through the old cemetery gardens — the ones that matter are the ones locals know by heart and no surveyor ever logged.",
          "Your unit has been assigned to reveal her route the way the city does: through varied field work, not raw distance. Walking farther will not help if you only walk the streets the map already shows.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Complete a variety of operations — the route only reveals itself to varied field work." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit uncovers the first stretch of route the map doesn't show.",
        firstMovementPayoff: "Your varied field work reveals a turn no map records — not just more steps.",
      },
      specialOperation: { ...platformSweep, id: "week_08_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week08_missing_square",
        interceptClueId: "week08_spoken_directions",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit walked hard and walked the map — and the map was never the point. Selena's route ran through squares and garden lanes the surveyors left off, and she was gone before the unit thought to ask a local.",
          selena: "You trusted the map more than the people who lived there.",
          nextLead: "A tourist map of Savannah's squares was recovered near Forsyth Park — with one square left blank.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} varied the field work enough to surface most of the unwritten route and kept Selena within the historic district. The unit stopped trusting the map and started reading the city.",
          selena: "You learned to ask instead of assume. Savannah rewards that.",
          nextLead: "A map of the historic squares leaves one location deliberately blank.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} revealed nearly the whole route and reached the blank square fifteen minutes behind her. A resident confirmed Selena had asked for directions no map carried — and had been given them without hesitation.",
          selena: "You found the square the map refuses to draw. Not everything worth keeping leaves a paper trail.",
          nextLead: "The people who live around the blank square can still give directions to it; the map simply refuses to.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} revealed the full unwritten route and reached the missing square while Selena was still there, under the oaks. She seemed pleased rather than caught, pointed to the blank spot on the map in the operative's hand, and walked into the shadow of the trees.",
          selena: "You read a city that refuses to be written down. Almost no one manages that in a week. Remember you did.",
          nextLead: "The route past the missing square was never written — a local said the next leg is kept in a New Orleans song.",
        },
      },
      nextCityTeaser: {
        cityName: "New Orleans",
        header: "NEXT: NEW ORLEANS",
        body: "The directions past the missing square were never written down. A Savannah local said the next leg is kept in a New Orleans song — a rhythm you follow, not a route you read.",
        selena: "In New Orleans, some directions are carried in a beat. You will have to learn to keep time.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_09",
      seasonId,
      weekNumber: 9,
      cityName: "New Orleans",
      chapterTitle: "The Second Line",
      complication: {
        id: "changing_rhythm",
        label: "Changing Rhythm",
        summary:
          "Selena's trail through New Orleans is kept as a rhythm, not a route. Daily targets shift slightly based on how the unit did the day before — steady participation and recovery matter more than one enormous day.",
      },
      rituals: WEEK_NINE_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 09: THE SECOND LINE",
        body: [
          "The route past Savannah's missing square was never written down — it was kept in a New Orleans song. Here, Selena's trail is carried the same way: as a rhythm passed along a second line, not a path drawn on a map.",
          "A rhythm has to be kept. Rush it and it falls apart; drop out for a day and you lose the measure. The Bureau's usual approach — one operative walking enormous distances — does not read this trail at all.",
          "Your unit has been assigned to keep time. Steady participation across the week, and recovery after a hard day, will surface the route. One giant push will not.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Keep a steady tempo — consistency across the week reveals the trail, not one huge day." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit finds the tempo — the trail reads only when you keep time.",
        firstMovementPayoff: "Your steady day matters more than your biggest day this week.",
      },
      specialOperation: { ...platformSweep, id: "week_09_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week09_rhythmic_key",
        interceptClueId: "week09_dead_interval",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit posted one enormous day and coasted the rest. A rhythm doesn't read that way — it fell apart between the big days, and Selena kept moving down a trail carried in a beat the unit never found.",
          selena: "You counted the steps and missed the rhythm.",
          nextLead: "A folded sheet of rhythmic notation was recovered near Jackson Square — intervals, no melody.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} kept a steady tempo through the week — recovering after the hard days instead of vanishing — and read most of the rhythm. Selena stayed ahead, but the unit never lost the measure.",
          selena: "You held the tempo. New Orleans notices who can keep time.",
          nextLead: "A key written as a rhythm reads only when kept in time.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} kept the rhythm almost perfectly and reached the parade route twenty minutes behind her. A musician confirmed Selena had walked the second line end to end, in step, before slipping off at a cross street.",
          selena: "You kept the measure the whole way through. This city rewards participation, not obedience — and you participated.",
          nextLead: "The key only resolves at the pace of a second line.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} kept perfect time all week and caught the second line at its turn — Selena among the dancers, in step, unhurried. She smiled at being found in a crowd that was all motion, tapped the rhythm on the operative's arm once, and let the parade close around her.",
          selena: "You kept time with a whole city for a week and still found me inside it. That is not luck. Remember that.",
          nextLead: "The last interval in the sequence points to a frequency in Austin that stopped transmitting.",
        },
      },
      nextCityTeaser: {
        cityName: "Austin",
        header: "NEXT: AUSTIN",
        body: "The rhythm's final interval is an open rest — it points to a radio frequency in Austin that went silent mid-broadcast. No one has transmitted on it since.",
        selena: "There is a frequency in Austin that stopped mid-sentence. I want to know who was talking, and why they stopped.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_10",
      seasonId,
      weekNumber: 10,
      cityName: "Austin",
      chapterTitle: "Dead Air",
      complication: {
        id: "signal_interference",
        label: "Signal Interference",
        summary:
          "The Austin frequency went silent mid-broadcast, and this week the unit's own pursuit reads uncertain until sync confidence is high. The game distinguishes verified pursuit from estimated pursuit, and only verified steps close the real gap.",
      },
      rituals: WEEK_TEN_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 10: DEAD AIR",
        body: [
          "The rhythm out of New Orleans ended on an open rest that pointed to a radio frequency in Austin — one that stopped mid-broadcast and has stayed silent since. Selena came to find out why.",
          "This week the air is full of interference. Pursuit that hasn't synced reads as estimated, not confirmed, and an estimate can be wrong. Only verified steps close the real distance; the rest is static that looks like progress.",
          "Your unit has been assigned to keep its signal clean — sync often, confirm everything — before Selena finds the source of the override.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Keep your trackers synced — only verified steps count against the real gap this week." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit confirms its first stretch of pursuit as verified, not estimated.",
        firstMovementPayoff: "Your synced steps move from estimated to verified — the gap they close is real.",
      },
      specialOperation: { ...platformSweep, id: "week_10_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week10_override_frequency",
        interceptClueId: "week10_desert_source",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit followed the loudest signal all week — and it was interference. When the estimated pursuit finally synced, the real distance was far worse than the static had shown. Selena had been broadcasting on a channel that wasn't hers.",
          selena: "You followed a signal. You never asked who sent it.",
          nextLead: "A printout of a single waveform was recovered near the silent Austin frequency — a signal, flatlined.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} kept its trackers synced and its pursuit verified, so the static never fooled it into chasing an estimate. Selena stayed ahead, but the unit always knew the real distance.",
          selena: "You kept your signal clean in a week built for confusion. That is discipline.",
          nextLead: "A waveform and a short access protocol read: do not trust the carrier.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} verified nearly everything and reached the frequency's source twenty minutes behind her. A radio tech confirmed Selena had traced the override to a single point — and that the dead frequency had not faded, it had been buried under a stronger signal.",
          selena: "You didn't mistake the static for me. Not everything you receive is a true signal — you knew that.",
          nextLead: "The signal didn't fade — it was overridden, cleanly, by a stronger one on the same channel.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} verified its entire week and traced the override to the source as Selena was reading the same waveform. She held up the printout — one clean signal burying another — and said the interesting part wasn't the dead frequency but where the stronger one came from. Then the lights on the rack went out and she was gone.",
          selena: "You verified a whole week while the air lied to you. The Bureau cannot manage that. You did. Note it.",
          nextLead: "The overriding signal came from a fixed point in the New Mexico desert — a surveyed marker, not a transmitter.",
        },
      },
      nextCityTeaser: {
        cityName: "Santa Fe",
        header: "NEXT: SANTA FE",
        body: "The signal that overrode the Austin frequency came from a fixed point in the New Mexico desert — not a transmitter, but a surveyed marker on an old alignment line.",
        selena: "Someone is broadcasting from a place that was only ever meant to be measured, not to speak. I want to stand on it.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_11",
      seasonId,
      weekNumber: 11,
      cityName: "Santa Fe",
      chapterTitle: "True North",
      complication: {
        id: "alignment",
        label: "Alignment",
        summary:
          "The Austin override traced to a surveyed marker in the New Mexico desert. This week the unit's combined engagement — everyone pulling in the same direction — grants an alignment bonus. It is about the team lining up, not about decoding anything.",
      },
      rituals: WEEK_ELEVEN_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 11: TRUE NORTH",
        body: [
          "The signal that overrode the Austin frequency came from a surveyed marker in the New Mexico desert — a point placed to be measured from, not broadcast from. Selena went to stand on it.",
          "Out here the trail isn't a route or a rhythm; it's an alignment. The old survey markers only mean something when they line up — and they only line up when enough people hold the same bearing at once.",
          "Your unit has been assigned to align: pull in the same direction, all week, and the bonus builds. Scatter, and the markers stay just points in the sand.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Line up with the team — combined engagement builds the alignment bonus this week." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit's first aligned day registers — everyone pulling the same direction.",
        firstMovementPayoff: "Your contribution lines up with the team's; the alignment bonus grows.",
      },
      specialOperation: { ...platformSweep, id: "week_11_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week11_alignment_chart",
        interceptClueId: "week11_altered_plate",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "Everyone walked, and no two of them walked the same direction. The survey markers never aligned, the bonus never built, and Selena stood on the point she came for and was gone before the unit found its bearing.",
          selena: "You were looking for an endpoint.",
          nextLead: "A surveyor's chart was recovered from a desert marker outside Santa Fe, dense with measured points.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} held a shared bearing through most of the week, and the alignment bonus built with it. Selena kept ahead, but the unit moved as one line instead of scattered points.",
          selena: "You held a direction together. That is the whole trick of this place.",
          nextLead: "A survey chart plots thirteen fixed points and a single figure drawn to connect them.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} aligned almost perfectly and reached the desert marker twenty minutes behind her. A surveyor confirmed Selena had stood exactly on the point, checked it against the chart, and marked the last of the thirteen positions before walking west.",
          selena: "You lined up. Thirteen cities, one line drawn between them — and you were nearly standing on the end of it.",
          nextLead: "Twelve of the thirteen points are marked complete; the thirteenth is circled and left open.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} held its bearing all week and reached the marker while Selena was still on it, chart in hand. She let the operative see the figure — thirteen points, twelve closed, one open — and said the open one was the only part that still mattered. Then a dust rise crossed the sun and the point was empty.",
          selena: "You aligned an entire unit for a week and stood on the same point I did. Almost no one keeps a bearing that long. Remember you did.",
          nextLead: "One survey photograph in the set was altered — the forgery traces to a film lab in Los Angeles.",
        },
      },
      nextCityTeaser: {
        cityName: "Los Angeles",
        header: "NEXT: LOS ANGELES",
        body: "One survey photograph in the set was forged — a marker that never stood where the picture claims. The doctoring traces to a film lab in Los Angeles.",
        selena: "Someone in Los Angeles is very good at making a place look real. I am going to find out what they were hiding behind it.",
        cta: "Continue the pursuit",
      },
    },
    {
      id: "season_one_week_12",
      seasonId,
      weekNumber: 12,
      cityName: "Los Angeles",
      chapterTitle: "The Moving Picture",
      complication: {
        id: "edited_reality",
        label: "Edited Reality",
        summary:
          "The reports coming out of Los Angeles contradict each other — clips, stills, and timestamps that can't all be true. Completing Field Ops surfaces the metadata that shows which evidence is authentic and which was staged.",
      },
      rituals: WEEK_TWELVE_RITUALS,
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 12: THE MOVING PICTURE",
        body: [
          "The forged survey photograph from Santa Fe traced to a film lab in Los Angeles — a place that makes locations look real for a living. The reports arriving from the city now contradict each other: clips, stills, and timestamps that cannot all be true at once.",
          "Someone here is very good at building a convincing account of something that never happened. The trick is not to believe the footage — it is to read what the footage can't fake: the metadata underneath it.",
          "Your unit has been assigned to complete the field work that surfaces that metadata, and sort the real record from the edited one, before Selena leaves the city.",
        ],
        supportingCards: [
          { id: "field_ops", title: "FIELD OPS", body: "Complete operations to surface metadata and separate the authentic evidence from the staged." },
          { id: "prediction", title: "PREDICTION", body: "Estimate how far the team moves before the case closes Sunday night." },
          { id: "nemesis", title: "NEMESIS", body: "Five daily rounds against your assigned rival. Most verified steps wins the day." },
        ],
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      fieldOps: {
        fixedChallengeCodes: [...fieldOpsCodes],
        firstLinePayoff: "The unit surfaces the first piece of metadata — one clip is dated wrong.",
        firstMovementPayoff: "Your field work exposes a staged report; the authentic one moves up.",
      },
      specialOperation: { ...platformSweep, id: "week_12_platform_sweep", label: "Platform Sweep" },
      evidence: {
        standardEvidenceId: "week12_composite_record",
        interceptClueId: "week12_uncut_frame",
      },
      closeCopy: {
        trail_lost: {
          headline: "TRAIL LOST",
          story: "The unit chased the most convincing footage — sharp, well-lit, perfectly timed. It was the fake. The authentic record was a dull clip no one thought to check, and by the time the metadata surfaced, Selena had walked off the set entirely.",
          selena: "You watched the version they edited for you.",
          nextLead: "A film reel and a stack of stills were recovered from a Los Angeles lab — all showing the same event.",
        },
        pursuit_maintained: {
          headline: "PURSUIT MAINTAINED",
          story: "{{groupName}} read the metadata instead of the footage and threw out the staged reports one by one. Selena stayed ahead, but the unit never committed to a fake.",
          selena: "You checked the seams. Most people never look past a clean image.",
          nextLead: "A record assembled from many sources tells one convincing account of something that never happened.",
        },
        close_encounter: {
          headline: "CLOSE ENCOUNTER",
          story: "{{groupName}} surfaced nearly all the metadata and reached the lab twenty minutes behind her. A film tech confirmed Selena had been through the same reels — and had left the one authentic frame face-up on the light table, as if she wanted it found.",
          selena: "You found the real frame in a room full of forgeries. A convincing record is not the same as a true one — and you knew the difference.",
          nextLead: "The seams in the composite only show in the metadata.",
        },
        interception: {
          headline: "SELENA INTERCEPTED",
          story: "{{groupName}} sorted every fake from the real and reached the lab while Selena was still at the light table. She turned the one authentic frame toward the operative — a bridge in fog, timestamped wrong — and said the interesting thing was not that the record was faked, but which ending it was faked to hide. Then the room went dark between two frames and she was gone.",
          selena: "You read a whole city of forgeries and still found the one true frame. The Bureau would have believed the pretty one. You did not. Note it.",
          nextLead: "One frame in the composite was never edited — a bridge in fog, San Francisco, timestamped after the record claims the chase ended.",
        },
      },
      nextCityTeaser: {
        cityName: "San Francisco",
        header: "NEXT: SAN FRANCISCO",
        body: "One frame in the composite was never touched. It shows a bridge in fog — San Francisco — stamped with a time after the record claims the chase was over.",
        selena: "They edited an ending for you. The real one is in San Francisco, and it has not happened yet.",
        cta: "Continue the pursuit",
      },
    },
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
    {
      id: "week06_identity_cascade",
      kind: "standard",
      seasonId,
      weekNumber: 6,
      cityName: "New York City",
      title: "THE IDENTITY CASCADE",
      body: "A surveillance record showing five borough sightings that share one movement pattern — the same gait, timed to look like five people.",
      basicBody: "A surveillance printout logging five simultaneous sightings of Selena across five boroughs.",
      enhancedBody: "A surveillance record: five sightings, five boroughs, one gait. Four were relays. Only one set of steps was ever really hers.",
      highlightedFragment: "Only one set of steps was ever really hers",
      iconKey: "record",
    },
    {
      id: "week06_boston_feed",
      kind: "intercept",
      seasonId,
      weekNumber: 6,
      cityName: "New York City",
      title: "THE BOSTON FEED",
      body: "A sixth feed on the record routes through a Boston harbor camera.",
      enhancedBody: "A sixth feed came from Boston — an hour before the New York sightings it supposedly triggered.",
      highlightedFragment: "an hour before the New York sightings it supposedly triggered",
      iconKey: "feed",
    },
    {
      id: "week07_continuity_protocol",
      kind: "standard",
      seasonId,
      weekNumber: 7,
      cityName: "Boston",
      title: "THE CONTINUITY PROTOCOL",
      body: "Historic instructions for keeping a message readable as it passes through many hands — a chain of signals meant to run at night.",
      basicBody: "A set of old signal instructions recovered near the Old North Church, written for use after dark.",
      enhancedBody: "Historic instructions for a nighttime signal relay, timed to the exact minute the harbor lights go dark.",
      highlightedFragment: "the exact minute the harbor lights go dark",
      iconKey: "signal",
    },
    {
      id: "week07_unwritten_leg",
      kind: "intercept",
      seasonId,
      weekNumber: 7,
      cityName: "Boston",
      title: "THE UNWRITTEN LEG",
      body: "One leg of the relay has no written address — only an instruction to ask in Savannah.",
      enhancedBody: "The relay's next leg has no address at all — only the instruction to ask in Savannah, where they do not write it down.",
      highlightedFragment: "where they do not write it down",
      iconKey: "lantern",
    },
    {
      id: "week08_missing_square",
      kind: "standard",
      seasonId,
      weekNumber: 8,
      cityName: "Savannah",
      title: "THE MISSING SQUARE",
      body: "A map of Savannah's historic squares with one location deliberately left blank, though the streets around it are drawn in full.",
      basicBody: "A tourist map of Savannah's squares recovered near Forsyth Park — with one square left blank.",
      enhancedBody: "A map of Savannah's squares with one square erased. The people who live around it can still give directions to it; the map simply refuses to.",
      highlightedFragment: "the map simply refuses to",
      iconKey: "map",
    },
    {
      id: "week08_spoken_directions",
      kind: "intercept",
      seasonId,
      weekNumber: 8,
      cityName: "Savannah",
      title: "THE SPOKEN DIRECTIONS",
      body: "The route past the blank square was never written down — only spoken.",
      enhancedBody: "The route past the missing square was never written down — a local said the next leg is kept in a New Orleans song.",
      highlightedFragment: "kept in a New Orleans song",
      iconKey: "square",
    },
    {
      id: "week09_rhythmic_key",
      kind: "standard",
      seasonId,
      weekNumber: 9,
      cityName: "New Orleans",
      title: "THE RHYTHMIC KEY",
      body: "A key written as a rhythm rather than a route: a sequence of intervals and rests that only reads correctly in time.",
      basicBody: "A folded sheet of rhythmic notation recovered near Jackson Square — intervals, no melody.",
      enhancedBody: "A key written entirely in rhythm. Played too fast or too slow it means nothing — it only resolves at the pace of a second line.",
      highlightedFragment: "it only resolves at the pace of a second line",
      iconKey: "rhythm",
    },
    {
      id: "week09_dead_interval",
      kind: "intercept",
      seasonId,
      weekNumber: 9,
      cityName: "New Orleans",
      title: "THE DEAD INTERVAL",
      body: "The sequence ends on a rest with no end — it points to a radio frequency in Austin.",
      enhancedBody: "The last interval is a rest with no end — it points to a frequency in Austin that stopped transmitting.",
      highlightedFragment: "a frequency in Austin that stopped transmitting",
      iconKey: "key",
    },
    {
      id: "week10_override_frequency",
      kind: "standard",
      seasonId,
      weekNumber: 10,
      cityName: "Austin",
      title: "THE OVERRIDE FREQUENCY",
      body: "A waveform and a short access protocol for a frequency that stopped mid-broadcast. The last legible instruction reads: do not trust the carrier.",
      basicBody: "A printout of a single waveform recovered near the silent Austin frequency — a signal, flatlined.",
      enhancedBody: "A waveform and access protocol for the dead Austin frequency. The signal didn't fade — it was overridden, cleanly, by a stronger one on the same channel.",
      highlightedFragment: "it was overridden, cleanly, by a stronger one on the same channel",
      iconKey: "waveform",
    },
    {
      id: "week10_desert_source",
      kind: "intercept",
      seasonId,
      weekNumber: 10,
      cityName: "Austin",
      title: "THE DESERT SOURCE",
      body: "The overriding signal was traced to a fixed point in the New Mexico desert.",
      enhancedBody: "The overriding signal came from a fixed point in the New Mexico desert — a surveyed marker, not a transmitter.",
      highlightedFragment: "a surveyed marker, not a transmitter",
      iconKey: "frequency",
    },
    {
      id: "week11_alignment_chart",
      kind: "standard",
      seasonId,
      weekNumber: 11,
      cityName: "Santa Fe",
      title: "THE ALIGNMENT CHART",
      body: "A survey chart plotting thirteen fixed points across the country — and a single geometric figure drawn to connect them.",
      basicBody: "A surveyor's chart recovered from a desert marker outside Santa Fe, dense with measured points.",
      enhancedBody: "A survey chart of thirteen surveyed points forming one clean figure. Twelve are marked complete. The thirteenth is circled and left open.",
      highlightedFragment: "The thirteenth is circled and left open",
      iconKey: "chart",
    },
    {
      id: "week11_altered_plate",
      kind: "intercept",
      seasonId,
      weekNumber: 11,
      cityName: "Santa Fe",
      title: "THE ALTERED PLATE",
      body: "One survey photograph in the set was altered — the marker in it never existed.",
      enhancedBody: "One survey photo was altered — the marker never stood there. The forgery traces to a film lab in Los Angeles.",
      highlightedFragment: "The forgery traces to a film lab in Los Angeles.",
      iconKey: "survey",
    },
    {
      id: "week12_composite_record",
      kind: "standard",
      seasonId,
      weekNumber: 12,
      cityName: "Los Angeles",
      title: "THE COMPOSITE RECORD",
      body: "A record assembled from many sources — clips, timestamps, and stills combined into one convincing account of something that never happened.",
      basicBody: "A film reel and a stack of stills recovered from a Los Angeles lab — all showing the same event.",
      enhancedBody: "A composite record — images, timestamps, and logs stitched into a single false account. The seams only show in the metadata.",
      highlightedFragment: "The seams only show in the metadata",
      iconKey: "film",
    },
    {
      id: "week12_uncut_frame",
      kind: "intercept",
      seasonId,
      weekNumber: 12,
      cityName: "Los Angeles",
      title: "THE UNCUT FRAME",
      body: "One frame in the composite was never edited. It shows a bridge in fog — San Francisco.",
      enhancedBody: "One frame was never edited: a bridge in fog, San Francisco, timestamped after the record claims the chase ended.",
      highlightedFragment: "timestamped after the record claims the chase ended",
      iconKey: "record",
    },
    // Week 13 remains a structural stub — generic sealed evidence until its
    // content pack is implemented (see docs/canon/IMPLEMENTING-A-CITY.md).
    ...Array.from({ length: 1 }, (_, index) => {
      const week = index + 13;
      const config = structuralWeek(
        week,
        ["San Francisco"][index],
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
