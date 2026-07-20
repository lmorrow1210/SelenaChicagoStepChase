# Week 11 — Santa Fe: True North

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 11` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(11, ...)` stub is retired)  
**Prerequisite:** Week 10 (Austin) closes and hands off via the "surveyed desert marker" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter **"True North"**
> (renamed from the lore-named "The Missing Meridian") / complication *"Alignment"*
> per [`../season-one-route.md`](../season-one-route.md). The Alignment Chart is a
> standalone artifact — **no** global-network / fourteenth-pulse lore.

> ⚠️ **Ships simplified.** The original "Alignment" idea granted bonuses from
> decoded *season evidence* — that evidence-arc dependency is cut
> (`season-scope.md`). This week ships an **engagement-based bonus using existing
> systems only** (Field Ops participation / the bonus systems already in the chase
> calculator). No evidence-arc input.

> ✅ **2026-07-18 narrative QA pass:** reconciled against the shipped
> `seasonOne.ts` config (Weeks 3–13 buildout, draft PR #6, not yet merged) —
> briefing, complication summary, all four Case Closed outcomes, evidence
> entries, Platform Sweep flavor, and the next-city teaser match verbatim.
> Landmark fun facts fact-checked (see below). Added the mechanic scope
> boundary, shared-default notes, and demo/limitation notes.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | True North |
| City | Santa Fe |
| Complication | Alignment |
| Complication summary | The Austin override traced to a surveyed marker in the New Mexico desert. This week the unit's combined engagement — everyone pulling in the same direction — grants an alignment bonus. It is about the team lining up, not about decoding anything. |
| Selena's signature move this week | She stands on the points that were only ever meant to be measured |
| Next city | Los Angeles |

---

## Complication — Alignment (ships simplified)

**Label:** Alignment  
**First line payoff:** The unit's first aligned day registers — everyone pulling the same direction.  
**First movement payoff:** Your contribution lines up with the team's; the alignment bonus grows.

> **Mechanic (ships as flavor + params on EXISTING systems):** an engagement-based
> bonus that grows as more of the team participates in the week's Field Ops — this
> reuses the existing bonus systems in the chase calculator (the same family as
> Field Ops / participation bonuses). **It does NOT read from any season-evidence
> board** — that dependency is cut. Do not wire this to evidence unlocks.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 11: TRUE NORTH

**Body (3 paragraphs):**

> The signal that overrode the Austin frequency came from a surveyed marker in the New Mexico desert — a point placed to be measured from, not broadcast from. Selena went to stand on it.
>
> Out here the trail isn't a route or a rhythm; it's an alignment. The old survey markers only mean something when they line up — and they only line up when enough people hold the same bearing at once.
>
> Your unit has been assigned to align: pull in the same direction, all week, and the bonus builds. Scatter, and the markers stay just points in the sand.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Line up with the team — combined engagement builds the alignment bonus this week. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Santa Fe, 5 slots)

The five most well-known Santa Fe landmarks. Fun facts are the decode reward —
they ship `null` until unlocked (spoiler rule). **All five fun facts fact-checked 2026-07-18** — Palace of the Governors (~1610, oldest continuously occupied public building in the US); Loretto Chapel spiral staircase; Cathedral Basilica of St. Francis (1886); Santa Fe Plaza (end of the Santa Fe Trail, heart of the city since the early 1600s); Georgia O'Keeffe Museum (world's largest collection of her work). **DB sync note:** migration 009 seeded a different placeholder set for this city; a landmark-sync migration is needed before this week goes live (flagged for Codex, same fix class as Detroit's migration 010).

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | The Palace of the Governors | Built around 1610, it is the oldest continuously occupied public building in the United States. |
| 2 | Loretto Chapel | Its spiral "miraculous staircase" makes two full turns with no visible central support and no nails. |
| 3 | Cathedral Basilica of St. Francis of Assisi | Completed in 1886, the honey-colored stone cathedral stands out from Santa Fe's low adobe skyline. |
| 4 | Santa Fe Plaza | The central plaza marked the end of the old Santa Fe Trail and has been the heart of the city since the early 1600s. |
| 5 | Georgia O'Keeffe Museum | It holds the world's largest collection of the artist's work, drawn to the New Mexico desert she painted for decades. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Santa Fe — True North. The trail out here is an alignment: the survey markers only mean something when the whole unit holds the same bearing. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "Alone, each of you is just a point in the sand. Line up and you become a direction."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. When the unit pulled together, the alignment bonus climbed. The days you scattered, the markers stayed just points.  
**Selena:** "You are learning to hold a bearing as a group. That is rarer out here than water." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. The alignment is nearly complete. A little more of the team, pulling the same way, finishes it.  
**Selena (close encounter projected):** "One more aligned day and you have the whole figure. Hold the bearing." — S.C.  
**Selena (trail lost projected):** "You are all walking, and none of it points anywhere together." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "The alignment was the team's work. This last measure is just you and your rival, holding your own line." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** Everyone walked, and no two of them walked the same direction. The survey markers never aligned, the bonus never built, and Selena stood on the point she came for and was gone before the unit found its bearing.  
**Selena:** "You were looking for an endpoint." — S.C.  
**Evidence body (basic):** A surveyor's chart recovered from a desert marker outside Santa Fe, dense with measured points.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} held a shared bearing through most of the week, and the alignment bonus built with it. Selena kept ahead, but the unit moved as one line instead of scattered points.  
**Selena:** "You held a direction together. That is the whole trick of this place." — S.C.  
**Evidence body (standard):** A survey chart plotting thirteen fixed points across the country — and a single geometric figure drawn to connect them.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} aligned almost perfectly and reached the desert marker twenty minutes behind her. A surveyor confirmed Selena had stood exactly on the point, checked it against the chart, and marked the last of the thirteen positions before walking west.  
**Selena:** "You lined up. Thirteen cities, one line drawn between them — and you were nearly standing on the end of it." — S.C.  
**Evidence body (enhanced):** A survey chart of thirteen surveyed points forming one clean figure. Twelve are marked complete. The thirteenth is circled and left open.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} held its bearing all week and reached the marker while Selena was still on it, chart in hand. She let the operative see the figure — thirteen points, twelve closed, one open — and said the open one was the only part that still mattered. Then a dust rise crossed the sun and the point was empty.  
**Selena:** "You aligned an entire unit for a week and stood on the same point I did. Almost no one keeps a bearing that long. Remember you did." — S.C.  
**Evidence body (intercept clue, enhanced):** One survey photograph in the set was altered — the marker in it never stood where the picture claims. The forgery traces to a film lab in Los Angeles.

---

## Evidence

**Standard evidence ID:** `week11_alignment_chart`  
**Intercept clue ID:** `week11_altered_plate`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE ALIGNMENT CHART | THE ALTERED PLATE |
| Basic body | A surveyor's chart recovered from a desert marker outside Santa Fe, dense with measured points. | *(intercept clues only unlock on interception)* |
| Standard body | A survey chart plotting thirteen fixed points across the country — and a single geometric figure drawn to connect them. | One survey photograph in the set was altered — the marker in it never existed. |
| Enhanced body | A survey chart of thirteen surveyed points forming one clean figure. Twelve are marked complete. The thirteenth is circled and left open. | One survey photo was altered — the marker never stood there. The forgery traces to a film lab in Los Angeles. |
| Highlighted fragment | "The thirteenth is circled and left open" | "The forgery traces to a film lab in Los Angeles." |
| Icon key | chart | survey |

---

## Next-city teaser (Los Angeles)

**Header:** NEXT: LOS ANGELES  
**Body:** One survey photograph in the set was forged — a marker that never stood where the picture claims. The doctoring traces to a film lab in Los Angeles.  
**Selena:** "Someone in Los Angeles is very good at making a place look real. I am going to find out what they were hiding behind it." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `santafe_before_noon` | Morning Survey: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `santafe_full_alignment` | Full Alignment: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `santafe_trail_run` | Trail Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `santafe_long_horizon` | Long Horizon: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `santafe_hold_the_line` | Hold the Line: steps two days running | `steps_2k_two_days` | label-only reuse |
| `santafe_partner_walk` | Walk Canyon Road with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `santafe_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `santafe_evening_walk` | Evening Walk: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 11`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **Alignment** (⚠️ simplified) — ships as engagement-based Platform Sweep flavor only; the evidence-arc "alignment" dependency from the old bible is **not** built.
- **Platform Sweep flavor (ships):** "The markers only align when enough of the unit holds the same bearing. Bureau analysts need the whole team pulling one direction." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- Next-city references in the teaser and intercept clue are **flavor only** — the following week does **not** resolve them into a conspiracy (`AGENTS.md` rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
