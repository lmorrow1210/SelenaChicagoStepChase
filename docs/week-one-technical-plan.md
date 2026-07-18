# Week One Technical Plan

Source documents read in full:

- `docs/one-step-ahead-season-one-implementation-spec.md`
- `docs/week-one-chicago-reference-experience.md`
- `docs/week-one-repository-audit.md`

Scope of this document: translate the approved Week 1 Chicago product experience into the smallest maintainable implementation for this repository. This is a planning document only. It does not implement production code.

## Guiding Decision

Week 1 should be implemented as a thin narrative layer around existing systems, not as a replacement game.

Preserve:

- existing weekly rollover and `weeks` lifecycle;
- Sunday scheduled nemesis reveal;
- `step_logs` as the movement ledger;
- current Map/home screen;
- Field Ops/Bingo storage and detector engine;
- prediction table and scoring;
- nemesis pairing, scoring, reroll, and sudden death;
- badge awarding;
- sync client split between mock and real Health API;
- static demo export.

Add:

- configuration-driven Season One and Week 1 content;
- centralized chase calculation;
- weekly phase calculation;
- data-confidence calculation;
- minimal persistence for Week 1 case results, ritual views, and evidence unlocks;
- reusable narrative surfaces;
- dev-only Week Simulator using production components.

Do not add:

- a custom Chicago-only page;
- a second Field Ops board;
- a second prediction system;
- a second nemesis system;
- speculative future-season tables;
- named supporting NPCs;
- per-city visual themes;
- generative AI.

## Product/Repository Differences And V1 Decisions

| Area | Product target | Current repo behavior | Lowest-risk V1 decision |
|---|---|---|---|
| Season route | 13-city US route, Chicago to San Francisco | DB seed has Chicago, New York, Reykjavik; demo has Chicago, New York, D.C., Los Angeles | Add Season One config and route content; use it for Week 1 UI/API. Migrate seed cities in a later controlled pass if needed. |
| Weekly outcome | Four outcomes by final progress | `weeks.target_hit` boolean | Add final outcome/progress fields while keeping `target_hit` for compatibility. |
| Prediction timing | Parent spec suggests Friday lock | Current API allows submission only on Monday and reveal at Monday noon or when all submit | Preserve Monday behavior for Week 1 V1; update copy to avoid promising Friday lock. Plan a separate Friday-lock pass. |
| Case close | Sunday case close with reconciliation | Monday 00:00 rollover is authoritative | Keep Monday rollover as authority; show Sunday 11:59 PM as cutoff and overnight "Case Closing" as reconciliation. |
| Platform Sweep window | Friday morning to Saturday evening | Current step data is daily, real intraday steps are still unavailable | V1 counts verified Friday+Saturday daily steps. Later refine to hourly windows after real intraday smoke test. |
| Active-player eligibility | Joined before cutoff, connected tracker/input, not paused | Current queries include current group members | V1 uses week target snapshot and current group members; add `week_participants` only if eligibility cannot be approximated safely. |
| Evidence | Group-season standard evidence and Intercept Clues | Existing intel/dossier is landmark-based | Add separate evidence unlock table; do not reuse `intel_cards`. |
| Field Ops tile list | Specific Chicago board | Current board draws from reusable challenge pool | Add Week 1 fixed challenge-code config using existing `bingo_cards`; do not create a new board table. |

## Exact Files To Create

### API and shared logic

- `apps/api/src/config/seasonOne.ts`  
  Season One route, Week 1 copy, evidence, special operation, Field Ops fixed board, beat rules, and timing config.

- `apps/api/src/services/chase.ts`  
  Pure Chase Calculation service: target, bonuses, progress, remaining lead, projections, outcomes.

- `apps/api/src/services/dataConfidence.ts`  
  Sync freshness and confidence helper.

- `apps/api/src/services/weeklyPhase.ts`  
  Central phase calculation from week dates, group timezone, result state, ritual state, and nemesis state.

- `apps/api/src/services/primaryAction.ts`  
  Deterministic primary-action selector for `/api/weeks/current`.

- `apps/api/src/services/specialOperations.ts`  
  Platform Sweep calculation from config and `step_logs`.

- `apps/api/src/services/evidenceService.ts`  
  Standard evidence and Intercept Clue unlock/read helpers.

- `apps/api/src/routes/evidence.ts`  
  Evidence Board API.

- `apps/api/src/routes/rituals.ts`  
  Records per-user briefing/midweek/final-push/case-close views.

- `apps/api/src/db/migrations/008_week_one_narrative.sql`  
  Minimal Week 1 persistence migration.

### API tests

- `apps/api/test/seasonOneConfig.test.ts`
- `apps/api/test/chase.test.ts`
- `apps/api/test/weeklyPhase.test.ts`
- `apps/api/test/dataConfidence.test.ts`
- `apps/api/test/specialOperations.test.ts`
- `apps/api/test/evidence.integration.test.ts`
- `apps/api/test/weekOneRollover.integration.test.ts`

### Web app components

- `apps/web/lib/narrative/MondayBriefing.tsx`
- `apps/web/lib/narrative/CurrentChaseState.tsx`
- `apps/web/lib/narrative/PrimaryActionCard.tsx`
- `apps/web/lib/narrative/NarrativeBeatPanel.tsx`
- `apps/web/lib/narrative/WeeklyComplicationCard.tsx`
- `apps/web/lib/narrative/PlatformSweepCard.tsx`
- `apps/web/lib/narrative/DataConfidenceNotice.tsx`
- `apps/web/lib/narrative/FieldUpdateModal.tsx`
- `apps/web/lib/narrative/FinalPushAlert.tsx`
- `apps/web/lib/narrative/CaseClosingState.tsx`
- `apps/web/lib/narrative/CaseClosedReport.tsx`
- `apps/web/lib/narrative/EvidenceCard.tsx`
- `apps/web/lib/narrative/EvidenceBoard.tsx`
- `apps/web/lib/narrative/NextCityTeaser.tsx`

### Web app routes

- `apps/web/app/(game)/evidence/page.tsx`  
  Evidence Board.

- `apps/web/app/dev/week-simulator/page.tsx`  
  Development-only Week Simulator. It renders production narrative components and the real calculator output. It must be hidden from navigation and safe for static export.

### Web tests

- `apps/web/app/(game)/map/page.test.tsx` or nearest existing web test convention if added later.
- `apps/web/lib/narrative/narrativeComponents.test.tsx`
- `apps/web/lib/narrative/weekSimulator.test.tsx`

## Exact Existing Files To Modify

### API

- `apps/api/src/index.ts`  
  Register `/api/evidence` and `/api/rituals`.

- `apps/api/src/routes/weeks.ts`  
  Return Season One config slice, chase calculation, weekly phase, data confidence, primary action, Platform Sweep state, evidence preview, and primary beat.

- `apps/api/src/routes/fieldops.ts`  
  Include Week 1 complication/story metadata and fixed-board awareness if needed by the frontend.

- `apps/api/src/services/bingo.ts`  
  Add only reusable detector support needed by Week 1 tiles.

- `apps/api/src/services/bingoService.ts`  
  If active week has a fixed Field Ops config, create the configured Week 1 card instead of random draw. Preserve existing deterministic generation for other weeks.

- `apps/api/src/services/scoutService.ts`  
  Reuse existing scout tokens; do not make it responsible for Season Evidence.

- `apps/api/src/services/weekClose.ts`  
  Replace target-hit-only final calculation with Chase Calculation output while continuing to set `target_hit`.

- `apps/api/src/services/weekRollover.ts`  
  Persist final outcome/evidence after `closeWeekPredictions()`, preserve idempotency, keep all existing badge/nemesis/card behavior.

- `apps/api/src/services/beats.ts`  
  Add data-confidence gating and support primary beat selection for `/api/weeks/current`. Reuse current `beat_definitions`/`beat_events`.

- `apps/api/openapi.yaml`  
  Add new fields on `/api/weeks/current`, `/api/evidence`, `/api/rituals`.

### Shared package

- `packages/shared/src/index.ts`  
  Add shared zod schemas/types for `WeeklyOutcome`, `WeekPhase`, `DataConfidence`, ritual view request, and evidence payloads if API/web both need runtime validation.

### Web

- `apps/web/app/(game)/map/page.tsx`  
  Reorder main home screen around story-first chase state, primary action, beat panel, secondary system cards, Field Ops preview, evidence preview, and existing route/progress/leaderboard.

- `apps/web/app/(game)/fieldops/page.tsx`  
  Surface Chicago complication copy and first-line story payoff. Keep the existing board UI.

- `apps/web/app/(game)/prediction/page.tsx`  
  Update Week 1 copy while preserving current V1 mechanics.

- `apps/web/app/(game)/map/PredictionSection.tsx`  
  Match the new prediction language and show participation bonus context if returned by API.

- `apps/web/app/(game)/nemesis/page.tsx`  
  Add rival-assignment copy and group participation bonus messaging. Keep existing scoring UI.

- `apps/web/app/(game)/layout.tsx`  
  Add Evidence navigation only if product wants it visible in primary nav; otherwise link from case/evidence preview first.

- `apps/web/lib/demo.ts`  
  Align demo fixtures to Week 1 Chicago, chase result fields, evidence, phase variants, and static demo behavior.

- `apps/web/lib/api-types.d.ts`  
  Regenerate with `npm run gen:api-types -w apps/web` after OpenAPI changes.

## TypeScript Types And Configuration Objects

Create these in `apps/api/src/config/seasonOne.ts` first. Export pure data and narrow types.

```ts
export type WeeklyOutcome =
  | "trail_lost"
  | "pursuit_maintained"
  | "close_encounter"
  | "interception";

export type WeekPhase =
  | "briefing"
  | "active"
  | "midweek_update"
  | "final_push"
  | "sudden_death"
  | "case_closing"
  | "case_closed";

export type DataConfidence =
  | "verified"
  | "estimated"
  | "incomplete"
  | "recalculating";

export type PrimaryActionId =
  | "fix_sync"
  | "view_briefing"
  | "view_case_result"
  | "sudden_death"
  | "special_operation"
  | "submit_prediction"
  | "field_ops_near_reward"
  | "nemesis_close"
  | "daily_target"
  | "continue_pursuit";

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
  startDay: 5; // Friday
  endDay: 6; // Saturday
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
```

Week 1 config should include only approved copy from the product docs. Weeks 2-13 should exist structurally with route, chapter, evidence IDs, and close messages, but only Week 1 needs polished UI copy in the first implementation pass.

## Minimum Database Migration For Week 1

Create one migration: `apps/api/src/db/migrations/008_week_one_narrative.sql`.

Minimum schema:

```sql
ALTER TABLE weeks
  ADD COLUMN season_id TEXT,
  ADD COLUMN season_week_number INTEGER,
  ADD COLUMN base_progress NUMERIC(7,4),
  ADD COLUMN final_progress NUMERIC(7,4),
  ADD COLUMN remaining_lead INTEGER,
  ADD COLUMN bonus_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN data_confidence TEXT
    CHECK (data_confidence IN ('verified','estimated','incomplete','recalculating')),
  ADD COLUMN final_outcome TEXT
    CHECK (final_outcome IN ('trail_lost','pursuit_maintained','close_encounter','interception')),
  ADD COLUMN finalized_at TIMESTAMPTZ;

CREATE TABLE week_ritual_views (
  id BIGSERIAL PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ritual_id TEXT NOT NULL
    CHECK (ritual_id IN ('monday_briefing','midweek_update','final_push','case_closed')),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (week_id, user_id, ritual_id)
);

CREATE TABLE group_evidence_unlocks (
  id BIGSERIAL PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL,
  season_week_number INTEGER NOT NULL,
  evidence_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('standard','intercept')),
  outcome TEXT NOT NULL
    CHECK (outcome IN ('trail_lost','pursuit_maintained','close_encounter','interception')),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, season_id, evidence_id)
);
```

Why this is the minimum:

- `weeks` stores the authoritative final chase result without replacing existing week lifecycle.
- `week_ritual_views` records `briefingViewedAt` and future ritual dismissals without adding per-ritual columns.
- `group_evidence_unlocks` separates Season Evidence from existing Field Ops intel.
- No `seasons`, `season_weeks`, or `group_season_states` tables are required for Week 1 because the season content can be TypeScript config and aggregate season state can be derived from evidence unlocks.

Rollback risk:

- Adding nullable columns is low risk.
- New tables are isolated.
- Do not drop or alter existing constraints except adding new checks on new columns.

## Chase Calculation Service Design

Create `apps/api/src/services/chase.ts`.

Inputs:

```ts
export interface ActivePlayerInput {
  userId: string;
  weeklyTarget: number;
  stepsThisWeek: number;
  lastSyncedAt: Date | null;
  fitbitConnected: boolean;
}

export interface FieldOpsGroupState {
  activePlayerCount: number;
  totalQualifyingLines: number;
}

export interface SpecialOperationState {
  maxBonus: number;
  earnedBonus: number;
  contributors: number;
  eligiblePlayers: number;
}

export interface NemesisGroupState {
  activePlayerCount: number;
  participantsWithActivity: number;
  allMatchupsResolved: boolean;
}

export interface PredictionGroupState {
  activePlayerCount: number;
  submittedCount: number;
}

export interface TrackerSyncState {
  userId: string;
  freshness: "current" | "delayed" | "stale" | "missing" | "disconnected";
}

export interface ChaseCalculationInput {
  activePlayers: ActivePlayerInput[];
  fieldOps: FieldOpsGroupState;
  specialOperation: SpecialOperationState;
  nemesis: NemesisGroupState;
  prediction: PredictionGroupState;
  trackerSync: TrackerSyncState[];
  elapsedFractionOfWeek: number;
  now: Date;
}
```

Output:

```ts
export interface ChaseCalculationResult {
  groupWeeklyTarget: number;
  verifiedGroupSteps: number;
  baseProgress: number;
  bonuses: {
    fieldOps: number;
    specialOperation: number;
    nemesisParticipation: number;
    predictionParticipation: number;
    total: number;
  };
  finalProgress: number;
  remainingLead: number;
  projectedOutcome: WeeklyOutcome | null;
  finalOutcome: WeeklyOutcome | null;
  dataConfidence: DataConfidence;
}
```

Rules:

- `groupWeeklyTarget = sum(activePlayers.weeklyTarget)` for V1.
- `verifiedGroupSteps = sum(activePlayers.stepsThisWeek)`.
- `baseProgress = verifiedGroupSteps / groupWeeklyTarget`.
- Field Ops bonus:
  - average >= 1 line/player: `0.02`
  - average >= 2 lines/player: `0.035`
  - average >= 3 lines/player: `0.05`
- Platform Sweep bonus: from `specialOperation.earnedBonus`, max `0.03`.
- Nemesis participation:
  - >= 70% active players have qualifying activity: `0.005`
  - all matchups resolved without missing required data: additional `0.005`
- Prediction participation:
  - >= 70% active players submitted: `0.005`
  - all active players submitted: `0.01`
- Cap total non-step bonus at `0.10`.
- `finalProgress = baseProgress + totalBonus`.
- `remainingLead = max(0, round(groupWeeklyTarget * (1 - finalProgress)))`.
- Outcome thresholds:
  - `< 0.70`: `trail_lost`
  - `>= 0.70 && < 0.90`: `pursuit_maintained`
  - `>= 0.90 && < 1.00`: `close_encounter`
  - `>= 1.00`: `interception`
- Projected outcome only after 24 hours and if confidence is not `incomplete` or `recalculating`.

Unit tests should cover every threshold and cap before `weekRollover.ts` is modified.

## Weekly Phase Calculation And Rollover Integration

Create `apps/api/src/services/weeklyPhase.ts`.

Phase input:

```ts
export interface WeeklyPhaseInput {
  startsOn: string;
  endsOn: string;
  timezone: string;
  weekStatus: "scheduled" | "active" | "closed";
  finalOutcome: WeeklyOutcome | null;
  finalizedAt: Date | null;
  dataConfidence: DataConfidence;
  briefingViewed: boolean;
  midweekViewed: boolean;
  finalPushViewed: boolean;
  suddenDeathActive: boolean;
  now: Date;
}
```

Phase output:

```ts
export interface WeeklyPhaseResult {
  phase: WeekPhase;
  shouldShowModal: "monday_briefing" | "midweek_update" | "final_push" | "case_closed" | null;
}
```

V1 phase rules:

- `case_closed`: `weekStatus === "closed"` and `finalOutcome != null`.
- `case_closing`: local time is after Sunday 11:59 PM cutoff, or week is closing, and final outcome is not yet available.
- `sudden_death`: Saturday and nemesis tiebreak active.
- `final_push`: Friday 08:00 local through Sunday cutoff, unless sudden death or case closing overrides.
- `midweek_update`: Wednesday 12:00 local through Friday 08:00 local.
- `briefing`: Monday and briefing not viewed.
- `active`: fallback.

Integration:

- `weekRollover.ts` remains the authoritative finalizer.
- After `closeWeekPredictions()`, call Chase Calculation with final week data.
- Persist final progress/outcome on `weeks`.
- Unlock evidence through `evidenceService`.
- Continue existing badges, nemesis finalization, card freeze, next-week activation.
- All inserts must use conflict-safe patterns so rerunning rollover does not duplicate evidence or notifications.

## DataConfidence Calculation

Create `apps/api/src/services/dataConfidence.ts`.

V1 freshness classification:

- `current`: last sync within 6 hours.
- `delayed`: more than 6 and up to 24 hours.
- `stale`: more than 24 hours.
- `missing`: no `last_synced_at`.
- `disconnected`: `fitbit_connected = false`.

Group confidence:

- `recalculating`: result exists but finalization is blocked or a late-sync recalculation is in progress. V1 may only return this from simulator/case-closing paths until reconciliation history exists.
- `incomplete`: 30% or more active players are stale, missing, or disconnected.
- `estimated`: at least one active player is delayed/stale/missing/disconnected, but not enough to be incomplete.
- `verified`: at least 70% active players are current and no stale/missing data is likely to change the current projection materially.

V1 simplification:

- Do not try to infer whether stale data would materially change outcome until after the calculator exists.
- If in doubt, return `estimated` or `incomplete`, never `verified`.

Beat rule:

- Selena performance commentary requires `verified`.
- Trust beats may show for `estimated`, `incomplete`, or `recalculating`.

## Changes To `/api/weeks/current`

Modify `apps/api/src/routes/weeks.ts`.

Keep existing fields for compatibility:

- `week`
- `city`
- `nextCity`
- `selenaLeadSteps`
- `route`
- `progressStrip`
- `leaderboard`
- `countdown`
- `lastSyncedAt`
- `state`

Add fields:

```ts
{
  season: {
    id: "season_one",
    title: "The Lakefront Job",
    weekNumber: 1
  },
  chapter: {
    cityName: "Chicago",
    chapterTitle: "The Lakefront Job",
    complicationLabel: "Cold Start"
  },
  phase: WeekPhase,
  dataConfidence: DataConfidence,
  chase: {
    groupWeeklyTarget: number,
    verifiedGroupSteps: number,
    baseProgress: number,
    finalProgress: number,
    progressPercent: number,
    remainingLead: number,
    projectedOutcome: WeeklyOutcome | null,
    finalOutcome: WeeklyOutcome | null,
    bonuses: {
      fieldOps: number,
      specialOperation: number,
      nemesisParticipation: number,
      predictionParticipation: number,
      total: number
    }
  },
  primaryAction: {
    id: PrimaryActionId,
    eyebrow: string,
    title: string,
    body: string,
    ctaLabel: string,
    href: string
  },
  primaryBeat: {
    id: string,
    category: string,
    headline: string,
    body: string,
    ctaLabel?: string,
    ctaHref?: string,
    dataConfidence: DataConfidence
  } | null,
  platformSweep: {
    id: "platform_sweep",
    active: boolean,
    contributors: number,
    eligiblePlayers: number,
    earnedBonus: number,
    nextThresholdCount: number | null
  },
  evidencePreview: {
    standardEvidenceId: string,
    title: "The Brass Dial",
    unlocked: boolean,
    interceptUnlocked: boolean
  },
  ritualViews: {
    mondayBriefing: boolean,
    midweekUpdate: boolean,
    finalPush: boolean,
    caseClosed: boolean
  }
}
```

OpenAPI and generated web types must be updated in the implementation pass.

## Main Map/Home-Screen Changes

Modify `apps/web/app/(game)/map/page.tsx`.

Keep:

- route pins;
- city postcard/terminal visual language;
- ProgressStrip;
- leaderboard;
- SundayCountdown;
- CallingCard, unless it conflicts with Monday Briefing and is later folded into the briefing.

Add:

- `MondayBriefing` overlay if phase/ritual says it should show.
- `CurrentChaseState` above the route:
  - city/chapter;
  - "Selena is {{remainingLead}} steps ahead";
  - steps closed today if returned later;
  - secondary progress percent.
- `PrimaryActionCard`.
- `NarrativeBeatPanel`.
- `DataConfidenceNotice`.
- secondary cards for Field Ops, Prediction, Nemesis.
- `PlatformSweepCard` when active or near active.
- `EvidenceCard` preview.
- `CaseClosingState` or `CaseClosedReport` when phase requires.

Do not build a Chicago page. The map remains the home screen.

## Monday Briefing Implementation

Create `apps/web/lib/narrative/MondayBriefing.tsx`.

Behavior:

- Shows when `/api/weeks/current` returns `phase = "briefing"` and `ritualViews.mondayBriefing = false`.
- Uses Week 1 config copy from API payload.
- Starting lead is `chase.groupWeeklyTarget`, formatted.
- Dismiss posts to `/api/rituals/view` with `{ week_id, ritual_id: "monday_briefing" }`.
- Reopen link lives on the map through a secondary "Review assignment" action.
- Reduced motion: no required animation; staged sequence can collapse to static content.

Do not store this only in localStorage. Product requires `briefingViewedAt`, so use `week_ritual_views`.

## Chicago Field Ops Mapping

Use the existing `bingo_challenge_definitions`, `bingo_cards`, detector engine, honor tiles, and assists. Week 1 should configure a fixed 5x5 list by challenge code.

### Proposed tiles that already exist or nearly exist

| Product tile | Current support | V1 recommendation |
|---|---|---|
| Hot Pursuit: 10,000 steps/day | `steps_10k_day` exists | Reuse. |
| Morning Surveillance: steps before noon | `steps_before` detector exists; current definitions are 5k/6k/7k | Add 1k definition using existing detector. |
| After-Hours Watch | `steps_after` detector exists; current definition is 4k after 6 PM | Add 1k definition using existing detector. |
| Send Backup | `tile_gifts` exists | Add reusable `assist_sent` detector. |
| Accept Backup | `gifted_by` exists on card tiles | Add reusable `assist_received` detector. |
| Self-reported movement choices | honor-system source exists | Add four honor challenge definitions. |
| Find the Platform | `bingo_lines` exists | Do not implement as a literal tile in V1; trigger story payoff when first line completes. |

### Full Chicago tile mapping

| # | Product tile | Current repo fit | V1 plan |
|---:|---|---|---|
| 1 | First Footfall: 1,000 steps in one day | Existing `steps` detector, no 1k definition | Add `steps_1k_day`. |
| 2 | On the Move: 5,000 steps in one day | Existing `steps` detector, no all-day 5k definition | Add `steps_5k_day`. |
| 3 | Hot Pursuit: 10,000 steps in one day | `steps_10k_day` exists | Reuse. |
| 4 | Closing Distance: 50% daily target | Context has weekly target and day steps, no percent detector | Add `percent_target_in_day` at `0.5`. |
| 5 | Full Shift: 100% daily target | Related logic exists for `hit_daily_target`, but not generic tile | Add `percent_target_in_day` at `1.0`. |
| 6 | Keep the Trail: 2,000 steps on two consecutive days | No generic consecutive-days detector | Add `consecutive_days` with `minSteps: 2000`, `days: 2`. |
| 7 | Three-Day Tail: verified steps on three consecutive days | No generic consecutive-days detector | Add `consecutive_days` with `minSteps: 1`, `days: 3`. |
| 8 | Long Route: 20% above recent average | Requires baseline/recent-average policy not present | Substitute `steps_12k_day` or `steps_15k_day` for V1. |
| 9 | Quick Recovery: target day after missing | Requires no-shame recovery detector across days | Substitute `target_100pct_day` for V1; revisit later. |
| 10 | City Sweep: 15,000 weekly steps | No personal weekly-steps detector | Add `weekly_steps` with `value: 15000`. |
| 11 | Morning Surveillance: 1,000 before noon | `steps_before` exists | Add `steps_1k_noon`. |
| 12 | After-Hours Watch: 1,000 after 6 PM | `steps_after` exists | Add `steps_1k_after_6`. |
| 13 | Split Shift: 1,000 steps in two dayparts | Requires reliable intraday; real client returns null | Substitute Morning/After-Hours pair for V1 or keep simulator-only. |
| 14 | Steady Signal: 500 steps on five days | No generic active-days detector | Add `active_days` with `minSteps: 500`, `days: 5`. |
| 15 | No Cold Trail: avoid zero-step active week | No generic active-days detector | Add `active_days` with `minSteps: 1`, `days: 7`; only complete late week. |
| 16 | Send Backup | `tile_gifts` exists | Add `assist_sent` detector. |
| 17 | Accept Backup | `gifted_by` exists on tile JSON | Add `assist_received` detector. |
| 18 | Unit Mobilized: 3 members reach 50% daily target | Group/day context exists, no detector | Add `group_daily_target_ratio`; configure `minMembers: 3`, `ratio: 0.5`. |
| 19 | Full Team Report: everyone syncs in 24h | `last_synced_at` exists | Add `group_sync_freshness` detector or implement as a special Field Ops status; avoid Selena taunts if incomplete. |
| 20 | Take the Long Way | Honor-system source exists | Add honor challenge. |
| 21 | Eyes Up | Honor-system source exists | Add honor challenge. |
| 22 | Walk With Someone | Existing social honor patterns exist | Add honor challenge, accessible wording. |
| 23 | Choose the Longer Route | Honor-system source exists | Add honor challenge, safe/accessible wording. |
| 24 | Trace the Grid: two verified movement tiles in one day | Current tile completion does not store source activity date reliably | V1 story payoff when two verified movement tiles complete during week; exact same-day rule later. |
| 25 | Find the Platform: complete any line | `bingo_lines` exists | V1 story payoff when `bingo_lines >= 1`; do not make it a circular tile. |

### Tiles needing new reusable detectors

Add only reusable detectors in `bingo.ts`:

- `percent_target_in_day`
- `consecutive_days`
- `active_days`
- `weekly_steps`
- `assist_sent`
- `assist_received`
- `group_daily_target_ratio`
- `group_sync_freshness`

Optional later detector:

- `split_shift_steps` using `steps_by_hour`.

### Recommended substitutions to avoid unnecessary complexity

| Product tile | Complexity | V1 substitution |
|---|---|---|
| Long Route: 20% above recent average | Requires reliable per-user baseline and recent-average policy | Use `steps_12k_day` or `steps_15k_day` for V1. Revisit after baseline work. |
| Quick Recovery: target day after missing | Requires day-to-day state and careful no-shame copy | Substitute `Full Shift` / target-hit tile for V1. |
| Split Shift | Requires reliable intraday data; real client returns `steps_by_hour = null` | Use Morning + After-Hours tiles for V1, or keep Split Shift demo-only until real intraday is wired. |
| Trace the Grid: two verified movement tiles in one day | Current card stores completion timestamp, not underlying activity date per tile | Trigger story payoff from "first two verified movement completions this week" or defer exact same-day rule. |
| Find the Platform as tile 25 | Literal line-complete tile can become circular | Treat first line completion as story payoff, not a tile needed to complete the line. |

### Fixed Week 1 board

Add challenge definitions for new Week 1 codes in migration or seed helper:

- `steps_1k_day`
- `steps_5k_day`
- `steps_10k_day` existing
- `target_50pct_day`
- `target_100pct_day`
- `steps_2k_two_days`
- `steps_any_three_days`
- `steps_12k_day` existing substitute for Long Route
- `target_100pct_day_recovery_sub` or reuse `target_100pct_day`
- `weekly_steps_15k`
- `steps_1k_noon`
- `steps_1k_after_6`
- `active_500_five_days`
- `active_nonzero_seven_days`
- `assist_sent`
- `assist_received`
- `unit_mobilized_50pct`
- `full_team_report_sync`
- `take_long_way`
- `eyes_up`
- `walk_with_someone`
- `choose_longer_route`

If exactly 25 tiles are required, fill remaining slots with existing accessible movement/team definitions rather than inventing complex detectors.

## Platform Sweep Implementation

Create `apps/api/src/services/specialOperations.ts`.

V1 calculation:

- Week 1 config defines `startDay = 5`, `endDay = 6`, `minimumVerifiedStepsPerPlayer = 2000`.
- Use group timezone to resolve Friday and Saturday dates.
- A contributor is an eligible/current group member with `SUM(step_logs.steps)` across Friday/Saturday >= 2,000`.
- Tiers:
  - `contributors / eligiblePlayers >= 0.40`: `0.01`
  - `>= 0.60`: `0.02`
  - `>= 0.80`: `0.03`
- No simultaneous activity requirement.
- No new table required in V1 because the result is derived from verified steps.

Known difference:

- Product says Friday morning to Saturday evening. V1 uses full Friday/Saturday days because production real intraday data is not verified yet.

## Prediction Integration

V1 recommendation: preserve current Monday submission/reveal behavior.

Reason:

- The Week 1 product document explicitly recommends preserving current mechanics unless changing them is low risk.
- The story layer does not depend on Friday lock.
- Changing prediction timing touches API behavior, tests, copy, and player expectation.

Implementation:

- Keep `apps/api/src/routes/predictions.ts` submission rules unchanged.
- Add prediction participation bonus in Chase Calculation:
  - >= 70% active players submitted: `0.005`
  - all active players submitted: `0.01`
- Update copy in `PredictionSection`:
  - "How close will your unit get to Selena by Sunday night?"
  - "Predict the group's total verified steps this week."
  - "Predictions remain sealed until the configured reveal condition."
- Do not mention Friday lock until that pass is implemented.

Separate future pass:

- Add configurable lock timestamp.
- Allow submission through Friday.
- Update tests and OpenAPI.

## Nemesis Participation Bonus

Use current `nemesis_matchups` and `step_logs`.

Qualifying participation V1:

- A player qualifies if they are in an active matchup or bye state and have at least one synced step-log row during the week.
- Bye players count as participating if they have at least one synced step-log row.
- Missing data should not be framed as player failure.

Bonus:

- `participantsWithActivity / activePlayerCount >= 0.70`: `+0.5%`
- all persisted matchups are `complete` or valid bye/no-matchup states at close: additional `+0.5%`
- maximum `+1%`

Do not require one player to lose for the group to benefit.

## Case Closing And Case Closed Outcomes

Use existing Monday rollover for final persistence.

Case Closing UI:

- From Sunday 11:59 PM local until `weeks.final_outcome` exists, show `CaseClosingState`.
- Copy: "Final field reports are being reconciled."
- If data confidence is incomplete, show tracker warning.

Case Closed:

- Once `final_outcome` exists, `/api/weeks/current` returns `phase = "case_closed"` for the most recent closed week if it is the relevant case result.
- `CaseClosedReport` renders one vertical report:
  - outcome;
  - story consequence;
  - standard evidence;
  - Intercept Clue if earned;
  - group accomplishments;
  - individual results;
  - Detroit teaser.

Outcomes from Week 1 config:

- `trail_lost`
- `pursuit_maintained`
- `close_encounter`
- `interception`

All outcomes proceed to Detroit. Do not branch route.

## Standard Evidence And Intercept Clue Persistence

Use `group_evidence_unlocks`.

At close:

- Always unlock standard evidence `week01_brass_dial`.
- If `final_outcome === "interception"`, also unlock `week01_access_before_entry`.
- Store `outcome` on each unlock for audit/display.
- Use `ON CONFLICT DO NOTHING` for idempotency.

Evidence variants:

- `trail_lost`: basic standard evidence text.
- `pursuit_maintained`: full standard evidence.
- `close_encounter`: enhanced standard evidence marker/note.
- `interception`: full standard evidence plus Intercept Clue.

Do not use `intel_cards`; those remain Field Ops recon collectibles.

## Evidence Board Implementation

Create route `apps/web/app/(game)/evidence/page.tsx`.

API:

- `GET /api/evidence`

Payload:

```ts
{
  season: { id: string; title: string };
  interceptionCount: number;
  finaleDepthTier: 1 | 2 | 3 | 4;
  weeks: Array<{
    weekNumber: number;
    cityName: string;
    chapterTitle: string;
    standardEvidence: EvidenceDisplay;
    interceptClue: EvidenceDisplay;
    outcome: WeeklyOutcome | null;
  }>;
}
```

UI:

- responsive grid/list;
- 13 slots;
- locked/unlocked state;
- standard evidence vs Intercept Clue distinction;
- no drag-and-drop, strings, pins, or custom canvas.

Navigation:

- First implementation can link from map evidence preview and Case Closed report.
- Add persistent nav only after the page proves useful.

## Initial Beat Engine Rules

Reuse `beat_definitions`, `beat_events`, notifications, and `apps/api/src/services/beats.ts`.

V1 target rules:

- Ritual:
  - Monday briefing
  - Midweek field update
  - Final push
  - Sudden death
  - Case closing
  - Case closed
- Pursuit:
  - team ahead of pace
  - team behind pace
  - comeback
- Field Ops:
  - first line completed
  - Platform Sweep started
  - Platform Sweep completed
- Trust:
  - group data incomplete
  - result recalculating

Implementation notes:

- Add `requiredConfidence` handling to rule evaluation.
- Ritual beats override ordinary performance beats.
- Trust beats override Selena commentary.
- Return one primary beat in `/api/weeks/current`.
- Notifications may still deliver lower-priority beats.
- Do not add AI wording.

## Development-Only Week Simulator

Create `apps/web/app/dev/week-simulator/page.tsx`.

Controls:

- week number;
- day/date;
- phase;
- group weekly target;
- verified group steps;
- Field Ops bonus;
- Platform Sweep bonus;
- nemesis participation bonus;
- prediction participation bonus;
- data confidence;
- briefing viewed;
- prediction submitted;
- sudden death active;
- trigger Monday Briefing;
- trigger Midweek Update;
- trigger Final Push;
- trigger Case Closing;
- trigger Case Closed;
- unlock standard evidence;
- unlock Intercept Clue;
- reset Week 1.

Rules:

- Use real production narrative components.
- Use the real Chase Calculation service. For web-only simulator use, expose a small shared calculator wrapper or duplicate only fixture assembly, not math.
- Hide behind `process.env.NEXT_PUBLIC_ENABLE_WEEK_SIMULATOR === "1"` or `process.env.NODE_ENV === "development"`.
- Keep static export safe: no server-only dynamic APIs, no `searchParams` page prop, no backend dependency.
- Do not link from production navigation.

## Demo Fixture And Static-Export Changes

Modify `apps/web/lib/demo.ts`.

Required fixture changes:

- Week 1 Chicago as active demo week.
- Detroit as next city.
- 13-city route in Season One order.
- `/api/weeks/current` includes new `season`, `chapter`, `phase`, `dataConfidence`, `chase`, `primaryAction`, `primaryBeat`, `platformSweep`, `evidencePreview`, and `ritualViews`.
- `/api/evidence` fixture with 13 slots and Week 1 examples.
- `/api/rituals/view` demo mutation succeeds and can optionally update in-memory ritual view state.
- Field Ops fixture uses Week 1-style tile labels/copy.
- Prediction and nemesis fixtures keep current behavior but use Week 1 copy.
- Add fixture variants only if needed for the Week Simulator.

Static export constraints:

- Avoid dynamic Next APIs in server components.
- Use client components plus `Suspense` when reading query params.
- Run exact static export build before merging implementation.

## Unit, Integration, And Accessibility Tests

### API unit tests

- `seasonOneConfig.test.ts`
  - 13 unique cities.
  - Week 1 Chicago exists.
  - all four close outcomes exist.
  - standard and intercept evidence references resolve.
  - no city-specific theme config.

- `chase.test.ts`
  - zero steps.
  - 70/90/100 boundaries.
  - bonus cap.
  - remaining lead never below zero.
  - projection withheld before 24 hours.
  - incomplete data cannot be verified.

- `weeklyPhase.test.ts`
  - Monday briefing.
  - Wednesday update.
  - Friday final push.
  - Saturday sudden death.
  - Sunday case closing.
  - closed result.

- `dataConfidence.test.ts`
  - current/delayed/stale/missing/disconnected.
  - verified/estimated/incomplete group rollup.

- `specialOperations.test.ts`
  - 40/60/80 percent Platform Sweep thresholds.
  - no contributors.
  - odd group sizes.

### API integration tests

- `/api/weeks/current` returns backward-compatible old fields plus new narrative fields.
- Week rollover persists final outcome once.
- Rerunning rollover does not duplicate evidence.
- Interception unlocks Intercept Clue.
- Trail Lost unlocks only standard evidence.
- Evidence route respects group access.
- Existing prediction, nemesis, Field Ops, sync tests still pass.

### Web and accessibility tests

- Map renders story-first chase state.
- Monday Briefing opens, dismisses, and can be reopened.
- Case Closed Report renders all four outcomes in simulator.
- Evidence Board shows locked/unlocked states.
- Reduced-motion mode has no required animation.
- Keyboard can dismiss modals and activate primary actions.
- Static demo export passes.
- Contrast audit remains passing.

## Acceptance Criteria By Implementation Phase

### Phase 1: Config and pure services

- Season One config validates.
- Chase Calculation passes boundary tests.
- DataConfidence passes freshness tests.
- No production routes changed yet.

### Phase 2: Read-only API integration

- `/api/weeks/current` returns new narrative fields.
- Existing fields remain unchanged for current UI.
- OpenAPI and generated types are updated.
- No rollover behavior changed.

### Phase 3: Map and briefing

- Map shows Week 1 chapter, remaining lead, primary action, beat panel, and evidence preview.
- Monday Briefing appears once per user/week and is reopenable.
- Briefing view is persisted in `week_ritual_views`.

### Phase 4: Field Ops and Platform Sweep

- Week 1 uses configured Field Ops challenge codes.
- Existing board mechanics still work.
- First line triggers route/platform payoff.
- Platform Sweep bonus appears and feeds Chase Calculation.

### Phase 5: Closing and evidence

- Rollover persists final outcome/progress.
- All four case outcomes render in simulator.
- Standard evidence unlocks every outcome.
- Intercept Clue unlocks only on interception.
- Rerunning rollover is idempotent.

### Phase 6: Evidence Board and demo

- Evidence Board renders 13 slots.
- Demo fixtures match Week 1 Chicago.
- Static export passes.

### Phase 7: Initial beats

- One primary beat appears on map.
- Trust beats suppress Selena commentary when data is incomplete.
- Ritual beats override performance beats.

## Migration And Rollback Risks

- Adding nullable `weeks` columns is low risk, but any code assuming only old columns should continue to work.
- New evidence/ritual tables are isolated and can be ignored by old code.
- Changing `weekClose.ts` and `weekRollover.ts` is high risk; do it only after pure calculator tests exist.
- Fixed Field Ops boards can accidentally affect all weeks if not gated by Season Week config.
- Prediction timing must not change in the Week 1 V1 pass.
- Demo route/config mismatch can break static export or confuse reviewers.
- If seed route is changed, existing dev data may point to old city IDs; route migration should be isolated and tested.

Rollback strategy:

- If calculator integration causes issues, stop returning new chase fields and leave old map behavior intact.
- If rollover persistence fails, keep `target_hit` path and disable evidence unlock calls.
- If Week 1 fixed board causes trouble, fall back to existing deterministic random board while preserving narrative surfaces.

## Sequential Task List

Each pass should be independently testable.

1. Add `seasonOne.ts` config with Week 1 polished and Weeks 2-13 structural.
2. Add config validation tests.
3. Add `chase.ts` with pure unit tests.
4. Add `dataConfidence.ts` with pure unit tests.
5. Add `weeklyPhase.ts` with pure unit tests.
6. Add `specialOperations.ts` with pure unit tests.
7. Add migration `008_week_one_narrative.sql`.
8. Add `evidenceService.ts` and evidence integration tests.
9. Add `rituals.ts` route and tests for recording `monday_briefing`.
10. Extend `/api/weeks/current` read-only with new narrative payload.
11. Update OpenAPI and regenerate web API types.
12. Add web narrative components with static/mock props.
13. Add Week Simulator and wire it to production narrative components/calculator.
14. Update Map/home screen to consume new payload.
15. Add Monday Briefing persistence and reopen action.
16. Add Week 1 Field Ops fixed-board config support.
17. Add reusable Field Ops detectors needed for V1 substitutions.
18. Add Platform Sweep card and API payload.
19. Add prediction participation bonus to Chase Calculation while preserving prediction timing.
20. Add nemesis participation bonus to Chase Calculation.
21. Integrate Chase Calculation into `weekClose.ts`/`weekRollover.ts`.
22. Persist case outcome/progress and evidence unlocks at rollover.
23. Add Case Closing and Case Closed Report components.
24. Add Evidence Board route and API.
25. Add initial beat rules and confidence gating.
26. Align demo fixtures to Week 1 Chicago.
27. Run API typecheck.
28. Run web typecheck.
29. Run API tests with DB.
30. Run web build.
31. Run static demo export build.
32. Run contrast audit.
33. Do manual simulator review for all four outcomes and incomplete-data state.

This sequence keeps the first Week 1 build small, testable, and faithful to the existing architecture.
