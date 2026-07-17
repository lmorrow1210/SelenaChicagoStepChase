# One Step Ahead — New Chat Handoff

## Status Update — July 17, 2026

The Week 1 Chicago vertical slice has been preserved, completed, verified,
committed, and pushed on `codex/week-one`.

Latest pushed branch commit:

`d714085 Finish Week 1 demo contract`

Important earlier preservation commit:

`9f5a9ee WIP: implement Week 1 vertical slice`

Working-tree state after push: clean.

Do **not** restart the Week 1 work. The next useful step is PR #3 review and
manual product smoke testing, then merge only if Lindsey explicitly asks.

## Project

**Game:** One Step Ahead: The Search for Selena Chicago  
**Repository:** `lmorrow1210/SelenaChicagoStepChase`  
**GitHub Pages:** `https://lmorrow1210.github.io/SelenaChicagoStepChase/`  
**Active branch:** `codex/week-one`  
**Active pull request:** PR #3 — `Week 1 foundation and season state API`  
**Base branch:** `main`

The user is building a polished, story-first social fitness game powered by real step data. The immediate objective is to complete and stabilize the full **Week 1 Chicago vertical slice** before working on Weeks 2–13.

The user is not a traditional engineer and is using Codex / Claude Code as implementation agents. They want larger, more autonomous implementation waves rather than many small prompts and reviews.

## Locked Product Canon

- Selena Chicago is from Chicago.
- Selena is a stylish, mysterious Black woman with long curly hair, a sky-blue wide-brimmed hat, a sky-blue trench coat, red gloves, and red boots.
- Selena is not a true villain. She is ultimately a covert good actor trying to expose or counter something larger.
- The Meridian is a distributed analog-digital network activated through physical geographic nodes.
- The Bureau is compromised but not uniformly corrupt.
- Players catch Selena at the end of every season.
- Selena then escapes so the chase can continue.
- Selena leaves a clue to a larger mystery at the end of each season.
- There is no recurring named supporting-character cast.
- The only recurring narrative entities are Selena, the Bureau, and the player group.
- The game uses one consistent visual design system across cities.
- Do not build unique city visual themes.
- Seasons are 13 weeks.
- Every mechanic must support one central chase.
- Real verified movement closes Selena’s lead.
- Field Ops, Prediction, Nemesis, evidence, badges, rituals, and rewards should all reinforce the pursuit.
- Narrative must never outrun data confidence.
- Selena performance commentary requires verified data.
- Incomplete or stale data should use Bureau trust-state copy, not Selena taunts.
- The Beat Engine must be deterministic and authored, not generative AI.
- All Week 1 outcomes continue to Detroit.

Core principles:

> Never show a number when you can show a story.

> Never add a mechanic unless it changes the chase.

> Never tell a story unsupported by data.

Primary development constraint:

> Optimize for a solo, configuration-driven implementation. Avoid custom systems when existing systems can be reused.

## Season One

**Title:** The Lakefront Job

### Acts

- Act I — Follow the Object
- Act II — Follow the Signal
- Act III — Follow the Pattern
- Act IV — Choose Whom to Follow

### Locked 13-city route

1. Chicago
2. Detroit
3. Pittsburgh
4. Washington, D.C.
5. Philadelphia
6. New York City
7. Boston
8. Savannah
9. New Orleans
10. Austin
11. Santa Fe
12. Los Angeles
13. San Francisco

Week 1 is the fully polished reference week. Weeks 2–13 may remain structural configuration until Week 1 is complete and stable.

## Authoritative Documents

Read these before implementation:

1. `docs/one-step-ahead-season-one-implementation-spec.md`
2. `docs/week-one-chicago-reference-experience.md`
3. `docs/week-one-repository-audit.md`
4. `docs/week-one-technical-plan.md`

Authority order:

1. Season One implementation specification
2. Week One Chicago reference experience
3. Repository audit
4. Technical plan
5. Existing tested repository behavior where product documents intentionally defer a choice

## Existing Systems That Must Be Reused

### Week lifecycle
- `scheduled`, `active`, and `closed` weeks
- Sunday scheduled reveal
- Monday rollover
- transactional/idempotent rollover
- group-local timezone handling

### Step data
- `step_logs`
- daily upserts
- group aggregation
- real and mock Fitbit clients
- group-local sync ticks

### Map / home
- existing Map is the main chase/home surface
- route pins, Selena lead, progress strip, leaderboard, countdown, terminal styling

### Field Ops
- existing 5x5 board stored as `bingo_cards`
- verified detectors
- honor-system tiles
- accessibility substitutions
- Gift-a-Tile assists
- line completion
- blackout
- scout tokens
- next-city recon intel

Do not replace this system.

### Prediction
- one prediction per user per week
- sealed/reveal behavior
- deterministic scoring
- Oracle badge

Approved V1 decision: preserve current Monday-oriented prediction behavior unless changing it is clearly low risk.

### Nemesis
- weekly pairings
- daily scoring
- best-of-five
- reroll
- Sunday reveal
- Saturday sudden death
- rollover finalization

Do not replace this system.

### Existing intel
- landmarks
- city unlocks
- intel cards
- dossier

Keep separate:

- **Field Ops intel** = city landmarks/recon/fun facts
- **Season evidence** = canonical plot memory and finale depth

## Work Completed and Pushed Before the Large Claude Wave

### Foundation
Created:
- `apps/api/src/config/seasonOne.ts`
- `apps/api/src/services/chase.ts`
- `apps/api/src/services/dataConfidence.ts`
- `apps/api/src/services/weeklyPhase.ts`
- associated tests

Modified:
- `packages/shared/src/index.ts`

Added:
- `WeeklyOutcome`
- `WeekPhase`
- `DataConfidence`
- 13-week Season One config
- polished Week 1 config
- pure chase calculator
- outcome classification
- data-confidence calculator
- phase calculator

### API integration
Created:
- `apps/api/src/services/primaryAction.ts`
- related tests

Modified:
- `apps/api/src/routes/weeks.ts`
- `apps/api/openapi.yaml`
- `apps/web/lib/api-types.d.ts`
- `apps/web/lib/demo.ts`
- `packages/shared/src/index.ts`

Added nullable `seasonState` with:
- season
- chapter
- phase
- data confidence
- chase
- primary action
- sync

Legacy/mismatched route data returns `seasonState: null`.

### Week Simulator
Created:
- `apps/web/app/dev/week-simulator/page.tsx`
- `apps/web/lib/weekSimulator.ts`
- `apps/api/test/weekSimulator.test.ts`

Supported:
- all phases
- all four outcomes
- all confidence states
- chase progress
- Field Ops bonus
- Platform Sweep placeholder
- Nemesis participation
- Prediction participation

Known architecture issue in that version:
- web imported directly from `apps/api/src`
- web added a Webpack `extensionAlias` workaround

Needed correction:
- move environment-independent domain logic to a shared workspace package
- remove direct web-to-api source imports
- remove workaround if no longer needed

PR #3 was green at simulator commit:
`4ee462de6d2a031d22b8321cc272bfa30913db57`

## Large Claude Code Vertical-Slice Attempt

Claude Code then attempted the full Week 1 vertical slice and ran out of credits.

Its visible progress log showed it had:

- read all four authoritative docs
- audited branch and repo
- started Postgres and baseline tests
- added ritual copy to Season One config
- wired rituals into structural weeks and Week 1
- added deterministic primary-beat selector
- created migration `008` for Week 1 narrative schema, Field Ops definitions, and beats
- added Platform Sweep service
- added evidence service
- added chase-finalization service
- added late-sync reconciliation to `weekRollover.ts`
- extended the Beat Engine
- added Field Ops detector metrics to `bingo.ts`
- wired fixed Week 1 board and detector context into `bingoService.ts`
- extended detector context in `updateBingoCard`
- added ritual and evidence routes
- enriched `/api/weeks/current`
- extended rollover integration tests
- fixed test failures caused by new behavior
- reported tests green at that stage
- added new pure unit tests
- added Week 1 close integration tests
- added shared ritual overlay
- added Evidence Board component/page
- reworked production Map/home hierarchy
- updated Field Ops / Prediction / Nemesis copy
- added season context hook to Field Ops
- added rival-assignment and sudden-death treatment to Nemesis
- upgraded Week Simulator with production calculators
- **stopped while updating demo fixtures for the full Week 1 flow**

Resolved uncertainty:
Claude's large Week 1 vertical-slice work was preserved in commit `9f5a9ee`
and pushed to `origin/codex/week-one`. The remaining demo fixture/OpenAPI gap
was completed in commit `d714085`.

## Immediate Repository Check For A New Agent

The new assistant should still inspect the repository before doing anything,
but this is now a verification step, not a recovery mission.

Repository:
`lmorrow1210/SelenaChicagoStepChase`

PR:
`#3`

Branch:
`codex/week-one`

Determine:
- current PR head SHA, expected `d714085` or newer
- CI status
- whether the branch is clean
- whether PR #3 has review comments or failing checks

```bash
git status --short
git branch --show-current
git log --oneline --decorate -10
```

Do not reset, clean, switch branches, or merge PR #3 unless Lindsey explicitly
asks.

## Current Milestone

Complete and stabilize the full Week 1 Chicago vertical slice before starting Week 2.

### Backend/architecture
- shared package boundary
- no `apps/web -> apps/api/src` imports
- no workaround solely for cross-app imports
- minimum Week 1 schema
- ritual view state
- Platform Sweep
- chase finalization
- late-sync reconciliation
- final outcome persistence
- evidence persistence
- deterministic primary beats
- Week 1 Field Ops mapping
- enriched current-week API
- OpenAPI and generated types

### Production UI
- story-first Map/home
- Monday Briefing
- Midweek Update
- Final Push
- sudden death
- Case Closing
- all four Case Closed outcomes
- Evidence Board
- Detroit teaser
- Field Ops/Prediction/Nemesis narrative updates

### Simulator/demo
- simulator uses production components and shared production logic
- no duplicated business logic
- development-only
- static-export safe
- complete demo fixture states for Week 1

### Validation
- migration tests
- full API tests
- API typecheck
- web typecheck
- static demo build
- OpenAPI type sync
- design-token/raw-color check
- contrast audit
- available accessibility checks
- rollover idempotency
- late-sync reconciliation
- evidence unlocks
- Platform Sweep tiers
- all four outcome boundaries

## Week 1 Product Details

### Monday Briefing

Label:
`BUREAU FIELD BRIEFING`

Title:
`CASE 01: THE LAKEFRONT JOB`

Body:

At 4:18 AM, Selena Chicago entered a sealed infrastructure chamber beneath the city.

Eleven minutes later, a Meridian component was missing.

She was last seen moving toward the elevated lines. Your unit has been assigned to recover the component before she leaves Chicago.

Starting lead equals the group’s snapshotted weekly target.

Primary CTA:
`Begin the pursuit`

### Main chase hierarchy

1. Chicago / chapter title
2. Selena’s remaining lead
3. supporting progress transparency
4. one deterministic primary action
5. one primary narrative beat
6. compact team activity
7. Field Ops / Prediction / Nemesis cards
8. evidence preview
9. route/map context

### Platform Sweep

- Friday through Saturday
- group-time-zone aware
- 2,000 verified steps per eligible participant
- 40% = +1%
- 60% = +2%
- 80% = +3%
- maximum +3%
- no location tracking
- no simultaneous requirement

### Outcome thresholds

- `<0.70` = `trail_lost`
- `0.70–<0.90` = `pursuit_maintained`
- `0.90–<1.00` = `close_encounter`
- `>=1.00` = `interception`

### Outcome copy

#### Trail Lost
Headline: `TRAIL LOST`

Story:
The unit reached the elevated line after Selena’s signal disappeared. Surveillance could not confirm which route she took out of the city.

Selena:
“You searched the streets. You should have searched beneath them.”

#### Pursuit Maintained
Headline: `PURSUIT MAINTAINED`

Story:
The group confirmed Selena’s departure route and kept her within operational range. She left Chicago before the unit reached the platform.

Selena:
“You found the route. Not the reason.”

#### Close Encounter
Headline: `CLOSE ENCOUNTER`

Story:
The unit reached the correct platform moments after Selena’s train departed. A red glove was recovered beside the track.

Selena:
“Another platform. Another minute. That was the difference.”

#### Interception
Headline: `SELENA INTERCEPTED`

Story:
The group reached Selena before the train cleared the platform. For seventeen seconds, the pursuit was over.

The lights failed. When power returned, Selena was gone.

Selena:
“Someone opened the Chicago node before I did. Ask your Bureau why.”

### Evidence

Standard evidence:
`THE BRASS DIAL`

Unlocked for every finalized Week 1 outcome.

Intercept Clue:
`ACCESS BEFORE ENTRY`

Unlocked only for interception.

Clue body:
A surveillance photograph shows a credentialed Bureau figure entering the Chicago node before Selena arrived. The identity is obscured, but the timestamp is intact.

### Detroit teaser

Header:
`NEXT: DETROIT`

Body:
A manufacturing system dormant for decades has restarted without an operator. Its mechanical signature matches the dial recovered in Chicago.

Selena:
“Bring the dial. You will understand it when the machine starts.”

All four outcomes continue to Detroit.

## Data Confidence

Values:
- `verified`
- `estimated`
- `incomplete`
- `recalculating`

Rules:
- Selena performance commentary requires `verified`
- `estimated` may show cautious projections
- `incomplete` uses Bureau copy
- `recalculating` blocks final-result presentation
- trust beats override Selena

Possible current limitation:
Eligibility may still use current group members unless `week_participants` snapshots were added.

## Week Phases

- `briefing`
- `active`
- `midweek_update`
- `final_push`
- `sudden_death`
- `case_closing`
- `case_closed`

Phase logic must be centralized and timezone-aware.

## Chase Rules

Inputs:
- verified steps
- snapshotted target
- base progress
- Field Ops bonus
- Platform Sweep bonus
- Nemesis participation bonus
- Prediction participation bonus
- total non-step cap
- final progress
- remaining lead
- projected/final outcome

Caps:
- Field Ops 5%
- Platform Sweep 3%
- Nemesis 1%
- Prediction 1%
- total non-step 10%

Remaining lead may reach zero but never be negative.

Do not duplicate chase math in routes, React, rollover, cron, demo, or simulator.

## Beat Engine

Initial subset:

Ritual:
- Monday Briefing
- Midweek Update
- Final Push
- sudden death
- Case Closing
- Case Closed

Pursuit:
- team ahead
- team behind
- comeback

Field Ops:
- first line
- Platform Sweep started
- Platform Sweep completed

Trust:
- group data incomplete
- result recalculating
- tracker reconnected if supported

Priority:
1. trust
2. ritual
3. actionable pursuit
4. social/gameplay
5. ambient

One primary beat on the Map.

No generative AI.

## Completed In The Final Week 1 Cleanup

The following items were completed and verified on `codex/week-one`:

1. Shared-package architecture correction.
2. Full Week 1 demo fixtures, including `/api/evidence`.
3. OpenAPI update and regenerated web API types.
4. Migration replay on the clean test database.
5. Full API integration suite.
6. API and web typechecks.
7. Static GitHub Pages demo export.
8. Repository accessibility and policy checks.
9. Platform Sweep tiers.
10. Rollover idempotency.
11. Late-sync reconciliation.
12. Evidence unlock and deduplication.
13. All four final outcomes.
14. Production Map, ritual overlays, Case Closed report, Evidence Board, and
    simulator compiling against shared production logic.

Verification results from the finished branch:

```bash
TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" npm run test -w apps/api
# 153/153 passed

npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
npm run build -w apps/web
NEXT_OUTPUT=export NEXT_PUBLIC_DEMO=1 NEXT_PUBLIC_BASE_PATH=/SelenaChicagoStepChase NEXT_PUBLIC_API_URL=https://example.invalid npm run build -w apps/web
node scripts/contrast-audit.mjs
# 23/23 contrast pairs passed
```

## Actual Remaining Work

1. Review PR #3 and wait for CI.
2. Optional manual product smoke from the branch: `/map`, `/fieldops`,
   `/prediction`, `/nemesis`, `/evidence`, and `/dev/week-simulator`.
3. Merge PR #3 only if Lindsey explicitly asks.
4. After merge, confirm the GitHub Pages deployment shows the new Week 1 demo.
5. Owner-only: Health API sandbox smoke, Railway/Vercel deploys, physical-device
   QA, and final product calls around Saturday sudden-death and Selena costume
   versus the current palette.
6. Next agent-workable milestone after Week 1 merges: expand Weeks 2-13 from
   structural config into polished content using the Week 1 architecture.

## User Workflow Preference

The user felt the earlier micro-phased workflow was too slow.

Preferred workflow:
- larger bounded milestones
- autonomous implementation
- inspect actual GitHub diffs
- review only at major checkpoints
- return one of:
  - merge-ready
  - short correction list
  - one remaining milestone

Use GitHub as the source of truth.

## Recommended First Message in the New Chat

> Continue helping me with One Step Ahead. Use the attached handoff as authoritative context. First inspect `lmorrow1210/SelenaChicagoStepChase`, branch `codex/week-one`, and PR #3. Confirm the branch is at `d714085` or newer, check CI/review status, and tell me the safest next step for PR #3. Do not restart Week 1, do not start Week 2, and do not merge unless I explicitly ask.

## Week 1 Definition of Done

A nontechnical product owner can:

- open Chicago case
- read/reopen briefing
- see starting lead from group target
- see steps reduce lead
- see one primary action
- see one primary beat
- complete Field Ops
- complete first Field Ops line
- submit/inspect prediction
- view Nemesis matchup
- receive Midweek Update
- enter Final Push
- activate/complete Platform Sweep
- experience sudden death
- enter Case Closing
- view all four outcomes
- unlock The Brass Dial
- unlock Access Before Entry only on interception
- view Evidence Board
- see Detroit teaser
- experience incomplete/recalculating states
- use reduced motion
- navigate by keyboard
- reset/test states in simulator

Week 1 is not complete if:

- Chicago requires a custom one-off page
- calculations are duplicated
- UI outcome differs from API outcome
- stale data triggers Selena commentary
- rollover duplicates rewards/evidence
- outcomes lead to different next cities
- static export breaks
- web imports directly from API source
- future evidence leaks
- existing Field Ops, Prediction, or Nemesis systems were unnecessarily replaced
