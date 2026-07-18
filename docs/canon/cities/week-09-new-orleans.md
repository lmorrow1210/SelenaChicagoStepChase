# Week 9 — New Orleans: The Second Line

**Status:** DRAFT — awaiting owner review of copy  
**Implements:** `structuralWeek(9, ...)` in `packages/shared/src/season-one/seasonOne.ts`  
**Prerequisite:** Week 8 (Savannah) closes and hands off via the "kept in a New Orleans song" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"The Second
> Line"* / complication *"Changing Rhythm"* per
> [`../season-one-route.md`](../season-one-route.md). The Rhythmic Key is a
> standalone artifact — **no** encoded-in-living-practice network lore.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | The Second Line |
| City | New Orleans |
| Complication | Changing Rhythm |
| Complication summary | Selena's trail through New Orleans is kept as a rhythm, not a route. Daily targets shift slightly based on how the unit did the day before — steady participation and recovery matter more than one enormous day. |
| Selena's signature move this week | She moves to a changing tempo that punishes pursuers who only sprint |
| Next city | Austin |

---

## Complication — Changing Rhythm

**Label:** Changing Rhythm  
**First line payoff:** The unit finds the tempo — the trail reads only when you keep time.  
**First movement payoff:** Your steady day matters more than your biggest day this week.

> **Mechanic (ships as flavor + params on existing systems):** daily targets vary
> slightly based on prior-day performance, so consistency and recovery outweigh a
> single huge day. This reuses existing daily-target and streak/recovery systems
> with a mild day-to-day adjustment — no new mechanic. Keep adjustments small and
> **transparent** (trust rule): the player always sees the day's target.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 09: THE SECOND LINE

**Body (3 paragraphs):**

> The route past Savannah's missing square was never written down — it was kept in a New Orleans song. Here, Selena's trail is carried the same way: as a rhythm passed along a second line, not a path drawn on a map.
>
> A rhythm has to be kept. Rush it and it falls apart; drop out for a day and you lose the measure. The Bureau's usual approach — one operative walking enormous distances — does not read this trail at all.
>
> Your unit has been assigned to keep time. Steady participation across the week, and recovery after a hard day, will surface the route. One giant push will not.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Keep a steady tempo — consistency across the week reveals the trail, not one huge day. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (New Orleans, 5 slots)

The five most well-known New Orleans landmarks. Fun facts are the decode reward —
they ship `null` until unlocked (spoiler rule). Keep in sync with the demo
fixture when Week 9 is implemented.

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | St. Louis Cathedral | Facing Jackson Square, it is the oldest continuously operating cathedral in the United States, rebuilt in its current form in 1850. |
| 2 | Bourbon Street | The French Quarter's best-known street was laid out in 1721 and named for France's ruling royal family, not the whiskey. |
| 3 | Café du Monde | Open since 1862, the original French Market stand serves chicory coffee and beignets around the clock. |
| 4 | Preservation Hall | The bare French Quarter hall has presented traditional New Orleans jazz nightly since 1961 — no drinks, no amplification. |
| 5 | St. Charles Streetcar | The oldest continuously operating streetcar line in the world has run along St. Charles Avenue since 1835. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** New Orleans — The Second Line. Selena's trail here is a rhythm, not a route. Keep time and it reveals itself. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "This trail is kept in a beat. Sprint it and you will lose the measure entirely."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The unit that kept a steady tempo is well into the route. The days someone tried to make up the whole week at once barely moved it.  
**Selena:** "You are keeping time. That is harder than going fast, and it is the only thing that reads here." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. The rhythm is nearly complete. Two more measures kept in time will close it.  
**Selena (close encounter projected):** "Hold the tempo two more days and you are even with me. Do not rush the ending." — S.C.  
**Selena (trail lost projected):** "You keep counting steps and missing the beat between them." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival both kept the rhythm all week. Today is the one measure where only volume counts." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit posted one enormous day and coasted the rest. A rhythm doesn't read that way — it fell apart between the big days, and Selena kept moving down a trail carried in a beat the unit never found.  
**Selena:** "You counted the steps and missed the rhythm." — S.C.  
**Evidence body (basic):** A folded sheet of rhythmic notation recovered near Jackson Square — intervals, no melody.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} kept a steady tempo through the week — recovering after the hard days instead of vanishing — and read most of the rhythm. Selena stayed ahead, but the unit never lost the measure.  
**Selena:** "You held the tempo. New Orleans notices who can keep time." — S.C.  
**Evidence body (standard):** A key written as a rhythm rather than a route: a sequence of intervals and rests that only reads correctly in time.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} kept the rhythm almost perfectly and reached the parade route twenty minutes behind her. A musician confirmed Selena had walked the second line end to end, in step, before slipping off at a cross street.  
**Selena:** "You kept the measure the whole way through. This city rewards participation, not obedience — and you participated." — S.C.  
**Evidence body (enhanced):** A key written entirely in rhythm. Played too fast or too slow it means nothing — it only resolves at the pace of a second line.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} kept perfect time all week and caught the second line at its turn — Selena among the dancers, in step, unhurried. She smiled at being found in a crowd that was all motion, tapped the rhythm on the operative's arm once, and let the parade close around her.  
**Selena:** "You kept time with a whole city for a week and still found me inside it. That is not luck. Remember that." — S.C.  
**Evidence body (intercept clue, enhanced):** The last interval in the sequence is a rest with no end — it points to a frequency in Austin that stopped transmitting.

---

## Evidence

**Standard evidence ID:** `week09_rhythmic_key`  
**Intercept clue ID:** `week09_dead_interval`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE RHYTHMIC KEY | THE DEAD INTERVAL |
| Basic body | A folded sheet of rhythmic notation recovered near Jackson Square — intervals, no melody. | *(intercept clues only unlock on interception)* |
| Standard body | A key written as a rhythm rather than a route: a sequence of intervals and rests that only reads correctly in time. | The sequence ends on a rest with no end — it points to a radio frequency in Austin. |
| Enhanced body | A key written entirely in rhythm. Played too fast or too slow it means nothing — it only resolves at the pace of a second line. | The last interval is a rest with no end — it points to a frequency in Austin that stopped transmitting. |
| Highlighted fragment | "it only resolves at the pace of a second line" | "a frequency in Austin that stopped transmitting" |
| Icon key | rhythm | key |

---

## Next-city teaser (Austin)

**Header:** NEXT: AUSTIN  
**Body:** The rhythm's final interval is an open rest — it points to a radio frequency in Austin that went silent mid-broadcast. No one has transmitted on it since.  
**Selena:** "There is a frequency in Austin that stopped mid-sentence. I want to know who was talking, and why they stopped." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items (New Orleans-flavored)

City-specific bingo card entries. These replace generic entries for Week 9.

| Code | Label | Type |
|---|---|---|
| `neworleans_before_noon` | Morning Second Line: 1,000 steps before noon | movement |
| `neworleans_full_measure` | Full Measure: hit 100% of daily target | movement |
| `neworleans_parade_run` | Parade Run: 5,000 steps in a day | movement |
| `neworleans_long_avenue` | Long Avenue: 10,000 steps in a day | movement |
| `neworleans_keep_time` | Keep Time: steps two days running | streak |
| `neworleans_partner_walk` | Second-line with someone — friend, family, or pet | social |
| `neworleans_eyes_up` | Notice something on your route you have not seen before | awareness |
| `neworleans_night_set` | Night Set: 1,000 steps after 6 PM | movement |

---

## Implementation notes for Codex

- Replace `structuralWeek(9, "New Orleans", ...)` in `seasonOne.ts` with a full
  inline config object modeled on the Week 1 Chicago block.
- Evidence IDs `week09_rhythmic_key` and `week09_dead_interval` go into the
  `evidence` array in `SEASON_ONE_CONFIG`.
- "Changing Rhythm" adjusts daily targets slightly by prior-day performance using
  existing daily-target/streak systems. **Keep the adjustment small and always
  show the player the current target** (trust rule — no hidden math). Confirm the
  daily-target pipeline supports a per-day modifier before wiring.
- The Austin frequency reference is flavor for Week 10's "Dead Air." It resolves
  nothing.
- The Rhythmic Key is a standalone rhythm cipher. Do **not** frame it as a node
  encoded in living cultural practice to evade a database — that is parked lore.
  Rule #6.
