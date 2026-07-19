# Week 13 — San Francisco: One Step Ahead

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 13` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(13, ...)` stub is retired)  
**Prerequisite:** Week 12 (Los Angeles) closes and hands off via the "uncut frame — a bridge in fog" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"One Step
> Ahead"* / complication *"Final Convergence"* per
> [`../season-one-route.md`](../season-one-route.md).

> ⚠️ **Finale week, but NOT a special build.** Same weekly loop as every other
> week, with a larger combined target. Ships simplified: **no season-evidence
> input, no depth tiers, no Bureau-takeover reveal, no Season Two lore.** Selena
> escapes as she always does — that is the whole point of the title. See
> `season-scope.md`.

> ✅ **2026-07-18 narrative QA pass:** reconciled against the shipped
> `seasonOne.ts` config (Weeks 3–13 buildout, draft PR #6, not yet merged) —
> briefing, complication summary, all four Case Closed outcomes, evidence
> entries, Platform Sweep flavor, and the season-close card match verbatim.
> Landmark fun facts fact-checked (see below). Added the mechanic scope
> boundary, shared-default notes, and demo/limitation notes.
>
> ✅ **N6 resolved — finale softened (owner decision, 2026-07-18).** The owner
> chose no dramatic season-payoff ending. This pack now carries the softened
> copy: the "Your move." note and the "You were never chasing a thief. You were
> training to notice. Until the next city." reframe are removed from the
> close-encounter/interception evidence and the interception story. **This pack
> is now ahead of `seasonOne.ts`** — Codex applies the matching string changes
> on the `codex/cities-buildout` branch (exact old→new strings posted on PR #6).
> Until then, the code carries the pre-decision copy.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | One Step Ahead |
| City | San Francisco |
| Complication | Final Convergence |
| Complication summary | The season's last city. Everything the unit has learned converges on one larger target: steps, Field Ops, predictions, and nemesis results each contribute modestly to the week's combined goal. No new tricks — just the whole game at once. |
| Selena's signature move this week | She stays exactly one step ahead, the way she has all season |
| Next city | — (season close) |

---

## Complication — Final Convergence (ships simplified)

**Label:** Final Convergence  
**First line payoff:** The unit's first contribution across all four systems lands on the combined target.  
**First movement payoff:** Your steps, ops, prediction, and nemesis result all count toward one goal now.

> **Mechanic (ships as flavor + params on EXISTING systems):** steps, Field Ops,
> predictions, and nemesis results each contribute **modestly** to a single larger
> combined target for the week. This reuses the existing chase calculator and
> bonus systems — just a bigger target and all inputs on at once. **No
> season-evidence input. No depth tiers.** Do not build a special finale system.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 13: ONE STEP AHEAD

**Body (3 paragraphs):**

> The one frame the Los Angeles lab never edited showed a bridge in fog — San Francisco — stamped with a time after the record claimed the chase was over. Selena came here to walk into an ending someone else already tried to write for her.
>
> This is the last city. There are no new tricks left, only everything you have learned since Chicago: steps, field work, predictions, and the daily duel, all converging on one target at once.
>
> Your unit has been assigned to close the distance one final time. She has stayed one step ahead for thirteen weeks. Find out what happens when you stop chasing the version of her you were shown and chase the real one.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Every system counts this week — Field Ops feed the season's final combined target. |
| prediction | PREDICTION | Your call contributes to the finale target. Make it count. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (San Francisco, 5 slots)

The five most well-known San Francisco landmarks. Fun facts are the decode reward
— they ship `null` until unlocked (spoiler rule). **All five fun facts fact-checked 2026-07-18** — Golden Gate Bridge ("International Orange" for fog visibility); Alcatraz (former "inescapable" prison, now a ferry-access national park); Fisherman's Wharf (sea lions, sourdough, Pier 39); Lombard Street ("crookedest street," eight switchbacks); SF Cable Cars (last manually operated cable-car system in the world). **DB sync note:** migration 009 seeded a different placeholder set for this city; a landmark-sync migration is needed before this week goes live (flagged for Codex, same fix class as Detroit's migration 010).

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Golden Gate Bridge | Its "International Orange" color was chosen to keep the bridge visible in the Bay's heavy fog; repainting it is a never-ending job. |
| 2 | Alcatraz Island | The former island prison, once considered inescapable, is now a national park reached only by ferry. |
| 3 | Fisherman's Wharf | The waterfront district is known for its sea lions, sourdough, and Dungeness crab stands along Pier 39. |
| 4 | Lombard Street | One block is famous as the "crookedest street," with eight sharp switchbacks built to tame a steep hill. |
| 5 | San Francisco Cable Cars | The city's cable cars are the last manually operated cable car system in the world — a moving national landmark. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** San Francisco — One Step Ahead. The last city. Everything you've learned since Chicago converges on one target this week. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "Thirteen cities. You have gotten better. So have I. Let us see how this ends."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. Steps, ops, predictions, the duel — all of it is feeding the same target now, and the unit is closing on it from every side.  
**Selena:** "You are using everything at once. That is what the whole season was for. I can feel it behind me." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain in the season. The combined target is within reach. Every system you have counts now.  
**Selena (close encounter projected):** "One more push and you are level with me at the water's edge. Thirteen weeks for this. Do not stop now." — S.C.  
**Selena (trail lost projected):** "Even now, at the end, I am a step ahead. It is almost poetic." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. The season's last duel comes down to Saturday.  
**Selena:** "The last day of the last city, and you and your rival are still tied. I could not have written it better." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit brought everything to the last city and still came up short of the water. Selena crossed the bridge into the fog while the combined target sat unfinished — one step ahead at the end, the way she had been at the start.  
**Selena:** "You reached the platform too late — but not too late to understand it." — S.C.  
**Evidence body (basic):** A slim case file recovered at the north end of the Golden Gate Bridge — the last page of the season's pursuit.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} brought every system to bear and closed most of the combined target, holding Selena in sight all the way to the coast. She reached the bridge first — but only just, and she knew it.  
**Selena:** "You used the whole season at once and nearly caught me with it. Nearly." — S.C.  
**Evidence body (standard):** A record of the entire chase, city by city, closed out in a single hand. The last line is left blank.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} finished nearly all of the combined target and reached the bridge as the fog came in. A toll worker confirmed Selena had stood at the rail, looking back the way she'd come, until the unit was almost on her — then walked into the white and was gone.  
**Selena:** "You came this far chasing me. Ask what else you found on the way." — S.C.  
**Evidence body (enhanced):** A record of the whole pursuit — thirteen cities, closed in one hand. The final entry is dated, initialed, and left otherwise blank.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} completed the combined target and reached the middle of the bridge as Selena did. For a moment there was no distance left at all. She looked at the unit — really looked — set the case file on the rail, and nodded once, the way one professional acknowledges another. Then the fog closed between one step and the next, and the rail was empty. One step ahead. Always.  
**Selena:** "You caught me at the edge of the country, using everything you learned to get here. No one has ever done that. Whatever comes next, you are ready for it." — S.C.  
**Evidence body (intercept clue, enhanced):** A folded note left with the file: "You kept pace with me for thirteen cities. No one else ever has. Rest well. — S.C."

---

## Evidence

**Standard evidence ID:** `week13_final_record`  
**Intercept clue ID:** `week13_last_note`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE FINAL RECORD | THE LAST NOTE |
| Basic body | A slim case file recovered at the north end of the Golden Gate Bridge — the last page of the season's pursuit. | *(intercept clues only unlock on interception)* |
| Standard body | A record of the entire chase, city by city, closed out in a single hand. The last line is left blank. | A folded note left with the file, addressed to the unit by its call sign. |
| Enhanced body | A record of the whole pursuit — thirteen cities, closed in one hand. The final entry is dated, initialed, and left otherwise blank. | A folded note: "You kept pace with me for thirteen cities. No one else ever has. Rest well. — S.C." |
| Highlighted fragment | "dated, initialed, and left otherwise blank" | "You kept pace with me for thirteen cities. No one else ever has." |
| Icon key | file | note |

---

## Season close (no next-city teaser)

Week 13 has no next city. Instead of a teaser, the case-closed hands off to a
season-close card.

**Header:** SEASON ONE COMPLETE  
**Body:** The pursuit reached the coast. Thirteen cities, one season, one villain who stayed a step ahead to the end. The file is closed — for now.  
**Selena:** "You made it to the water. That is farther than anyone before you. Rest. The next city can wait." — S.C.  
**CTA:** Review the season

> **Scope note:** the season close must **not** promise a decrypted Season Two
> location, a Meridian reveal, or a Bureau-conspiracy payoff. "The next city can
> wait" is an open, optional flavor beat — not a plot hook that obligates future
> lore. See `season-scope.md` and `PARKED-LORE.md`.

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `sanfrancisco_before_noon` | Morning Fog: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `sanfrancisco_full_crossing` | Full Crossing: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `sanfrancisco_hill_run` | Hill Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `sanfrancisco_long_bridge` | Long Bridge: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `sanfrancisco_cable_line` | Cable Line: steps two days running | `steps_2k_two_days` | label-only reuse |
| `sanfrancisco_partner_walk` | Cross the bridge with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `sanfrancisco_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `sanfrancisco_evening_fog` | Evening Fog: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 13`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **Final Convergence** (⚠️ simplified) — ships as Platform Sweep flavor that thematically references every system; there is **no** combined-target engine, no depth tiers, and no season-evidence input. Standard weekly loop.
- **Platform Sweep flavor (ships):** "The season's last target takes every system at once. Bureau analysts need the whole unit — steps, ops, predictions, and the duel — converging before Sunday." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- This is the **season finale** — `nextCityTeaser` is empty (no next city). The recovered file / closing note is standalone flavor; it does **not** resolve a cross-week arc (rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
