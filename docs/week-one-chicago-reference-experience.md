# Week One Chicago Reference Experience

**Game:** One Step Ahead: The Search for Selena Chicago  
**Season:** Season One — The Lakefront Job  
**Week:** Week 1  
**City:** Chicago  
**Chapter:** The Lakefront Job  
**Purpose:** Product and UX contract for the first fully implemented reference week  
**Status:** Approved implementation reference  
**Parent specification:** `docs/one-step-ahead-season-one-implementation-spec.md`

---

## 1. How This Document Should Be Used

This document defines the detailed player experience for Week 1.

It governs:

- the Monday-to-Sunday player journey;
- the hierarchy of the main chase screen;
- Week 1 briefing and ritual copy;
- the Chicago Field Ops board;
- Prediction and Nemesis presentation;
- the Wednesday Midweek Field Update;
- Friday Final Push;
- the Chicago special operation;
- Sunday reconciliation and case close;
- all four Week 1 outcomes;
- standard evidence and the Intercept Clue;
- the Detroit teaser;
- the initial Beat Engine library;
- the development-only Week Simulator;
- the Week 1 definition of done.

The parent Season One implementation specification continues to govern:

- season-wide canon;
- Selena's character rules;
- the thirteen-city route;
- chase math;
- outcome thresholds;
- bonus caps;
- evidence rules;
- data-confidence requirements;
- scope guardrails.

If this document conflicts with a general recommendation in the parent specification, this document governs Week 1 only. Season-wide rules remain authoritative everywhere else.

---

## 2. Implementation Philosophy

Week 1 should teach the game without feeling like a tutorial.

The player should understand by the end of the week:

1. Real verified steps move the group closer to Selena.
2. Field Ops reveal story and modestly improve the chase.
3. Friends matter through predictions, nemesis duels, assists, and team objectives.
4. Catching Selena earns deeper access to the mystery.
5. Selena always escapes, but the team's success changes what they discover.

### Core implementation rule

> One reusable chase screen, a small number of ritual surfaces, and configuration-driven content.

Do not build:

- a custom Chicago-only page;
- a bespoke Chicago map engine;
- actual train-routing logic;
- live location tracking;
- cinematic infrastructure;
- generative Selena copy;
- twenty-five unique Field Ops evaluators;
- permanent route branching.

Most Week 1 behavior should run through existing Map, Field Ops, Prediction, Nemesis, Profile, and weekly rollover systems.

---

## 3. Minimum Surface Inventory

| Surface | Recommended implementation |
|---|---|
| Preseason assignment | Full-screen transition or modal |
| Monday Briefing | Full-screen overlay or large modal |
| Main Chase | Existing Map/home screen |
| Field Ops | Existing Field Ops page |
| Prediction | Existing Prediction page or card |
| Nemesis | Existing Nemesis page |
| Midweek Field Update | Large modal plus persistent summary card |
| Final Push | Banner plus first-open modal |
| Special Operation | Reusable progress card |
| Case Closing | Full-screen or large blocking status |
| Case Closed Report | One vertically scrolling report |
| Evidence Board | Simple responsive grid/list |
| Next City Teaser | Final section inside Case Closed |

Do not create a separate route for every day of the week.

---

## 4. Preseason Transition

The player has already:

- created or joined a group;
- connected supported health data;
- chosen a weekly target;
- selected an avatar;
- completed basic onboarding.

After onboarding, show a short assignment transition.

### Copy

**Label**

> ASSIGNMENT ACCEPTED

**Body**

> Your unit has been assigned to locate Selena Chicago, a fugitive connected to a restricted Bureau system known as the Meridian.
>
> Her last confirmed location was Chicago.

**Primary CTA**

> Open the first case

This opens the Monday Briefing.

---

## 5. Monday Briefing

### Purpose

The briefing must establish:

- who Selena is;
- what occurred;
- the immediate weekly objective;
- the starting pursuit gap;
- the supporting systems;
- one primary action.

It must not explain the full Meridian mystery.

### Presentation

A short staged sequence may show:

1. `CASE 01`
2. `CHICAGO`
3. Selena silhouette or art
4. Briefing copy and starting lead

Requirements:

- short;
- skippable;
- reduced-motion compatible;
- dismissible;
- reopenable from the chase screen.

### Exact copy

**Label**

> BUREAU FIELD BRIEFING

**Title**

> CASE 01: THE LAKEFRONT JOB

**Body**

> At 4:18 AM, Selena Chicago entered a sealed infrastructure chamber beneath the city.
>
> Eleven minutes later, a Meridian component was missing.
>
> She was last seen moving toward the elevated lines. Your unit has been assigned to recover the component before she leaves Chicago.

**Starting chase state**

> SELENA'S LEAD: {{formattedGroupWeeklyTarget}} STEPS

The visible starting lead equals the group's snapshotted weekly target. Do not hardcode 350,000.

**Supporting line**

> Every verified step your unit takes closes the distance.

### Supporting system cards

**FIELD OPS**

> Complete operations to improve the pursuit and uncover city intel.

**PREDICTION**

> Estimate how far the team will get before the case closes.

**NEMESIS**

> Outwalk your assigned rival in a five-day duel.

### Actions

**Primary CTA**

> Begin the pursuit

**Secondary action**

> Review assignment

Record `briefingViewedAt` when the briefing is dismissed or completed.

---

## 6. Main Chase Screen

The Map remains the primary home screen.

It must answer:

1. What is happening?
2. How far ahead is Selena?
3. What did the group accomplish recently?
4. What should this player do next?

### Recommended hierarchy

#### 6.1 Current scene

Display:

- Chicago;
- chapter title;
- existing route/map;
- Selena marker;
- group marker;
- route line;
- optional static or lightly animated Selena silhouette.

No custom scene renderer is required.

#### 6.2 Story-first chase state

Primary:

> Selena is {{remainingLead}} steps ahead

Supporting:

> The {{groupName}} closed {{stepsClosedToday}} steps today.

Secondary transparency:

> {{progressPercent}}% of the weekly pursuit completed

The percentage should remain available but not lead the presentation.

#### 6.3 One primary action

Only one dominant CTA should display at a time.

Initial Monday example:

> FIRST LEAD: IDENTIFY HER DEPARTURE ROUTE  
> Complete one Field Ops line to confirm which train Selena boarded.

CTA:

> Open Field Ops

Later example:

> KEEP PRESSURE ON THE TRAIL  
> Walk {{stepsToDailyTarget}} more steps to reach today's target.

CTA:

> View today's progress

#### 6.4 One primary narrative beat

Example:

> FIELD REPORT  
> The first confirmed movement reports have reached the Bureau. Selena is still inside Chicago.

This area may later show Selena commentary, warnings, trust states, and ritual messages.

#### 6.5 Compact team activity

Show at most three recent events.

Examples:

- Maya completed Morning Surveillance.
- Jordan submitted a prediction.
- You gained 624 steps on Alex.
- The group decoded the first Chicago lead.

This is a small event log, not an open social feed.

#### 6.6 Secondary system cards

**Field Ops**

> 1 of 5 tiles complete  
> Next reward: departure route

**Prediction**

> Not submitted  
> Locks {{configuredPredictionLock}}

**Nemesis**

> You vs. Maya  
> You lead today by 214 steps

#### 6.7 Evidence preview

Locked:

> CHICAGO EVIDENCE  
> Complete the case to recover the first Meridian artifact.

Unlocked after close:

> THE BRASS DIAL  
> View on evidence board

---

## 7. Primary Action Selection

Use deterministic priority rather than AI.

Recommended order:

1. A sync problem requiring this user's action
2. Monday briefing not viewed
3. Case result available
4. Sudden death active
5. Special operation active and incomplete
6. Prediction not submitted and deadline near
7. Field Ops reward nearly complete
8. Nemesis lead close or recently reversed
9. Personal daily target within reach
10. Default pursuit action

Suggested contract:

```ts
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
```

This logic must be centralized and tested.

---

## 8. Monday Interactions

Three actions may be available, but only one should be visually primary.

### Primary

Open Field Ops.

### Secondary

Submit prediction.

### Passive review

View nemesis pairing.

Do not require the player to complete an instructional tour of all systems.

---

## 9. Week 1 Field Ops Board

Use the existing shared 5x5 Field Ops implementation.

### Desired content mix

- 10 verified movement tiles
- 5 consistency or time-pattern tiles
- 4 social/team tiles
- 4 low-stakes self-reported tiles
- 2 Chicago story tiles

Do not require location tracking.

### Tile list

#### Verified movement

1. **First Footfall**  
   Log 1,000 verified steps in one day.

2. **On the Move**  
   Log 5,000 verified steps in one day.

3. **Hot Pursuit**  
   Log 10,000 verified steps in one day.

4. **Closing Distance**  
   Reach 50% of your daily target.

5. **Full Shift**  
   Reach 100% of your daily target.

6. **Keep the Trail**  
   Log at least 2,000 steps on two consecutive days.

7. **Three-Day Tail**  
   Log verified steps on three consecutive days.

8. **Long Route**  
   Record one day at least 20% above your recent daily average.

9. **Quick Recovery**  
   Reach your target the day after missing it.

10. **City Sweep**  
    Accumulate 15,000 verified steps during the week.

#### Consistency and time pattern

11. **Morning Surveillance**  
    Log 1,000 steps before noon.

12. **After-Hours Watch**  
    Log 1,000 steps after 6:00 PM.

13. **Split Shift**  
    Log at least 1,000 steps in two distinct parts of one day.

14. **Steady Signal**  
    Record at least 500 steps on five separate days.

15. **No Cold Trail**  
    Avoid a zero-step day during the active week.

#### Social and team

16. **Send Backup**  
    Gift one tile assist to a teammate.

17. **Accept Backup**  
    Use or acknowledge a teammate assist.

18. **Unit Mobilized**  
    At least three group members reach 50% of a daily target on the same day.

19. **Full Team Report**  
    Every eligible active group member syncs at least once within a 24-hour period.

#### Self-reported, low-stakes

20. **Take the Long Way**  
    Confirm that you deliberately added movement to an ordinary trip.

21. **Eyes Up**  
    Confirm that you noticed a new detail in your surroundings.

22. **Walk With Someone**  
    Confirm a walk or equivalent activity with a friend, family member, or pet.

23. **Choose the Longer Route**  
    Confirm choosing a longer accessible route when safe and appropriate.

Do not require stairs. The original "No Elevator" concept is replaced with an accessible equivalent.

#### Chicago story tiles

24. **Trace the Grid**  
    Complete two verified movement tiles in one day.

    Story payoff:

    > Your route confirms Selena is using Chicago's grid to disguise her direction.

25. **Find the Platform**  
    Complete any full row, column, or diagonal.

    Story payoff:

    > The unit identifies Selena's departure platform.

### Reusable rule categories

Do not build twenty-five custom evaluators.

Preferred reusable rule types:

```ts
export type FieldOpRuleType =
  | "steps_in_day"
  | "percent_target_in_day"
  | "consecutive_days"
  | "active_days"
  | "time_window_steps"
  | "weekly_steps"
  | "group_threshold"
  | "assist_sent"
  | "assist_received"
  | "self_report"
  | "line_complete";
```

Map these onto the repository's existing detector and honor-system architecture wherever possible.

### Important audit constraint

The existing Field Ops board already has deterministic generation, verified detectors, honor tiles, assists, accessibility substitutions, lines, blackout, and scout tokens.

Do not replace it.

The technical plan should identify:

- which Chicago tiles already map to current challenge definitions;
- which require new reusable detectors;
- which should remain existing equivalents rather than exact new definitions;
- how the 5% group bonus is calculated from existing line results.

---

## 10. Prediction Experience

Use the current numeric team-total prediction model.

### Headline

> How close will your unit get to Selena by Sunday night?

### Clarifying copy

> Predict the {{groupName}}'s total verified steps this week.

### State copy

> Predictions remain sealed until the configured reveal condition.

### Result

- closest prediction wins Oracle;
- ties use earliest submission;
- participation may contribute up to 1% to group chase progress;
- prediction accuracy does not directly change chase progress.

### Audit issue to resolve

The current repository allows submission only Monday and reveals Monday noon or when everyone submits.

The Season One master spec proposed Friday lock.

For easiest implementation, the technical plan should present two options:

**Option A — minimal-change V1:** preserve Monday submission/reveal behavior and update only narrative language.

**Option B — fuller ritual change:** allow submission through a configured Friday lock.

Recommendation for the initial Week 1 build: preserve current prediction mechanics unless changing them is low risk. The story layer does not depend on a Friday submission window.

Codex should not change timing silently.

---

## 11. Nemesis Experience

Reuse the current pairing, scoring, Sunday reveal, reroll, and sudden-death systems.

### Reveal

**Label**

> RIVAL ASSIGNMENT

**Body**

> Selena studies patterns. This week, so will you.

**Pairing**

> You vs. {{opponentName}}  
> Five daily rounds. Most verified steps wins the day.  
> First to three wins.

**Selena**

> “You know each other's habits. Let us see who understands them better.”

### Daily state

Show:

- current daily step difference;
- daily wins;
- series score;
- cutoff.

Example:

> You lead by 326 steps today  
> Series: You 2 — Maya 1  
> Today closes at midnight.

### Team chase contribution

Nemesis participation may add up to 1% to the group chase.

It must not require one player to lose for the group to benefit.

The technical plan should define "qualifying participation" based on current matchup and step-log data.

---

## 12. Monday Evening Beat

Only show performance-specific copy when data confidence is adequate.

### Strong participation

> THE UNIT IS MOVING  
> Four operatives have filed verified movement reports. Selena remains inside the city.

### Incomplete participation data

> AWAITING FIELD REPORTS  
> Two operative trackers have not reported. Current pursuit estimates remain incomplete.

Do not use a Selena taunt on the first day because players have not yet accumulated enough meaningful data.

---

## 13. Tuesday Experience

Tuesday should demonstrate that the chase responds to progress.

### Possible primary actions

> CONFIRM THE DEPARTURE ROUTE  
> One more Field Ops tile completes your first line.

Or:

> CLOSE TODAY'S GAP  
> Walk {{stepsRemaining}} more steps to reach today's target.

### Team ahead of pace

> THE TRAIL IS WARM  
> The unit is closing faster than the Bureau projected.

Selena:

> “Faster than expected. I have corrected my estimate.”

### Team behind pace

> THE LEAD IS WIDENING  
> The unit is currently below interception pace.

CTA:

> View what is still achievable

Never use shame-based language.

---

## 14. Wednesday Midweek Field Update

Trigger on Wednesday at a configured time or the first eligible app open after that time.

### Presentation

A large modal or full-screen surface that can be dismissed and reopened.

### Variants

#### Strong pace

> THE GAP IS CLOSING  
> The {{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.
>
> Surveillance now places her near the elevated lines.

Selena:

> “You are moving quickly. I wonder whether you are watching the right train.”

CTA:

> Review the new lead

#### Expected pace

> PURSUIT MAINTAINED  
> The unit remains on pace to keep Selena within reach.

Selena:

> “Adequate. The Bureau does enjoy an adequate performance.”

#### Recovery needed

> THE TRAIL IS COOLING  
> The unit is currently projected to lose contact before Sunday.

CTA:

> See the recovery plan

The recovery plan may simply show:

- remaining lead;
- days remaining;
- available Field Ops bonus;
- available special-operation bonus.

Do not build an optimization engine.

#### Incomplete data

> FIELD REPORTS INCOMPLETE  
> The Bureau cannot calculate a reliable pursuit estimate until trackers respond.

CTA:

> Review sync status

Selena should not speak in this state.

### Wednesday story reveal

If the first Field Ops line is complete:

> DEPARTURE ROUTE CONFIRMED  
> Selena boarded a northbound train—but exited before the next confirmed camera sighting.

Evidence preview:

> Investigators recovered a partial image of a brass dial marked with thirteen positions.

Do not unlock the full evidence card before case close.

---

## 15. Thursday Experience

Thursday emphasizes social pressure and upcoming deadlines.

Possible primary actions:

- nemesis reversal;
- prediction deadline;
- Field Ops milestone;
- special-operation readiness.

### One player carrying the group

> “One operative is carrying the pursuit. That is efficient. It is not resilient.”

### Balanced contribution

> “No single trail stands out. That makes the unit harder to predict.”

Do not repeatedly reward only the highest-volume walker.

---

## 16. Friday Final Push

Trigger Friday at a configured time.

### Presentation

- persistent banner;
- optional first-open modal;
- one projected outcome;
- concrete remaining options.

### Example

> FINAL PUSH

> CLOSE ENCOUNTER PROJECTED  
> At the current pace, the {{groupName}} will finish approximately {{projectedShortfall}} steps short of interception.

### Remaining opportunities

> Two paths remain:
>
> - Complete one more Field Ops milestone: up to +{{fieldOpsBonusRemaining}}
> - Finish Platform Sweep: up to +{{specialOperationBonusRemaining}}

Selena:

> “You are close enough to become inconvenient.”

Do not promise interception if data is incomplete.

---

## 17. Chicago Special Operation

### Name

> PLATFORM SWEEP

### Fiction

> Bureau analysts have narrowed Selena's route to three elevated platforms. The unit must cover all exits before she changes lines.

### Objective

Each eligible participant contributes at least 2,000 verified steps during the configured operation window.

Recommended window:

- begins Friday morning;
- ends Saturday evening;
- exact timestamps should be configuration-driven and group-time-zone aware.

No simultaneous activity is required.

### Participation tiers

- 40% of eligible active players contribute: +1%
- 60% contribute: +2%
- 80% contribute: +3%

Maximum: +3%

### UI

> PLATFORM SWEEP  
> {{contributors}} of {{eligiblePlayers}} operatives have contributed  
> Next bonus: {{nextThresholdCount}} operatives

### Implementation note

This should be the first reusable special-operation type:

```ts
export type ParticipationThresholdOperation = {
  type: "participation_threshold";
  minimumVerifiedStepsPerPlayer: number;
  startsAt: string;
  endsAt: string;
  tiers: Array<{
    requiredRatio: number;
    bonus: number;
  }>;
};
```

---

## 18. Saturday Experience

Primary priorities:

- Platform Sweep;
- nemesis sudden death;
- remaining chase gap.

### Sudden death

> SUDDEN DEATH  
> Today decides the matchup. Most verified steps by midnight wins.

Use the strongest red-alert treatment only here and for critical system states.

### Interception still achievable

> SELENA IS WITHIN REACH  
> {{remainingLead}} pursuit steps remain.

### Interception unlikely, Close Encounter achievable

> THE UNIT CAN STILL FORCE A NEAR CAPTURE  
> Close another {{stepsToCloseEncounter}} steps to secure enhanced evidence.

Never present the remaining week as pointless.

### Very close Selena line

> “That was almost a mistake.”

---

## 19. Sunday Before Close

Clearly show:

- official cutoff;
- remaining lead;
- projected result;
- unresolved sync state;
- last available actions.

### Example

> CASE CLOSES IN {{timeRemaining}}  
> Selena is {{remainingLead}} steps ahead.  
> One completed Field Ops milestone would reduce the remaining gap.

### Data warning

> Two trackers have not reported since yesterday. Final results may change after synchronization.

Do not finalize the case before reconciliation when missing data could alter the outcome.

---

## 20. Case Closing

At the cutoff, show a controlled reconciliation state.

### Copy

> CASE CLOSING

> Final field reports are being reconciled.

Supporting copy:

> This may update the group's pursuit result, nemesis matchups, and Oracle award.

The existing Monday rollover may continue to perform authoritative closure if the UI presents Sunday 11:59 PM as the cutoff and the overnight process as reconciliation.

The technical plan should preserve current rollover safety rather than force a risky immediate rewrite.

---

## 21. Case Closed Report

Use one vertically scrolling report rather than multiple award pages.

### Required sections

1. Outcome
2. Story consequence
3. Standard evidence
4. Intercept Clue, when earned
5. Group accomplishments
6. Individual results
7. Detroit teaser

### Group accomplishments

May include:

- total verified steps;
- final progress;
- Field Ops lines;
- special-operation result;
- city outcome.

### Individual results

May include:

- Oracle;
- nemesis outcome;
- badges;
- personal step contribution;
- assists.

---

## 22. Week 1 Outcome Treatments

Use the season-wide thresholds:

```text
finalProgress < 0.70      = trail_lost
0.70–0.8999               = pursuit_maintained
0.90–0.9999               = close_encounter
finalProgress >= 1.00     = interception
```

### 22.1 Trail Lost

**Headline**

> TRAIL LOST

**Story**

> The unit reached the elevated line after Selena's signal disappeared. Surveillance could not confirm which route she took out of the city.

**Selena**

> “You searched the streets. You should have searched beneath them.”

**Evidence**

Unlock the basic standard evidence:

> A mechanical dial marked with thirteen positions was recovered near the Chicago node.

**Next lead**

> A matching mechanical signature has appeared in Detroit.

### 22.2 Pursuit Maintained

**Headline**

> PURSUIT MAINTAINED

**Story**

> The {{groupName}} confirmed Selena's departure route and kept her within operational range. She left Chicago before the unit reached the platform.

**Selena**

> “You found the route. Not the reason.”

**Evidence**

Unlock the full standard evidence:

> A mechanical dial marked with thirteen positions. One position is engraved with Chicago's coordinates.

### 22.3 Close Encounter

**Headline**

> CLOSE ENCOUNTER

**Story**

> The unit reached the correct platform moments after Selena's train departed. A red glove was recovered beside the track.

**Selena**

> “Another platform. Another minute. That was the difference.”

**Evidence**

Unlock:

- The Brass Dial;
- enhanced note about recent use or tool marks;
- Close Encounter marker.

Do not unlock the full Intercept Clue.

### 22.4 Interception

**Headline**

> SELENA INTERCEPTED

**Story**

> The {{groupName}} reached Selena before the train cleared the platform. For seventeen seconds, the pursuit was over.
>
> The lights failed. When power returned, Selena was gone.

This may use text and a static image. It does not require cinematic infrastructure.

**Selena**

> “Someone opened the Chicago node before I did. Ask your Bureau why.”

**Standard evidence**

> THE BRASS DIAL

**Intercept Clue**

> ACCESS BEFORE ENTRY

> A surveillance photograph shows a credentialed Bureau figure entering the Chicago node before Selena arrived. The identity is obscured, but the timestamp is intact.

---

## 23. Evidence Board V1

Use a simple responsive thirteen-slot grid or ordered list.

Each slot shows:

- week number;
- city;
- evidence title;
- locked/unlocked state;
- weekly outcome marker;
- Intercept marker if applicable.

### Week 1 card

> WEEK 01  
> CHICAGO  
> THE BRASS DIAL

When intercepted:

> INTERCEPT CLUE RECOVERED

The board does not need draggable cards, strings, pins, or a custom canvas.

### Evidence vs. existing intel

Keep the concepts separate:

- **Field Ops intel:** existing next-city landmarks, fun facts, and scout unlocks.
- **Season evidence:** canonical plot memory and finale depth.

Do not repurpose the current intel tables without a deliberate data-model decision.

---

## 24. Detroit Teaser

All four outcomes continue to Detroit.

### Header

> NEXT: DETROIT

### Copy

> A manufacturing system dormant for decades has restarted without an operator. Its mechanical signature matches the dial recovered in Chicago.

### Selena

> “Bring the dial. You will understand it when the machine starts.”

### CTA

> Continue the pursuit

The next week should not open before its configured start.

---

## 25. Initial Beat Engine Library

Codex should initially implement a subset of the following. The complete list defines the target Week 1 library.

### Ritual

1. Monday briefing
2. Midweek field update
3. Final push
4. Sudden death
5. Case closing
6. Case closed

### Pursuit

7. Team ahead of pace
8. Team behind pace
9. Group comeback
10. Lead reduced below 50%
11. Close Encounter projected
12. Interception projected
13. Interception within one personal daily target
14. Projected outcome changed

### Field Ops

15. First tile completed
16. First line completed
17. Group Field Ops milestone
18. Platform Sweep started
19. Platform Sweep completed

### Nemesis

20. Rival takes the lead
21. Rival lead reclaimed
22. Matchup tied 2–2
23. Matchup won

### Social

24. First teammate assist
25. Inactive player returns
26. Group participation reaches 70%
27. Balanced team contribution
28. One player carrying a disproportionate share

### Trust

29. Tracker delayed
30. Group data incomplete
31. Tracker reconnected
32. Result recalculating

### V1 priority

The first implementation may start with approximately 15 rules:

- all six ritual beats;
- team ahead;
- team behind;
- comeback;
- first line;
- Platform Sweep started;
- Platform Sweep completed;
- sudden-death state;
- group data incomplete;
- result recalculating.

---

## 26. Beat Selection Requirements

- One primary beat on the main chase surface.
- Small supporting event feed allowed.
- Do not show duplicate interpretations of one event.
- Ritual beats may override ordinary performance beats.
- Trust beats override Selena performance commentary.
- Respect cooldowns.
- Avoid repeated taunts.
- Prefer actionable beats.
- Never shame low activity.
- Never claim unsupported facts.

---

## 27. Data Confidence

Use the parent specification's values:

```ts
export type DataConfidence =
  | "verified"
  | "estimated"
  | "incomplete"
  | "recalculating";
```

### Week 1 behavior

- Selena performance commentary requires `verified`.
- `estimated` may show cautious projections without a direct taunt.
- `incomplete` uses Bureau field-report copy.
- `recalculating` blocks final-result presentation.

### Repository audit requirement

The current sync layer already exposes last-sync behavior but does not yet produce a centralized confidence result.

The technical plan should add confidence as a calculation/helper layer before broad Beat Engine implementation.

---

## 28. Week Simulator

A development-only Week Simulator is required.

Suggested route:

`/dev/week-simulator`

or an equivalent development-only drawer.

### Required controls

- week number;
- day or date;
- week phase;
- group weekly target;
- verified group steps;
- Field Ops bonus;
- special-operation bonus;
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

### Critical requirement

The simulator must render real production components and use the real chase calculator and beat selector.

Do not create a separate fake visualization that can diverge from production behavior.

### Static demo constraint

The repository supports static demo mode. The technical plan should decide whether the simulator is:

- local development only; or
- represented through static fixture variants.

It must not break static export.

---

## 29. Audit-Informed Migration Guidance

Based on the repository audit:

### Preserve

- `weeks` lifecycle and transactional rollover;
- scheduled Sunday nemesis reveal;
- `step_logs` and upsert behavior;
- existing Map/home screen;
- Field Ops/bingo storage and detector engine;
- honor-system and gift mechanics;
- scout tokens and next-city intel;
- prediction table and scoring;
- nemesis pairing/scoring/sudden death;
- badge awarding;
- demo fixture pattern;
- terminal design components.

### Add around existing systems

- Season One configuration;
- centralized Chase Calculation;
- four weekly outcomes;
- calculated or persisted WeekPhase;
- DataConfidence;
- Season evidence;
- Intercept Clues;
- narrative ritual surfaces;
- primary-action selection;
- Week Simulator.

### Avoid premature schema expansion

The audit listed many possible new tables. Codex should not automatically create all of them.

The technical plan must identify the **minimum schema** required for Week 1.

Preferred order:

1. Configuration in TypeScript or static content.
2. Pure chase calculations.
3. Read-only chase result in `/api/weeks/current`.
4. Minimal persisted weekly result and evidence unlock.
5. Additional season tables only when persistence requirements demand them.

Do not build speculative tables for future seasons before Week 1 works.

---

## 30. Week 1 Definition of Done

Using the Week Simulator, a nontechnical product owner can:

- open the Chicago case;
- read and reopen the briefing;
- see the starting lead calculated from the group target;
- see steps reduce Selena's lead;
- view one primary action;
- complete Field Ops tiles;
- complete the first Field Ops line;
- submit or inspect a prediction;
- view a nemesis matchup;
- receive a Midweek Field Update;
- enter Final Push;
- activate and complete Platform Sweep;
- experience nemesis sudden death;
- enter Case Closing;
- view all four weekly outcomes;
- unlock The Brass Dial;
- unlock Access Before Entry after interception;
- view the Evidence Board;
- see the Detroit teaser;
- verify reduced-motion and incomplete-data behavior;
- reset the simulated week.

Week 1 is not complete if:

- Chicago requires a custom one-off page;
- calculations are duplicated across UI components;
- outcome logic differs between the API and case-close UI;
- stale data can trigger a Selena performance taunt;
- re-running close logic duplicates rewards or evidence;
- the next route differs by weekly outcome;
- the implementation breaks current static demo export.

---

## 31. Recommended Implementation Sequence

1. Add and validate Week 1 configuration.
2. Centralize chase calculation.
3. Return read-only chase result from the existing current-week API.
4. Add Week Simulator using fixtures and production components.
5. Update the main Map/home hierarchy.
6. Add Monday Briefing.
7. Add minimum DataConfidence handling.
8. Add Midweek Update and Final Push.
9. Add Platform Sweep.
10. Add four Case Closed states.
11. Add standard evidence and Intercept Clue persistence.
12. Add Evidence Board.
13. Add initial Beat Engine rules.
14. Align demo fixtures.
15. Test rollover and idempotent rewards.
16. Scale later weeks through configuration.

---

## 32. Final Week 1 Standard

The Chicago reference week succeeds when the player experiences one coherent chain:

> Real movement closes Selena's lead.  
> Field Ops identify her route.  
> Social systems create stakes.  
> Rituals give the week shape.  
> The case closes with a meaningful result.  
> Interception reveals a deeper mystery.  
> Selena escapes toward Detroit.

The steps are real. Everything they touch should feel like fiction closing around Selena Chicago.
