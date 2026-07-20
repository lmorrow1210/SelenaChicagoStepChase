# Week 2 — Detroit: The Machine Restarted

**Status:** READY FOR OWNER REVIEW — content matches shipped code; final gate is
owner sign-off on copy plus Codex's infra/test validation pass.  
**Implements:** the full inline `SeasonWeekConfig` at `SEASON_ONE_CONFIG.route[1]`
in `packages/shared/src/season-one/seasonOne.ts` (already shipped, not a
`structuralWeek(2, ...)` stub).  
**Prerequisite:** Week 1 (Chicago) closes and hands off via the "machine restarted" teaser.

> ✅ **Naming resolved (2026-07-17):** chapter *"The Machine Restarted"* /
> complication *"Assembly Line"* (matches shipped `seasonOne.ts` and the route
> table). Landmarks resolved to the five most well-known Detroit sites, synced
> with the demo fixture.
>
> ✅ **2026-07-18 narrative QA pass:** confirmed briefing, ritual copy, all
> four Case Closed outcomes, and evidence text match `seasonOne.ts` verbatim.
> Fixed a data bug where the production `landmarks` table (migration 009) still
> had a placeholder Detroit set instead of the five approved here — see
> migration `010_detroit_landmarks_sync.sql`. Synced `season-one-route.md`'s
> stale "naming unresolved" footnote and two-line closing-quote table, which
> both predated this pack's full four-outcome buildout.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | The Machine Restarted |
| City | Detroit |
| Complication | Assembly Line |
| Complication summary | Selena is moving through Detroit's old manufacturing infrastructure — long corridors, loading bays, and freight routes the city grid doesn't show. The unit starts cold before the first field operative logs movement. |
| Selena's signature move this week | She routes through industrial corridors that don't appear on standard maps |
| Next city | Pittsburgh |

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 02: THE MACHINE RESTARTED

**Body (3 paragraphs):**

> At 6:40 AM, a decommissioned stamping plant in the Milwaukee Junction district powered on without authorization. Security footage shows the facility operating under its own systems for eleven minutes before the grid cut out.
>
> Selena was identified leaving the building via a service corridor that runs beneath Woodward Avenue. She was carrying something. The footage did not capture what.
>
> Your unit has been assigned to track her through Detroit's industrial infrastructure before she reaches the Michigan Central corridor.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Complete operations to uncover Selena's route through Detroit's industrial grid. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Complication — Assembly Line

**Label:** Assembly Line  
**First line payoff:** The unit identifies which corridor Selena used to leave the plant.  
**First movement payoff:** Your route confirms Selena is moving along the old freight line, not the street grid.

---

## Field Ops — Intel landmarks (Detroit, 5 slots)

These are the five city intel tiles that unlock as the group earns scout tokens.
Fun facts are the decode reward — they ship `null` until unlocked (spoiler rule).

The five most well-known Detroit landmarks (owner decision, 2026-07-17). These
match the shipped demo fixture (`apps/web/lib/demo.ts` `DETROIT_LANDMARKS`)
exactly — keep them in sync.

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Michigan Central Station | Abandoned for nearly thirty years, it reopened in 2024 after a landmark restoration led by Ford. |
| 2 | Detroit Institute of Arts | Diego Rivera's Detroit Industry Murals wrap an entire courtyard with scenes of the auto assembly line. |
| 3 | Guardian Building | Its Art Deco lobby, tiled in Pewabic pottery, earned it the nickname 'Cathedral of Finance.' |
| 4 | Motown Museum | The Motown sound was recorded in the converted house that Berry Gordy called Hitsville U.S.A. |
| 5 | Renaissance Center | The riverfront towers of GM's headquarters are the tallest in Michigan and define Detroit's skyline. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Detroit — The Machine Restarted. Something powered on in Milwaukee Junction that shouldn't have. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "You are already behind. That is not new."  
**CTA:** Open the briefing

> **Documented limitation.** `WeekRitualCopy` has no per-week Monday-briefing
> Selena-line field, and the `monday_briefing` primary beat in
> `primaryBeat.ts` never attaches a `selena` line — Chicago doesn't have one
> either. The headline/body above ship (generated from `cityName` +
> `chapterTitle`); the Selena quote is aspirational copy this pack drafted but
> the system doesn't currently render anywhere. Adding a field for it would be
> a new system, out of MVP scope — leaving as documented, not implemented.

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. Selena has moved from the plant district to the freight corridor near the river. Field Ops reports are coming in.  
**Selena:** "Halfway through the week and you are still reading the grid wrong. Try the one beneath it." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. She is somewhere in the Michigan Central corridor. Field systems can still close the gap.  
**Selena (close encounter projected):** "You are close enough that I have started checking the platform twice." — S.C.  
**Selena (trail lost projected):** "At this distance, I can afford to be patient." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "Your nemesis has the same idea you do. One of you is wrong about which route to take." — S.C.

---

### Case Closing (Sunday reconciliation window)

**Headline:** CASE CLOSING  
**Body:** Final field reports are being reconciled.  
**Supporting:** This may update the group's pursuit result, nemesis matchups, and Oracle award.

> **Intentional shared default.** Detroit uses the same generic Case Closing
> copy as Chicago (`defaultRituals()` in `seasonOne.ts`) rather than a
> Detroit-specific override. This matches the documented design principle in
> `season-scope.md` ("Case Closed report — four outcomes, mostly generic copy
> + one city closing line") — city flavor lives in the four outcome-specific
> Selena lines below, not in the interim reconciliation screen. Chicago itself
> has no city-specific Case Closing override either, so this is consistent
> with the reference implementation, not a gap.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit covered ground but not the right ground. Selena used the service tunnels beneath the Woodward corridor — routes that don't appear on the Bureau's maps — and was two hours ahead before the first field report came in.  
**Selena:** "Detroit has an underground grid. Most people do not know it exists. Now you do." — S.C.  
**Evidence body (basic):** A worn routing diagram recovered near the freight entrance of the Milwaukee Junction plant.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} tracked Selena through the industrial district and confirmed her departure route before she cleared the city. She was moving, but the unit kept pace.  
**Selena:** "You read the freight lines. That is more than the Bureau managed." — S.C.  
**Evidence body (standard):** A worn routing diagram showing hand-marked revisions to Detroit's original industrial corridor layout.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} reached the Michigan Central corridor ninety minutes after Selena. A Bureau contact confirmed she had been in the main hall — watching the windows — before departing north.  
**Selena:** "You found the station. I was watching from the upper level. Another few hours and that would have been a different kind of conversation." — S.C.  
**Evidence body (enhanced):** A worn routing diagram with hand-marked revisions. One corridor is circled and dated in a different ink — three weeks before the plant powered on.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} reached the Michigan Central main hall as Selena was crossing the platform. She did not run. She waited just long enough to look at the diagram in the operative's hand, then stepped through a service door that shouldn't have opened.  
**Selena:** "You found it. I expected that would take another week. Adjust your estimate of yourself accordingly." — S.C.  
**Evidence body (intercept clue, enhanced):** The routing diagram, now confirmed as a schematic. A second corridor is marked — in Pittsburgh.

---

## Evidence

**Standard evidence ID:** `week02_routing_diagram`  
**Intercept clue ID:** `week02_pittsburgh_corridor`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE ROUTING DIAGRAM | SECOND CORRIDOR |
| Basic body | A worn routing diagram recovered near the freight entrance of the Milwaukee Junction plant. | *(intercept clues only unlock on interception)* |
| Standard body | A worn routing diagram showing hand-marked revisions to Detroit's original industrial corridor layout. | A routing diagram with a second corridor marked in Pittsburgh — in different ink, added later. |
| Enhanced body | A worn routing diagram with hand-marked revisions. One corridor is circled and dated in a different ink — three weeks before the plant powered on. | A routing diagram with a second corridor marked in Pittsburgh. The handwriting matches nothing in the Bureau's records. |
| Highlighted fragment | "one corridor is circled and dated in a different ink" | "The handwriting matches nothing in the Bureau's records." |
| Icon key | diagram | corridor |

---

## Next-city teaser (Pittsburgh)

**Header:** NEXT: PITTSBURGH  
**Body:** The corridor in the diagram leads to a freight bridge above the Monongahela. A rail contact in Pittsburgh confirmed activity at the south end — three days ago.  
**Selena:** "Steel cities have long memories. The question is whether you know how to read them." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items (Detroit-flavored) — classification

City-specific bingo concepts drafted for Week 2, each mapped to its nearest
shared detector code and classified per `IMPLEMENTING-A-CITY.md` Gotcha 2.
`bingo_challenge_definitions` stores one global `label` per `code` — there is
no per-city label-override column in the schema (confirmed against migrations
002–008), so none of these can render their Detroit-flavored label without a
new migration + override mechanism. **Decision A is what's shipped:** Detroit
reuses Chicago's 24 shared `fixedChallengeCodes` verbatim (see `seasonOne.ts`
comment "Decision A (2026-07-17)"). All eight concepts below classify as
**label-only reuse of an existing detector** — none require new detector
logic, and none are blocked on anything but the not-yet-built label-override
system:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `detroit_before_noon` | Morning Shift: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `detroit_full_shift` | Full Shift: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `detroit_assembly_run` | Assembly Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `detroit_long_haul` | Long Haul: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `detroit_freight_walk` | Freight Route: steps two days running | `steps_2k_two_days` | label-only reuse |
| `detroit_partner_walk` | Walk the line with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `detroit_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `detroit_after_hours` | After-hours watch: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

None of the eight are safe self-reports beyond what their underlying detector
already is, future-optional content, or unsuitable for MVP — they're all
straightforward relabels. **Limitation, documented per instructions:** ship
with the shared generic labels (already done); a per-city label-override
migration is future polish, not required for Detroit to be launch-ready.

---

## Demo-state coverage (known limitation)

`apps/web/lib/demo.ts` builds a full "active week" fixture (`seasonState`,
`chase`, `primaryAction`, `primaryBeat`, `platformSweep`, `evidencePreview`)
only for **Chicago as week 1**. Detroit currently appears in the static demo
only as: the `nextCity` on the Chicago `/api/weeks/current` fixture, the
`reconCity` for Field Ops scouting intel (3 of 5 landmarks unlocked), and a
locked slot on the evidence board. There is no static-demo path that shows
Detroit as the *active* week, its midweek/final-push/sudden-death ritual
states, or any of its four Case Closed outcomes — a visitor can only reach
Detroit narrative content by scouting ahead from Chicago.

This is an infra/fixture gap, not a content gap — the copy this pack needs
already exists in full in `seasonOne.ts`. Building a second full demo
"current week" block (modeled on the Chicago one, per
`IMPLEMENTING-A-CITY.md`'s "Optional — demo fixture" section) plus the
`/dev/week-simulator` city selector needed to preview it are left for a
follow-up infra pass. Documented here rather than implemented in this pass.

---

## Implementation notes

- ✅ Done (prior to this pass): `SEASON_ONE_CONFIG.route[1]` is the full
  inline Detroit config (not a `structuralWeek(2, ...)` stub); evidence IDs
  `week02_routing_diagram` and `week02_pittsburgh_corridor` are in the
  `evidence` array; bingo uses Decision A (shared 24 codes).
- ✅ Done (this pass): fixed the Detroit `landmarks` DB rows (migration 009
  seeded a placeholder set that never got synced to the approved five) via
  additive migration `010_detroit_landmarks_sync.sql`; synced the stale
  "naming unresolved" footnote and the pre-buildout two-line closing-quote
  table in `season-one-route.md`.
- The intercept clue's Pittsburgh reference is flavor only — it does not
  obligate any lore in Week 3. Pittsburgh's chapter can reference steel and
  bridges without resolving the "second corridor" as a plot thread.
- Do not add Meridian references. Do not escalate the evidence into a
  cross-week mystery arc. See `AGENTS.md` hard rule #6.
- Not done in this pass (left for Codex — infra/testing scope): a Detroit
  "active week" demo fixture and week-simulator city selector (see
  "Demo-state coverage" above); `weekOneClose.integration.test.ts` and other
  suites were not modified — my edits (docs + the landmarks migration) don't
  change any config shape or copy string those tests assert on, but a fresh
  test run against the new migration hasn't been performed in this pass.
