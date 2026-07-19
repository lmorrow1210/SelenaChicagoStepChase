# Week 3 — Pittsburgh: Three Rivers, Two Trails

**Status:** READY FOR OWNER REVIEW — content is implemented in code and matches
this pack; final gate is owner sign-off on copy plus Codex's infra/test
validation pass on the Weeks 3–13 buildout.  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 3` in
`packages/shared/src/season-one/seasonOne.ts`. **Note:** this was authored in
bulk with Weeks 4–13 on the `codex/cities-buildout` branch (draft PR #6, not
yet merged), which retired the old `structuralWeek(3, ...)` stub. This pack has
been reconciled against that implementation — see the QA note and implementation
notes below.  
**Prerequisite:** Week 2 (Detroit) closes and hands off via the "second corridor in Pittsburgh" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"Three Rivers,
> Two Trails"* / complication *"Split Trail"* per
> [`../season-one-route.md`](../season-one-route.md). No parked lore — the
> "convergence" is the city's geography, not a network node.
>
> ✅ **2026-07-18 narrative QA pass:** reconciled this pack against the shipped
> `seasonOne.ts` Pittsburgh config (PR #6) — briefing, all four Case Closed
> outcomes (headline/story/Selena), evidence entries, and the Washington teaser
> match verbatim. Aligned the complication summary and added the Platform Sweep
> flavor line to match the shipped strings. **Fact-checked all five landmark
> fun facts** against primary sources (Cathedral of Learning = tallest
> educational building in the Western Hemisphere; Andy Warhol Museum = seven
> floors, largest single-artist museum in North America; Duquesne Incline =
> 1877 original wooden cable cars; Point State Park = Allegheny + Monongahela →
> Ohio; Roberto Clemente Bridge closes to cars on Pirates game days). Documented
> the "Split Trail" scope boundary, the shared-default Case Closing, and demo
> limitations below.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | Three Rivers, Two Trails |
| City | Pittsburgh |
| Complication | Split Trail |
| Complication summary | Two routes lead from the river bridge into Pittsburgh — the trail along the Monongahela and the incline up Mount Washington. Both reach the same place. Selena took one; the unit works both until her route is confirmed. |
| Selena's signature move this week | She uses the city's split geography so a pursuer can commit to the wrong trail |
| Next city | Washington, D.C. |

---

## Complication — Split Trail

**Label:** Split Trail  
**First line payoff:** The unit confirms which of the two trails Selena actually walked.  
**First movement payoff:** Your route rules out the incline — she stayed low, along the water.

> **Mechanic — ships as pure copy flavor (scope boundary).** The "two trails"
> are narrative framing only. The shipped `seasonOne.ts` Pittsburgh config uses
> the same shared 24 Field Ops detector codes and the standard Platform Sweep
> as every other week — there is **no route-choice UI, no presentation-swapping,
> and no divergent game state.** The earlier draft language about "the choice
> changes Field Ops presentation and the order intel unlocks" describes a
> feature that was intentionally **not** built (it would be a bespoke mechanic,
> barred by `season-scope.md`). The split trail lives entirely in the briefing,
> ritual copy, and outcome stories. Do not build route-choice logic to satisfy
> this pack.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 03: THREE RIVERS, TWO TRAILS

**Body (3 paragraphs):**

> At 5:12 AM, a freight signal on the Monongahela rail bridge switched from idle to active — no scheduled train, no operator on record. By the time a rail contact reached the control house, the switch had been reset by hand.
>
> Selena was seen crossing to the south bank on foot. Two routes lead from that bridge into the city: the river trail along the Mon, and the incline up Mount Washington. Both reach the same place. She took one. The Bureau does not know which.
>
> Your unit has been assigned to work both trails until her route is confirmed — before she reaches the Point, where the three rivers meet.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Complete operations to confirm which trail Selena walked into the city. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Pittsburgh, 5 slots)

The five most well-known Pittsburgh landmarks. Fun facts are the decode reward —
they ship `null` until unlocked (spoiler rule). **All five fun facts
fact-checked 2026-07-18** against primary/authoritative sources (see the QA note
in the header). Keep in sync with the DB `landmarks` seed and demo fixture —
migration 009 seeded a *different* placeholder Pittsburgh set (Duquesne Incline,
Roberto Clemente Bridge, Cathedral of Learning, Point State Park, Randyland), so
a landmark-sync migration is needed before these go live (flagged for Codex —
same class of fix as Detroit's migration 010).

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Duquesne Incline | Opened in 1877, the funicular still carries riders up Mount Washington in its original wooden cable cars for one of the country's best skyline views. |
| 2 | Cathedral of Learning | At 42 stories, this Gothic tower at the University of Pittsburgh is the tallest educational building in the Western Hemisphere. |
| 3 | Point State Park | It marks the spot where the Allegheny and Monongahela rivers join to form the Ohio — the origin of Pittsburgh's "Three Rivers" name. |
| 4 | The Andy Warhol Museum | The largest U.S. museum devoted to a single artist holds thousands of Warhol works across seven floors. |
| 5 | PNC Park | Fans reach the riverfront ballpark by walking the Roberto Clemente Bridge, which closes to cars on game days. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Pittsburgh — Three Rivers, Two Trails. A freight switch on the Monongahela bridge was thrown by hand before dawn. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "Two trails. You will pick one. I am counting on it."  
**CTA:** Open the briefing

> **Documented limitation (same as Chicago/Detroit).** The `monday_briefing`
> primary beat has no field for a Selena line, so the quote above is aspirational
> copy that the current system does not render. The headline/body ship
> (generated from `cityName` + `chapterTitle`). Adding a Monday-briefing Selena
> line would be a shared system change, out of MVP scope — documented, not
> implemented.

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The field reports have started to agree on which trail she walked. The other one is going quiet.  
**Selena:** "You committed to a trail. Brave. We will see whether it was the one I took." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. Both trails are converging on the Point. Field systems can still close the gap.  
**Selena (close encounter projected):** "You are close enough now that the two trails stop mattering." — S.C.  
**Selena (trail lost projected):** "You are still on the wrong bank. I can hear it from here." — S.C.

> **Shipped behavior.** `rituals.finalPush` carries a single `selena` line —
> the close-encounter one above is what ships (matching Chicago/Detroit). The
> Final Push beat prepends a `<OUTCOME> PROJECTED.` prefix generated from the
> live projection, so the projected-outcome distinction is conveyed by that
> prefix, not by a second Selena line. The "trail lost projected" line is
> retained here as design intent but is not currently rendered.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival picked different trails. One of you has been right all week. Today you find out which." — S.C.

---

### Platform Sweep flavor (special operation fiction)

**Fiction:** Bureau analysts have narrowed Selena's crossing to three river bridges. The unit must cover every span before she reaches the far bank.

> Ships as `rituals.specialOperationFiction`. Platform Sweep itself is the
> unchanged shared participation-threshold operation (Friday–Saturday,
> 2,000-verified-steps floor, same tiers as every week) — only the flavor
> sentence is Pittsburgh-specific.

---

### Case Closing (Sunday reconciliation window)

**Headline:** CASE CLOSING  
**Body:** Final field reports are being reconciled.  
**Supporting:** This may update the group's pursuit result, nemesis matchups, and Oracle award.

> **Intentional shared default.** Pittsburgh uses the generic Case Closing copy
> from `defaultRituals()`, matching `season-scope.md`'s principle ("four
> outcomes, mostly generic copy + one city closing line") and Chicago/Detroit.
> City flavor lives in the four outcome-specific stories and Selena lines below,
> not in the interim reconciliation screen.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit committed to the incline and worked it hard. Selena had taken the river trail — the low one, along the Mon — and reached the Point before the field reports could correct course.  
**Selena:** "Two trails join at the same place. You only needed to be on the right one when they did." — S.C.  
**Evidence body (basic):** A folded transit map recovered near the Monongahela rail bridge.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} worked both trails until the reports agreed, then followed the right one to the river's edge. Selena was ahead, but the unit never lost the bank.  
**Selena:** "You read the water before you read the map. That is the correct order." — S.C.  
**Evidence body (standard):** A layered map of Pittsburgh's rivers, freight lines, and buried water channels, with two trails traced to the same point.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} reached the Point twenty minutes behind her. A park contact confirmed she had stood at the fountain where the rivers meet, watching the far bank, before crossing north.  
**Selena:** "You made it to the confluence. I was still deciding which river to follow out. You nearly made the decision for me." — S.C.  
**Evidence body (enhanced):** A layered map of Pittsburgh's rivers, freight lines, and buried channels. Two separate trails are drawn in — and both end at the same mark at the Point.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} reached the fountain at the Point as Selena was folding a map into her coat. She let the operative see it — two trails, one destination — then walked into the crowd along the north shore and did not reappear.  
**Selena:** "You caught both trails at once. I did not think that was possible with the time you had. Note the feeling." — S.C.  
**Evidence body (intercept clue, enhanced):** The map, unfolded. A third line continues east past the rivers — drawn before the two Pittsburgh trails were ever walked.

---

## Evidence

**Standard evidence ID:** `week03_convergence_map`  
**Intercept clue ID:** `week03_eastern_line`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE CONVERGENCE MAP | THE EASTERN LINE |
| Basic body | A folded transit map recovered near the Monongahela rail bridge. | *(intercept clues only unlock on interception)* |
| Standard body | A layered map of Pittsburgh's rivers, freight lines, and buried water channels, with two trails traced to the same point. | A line on the map continues east past the rivers, hand-drawn, ending at a point in Washington. |
| Enhanced body | A layered map of Pittsburgh's rivers, freight lines, and buried channels. Two separate trails are drawn in — and both end at the same mark at the Point. | A line continues east to Washington. It was drawn before the two Pittsburgh trails were ever walked. |
| Highlighted fragment | "both end at the same mark at the Point" | "It was drawn before the two Pittsburgh trails were ever walked." |
| Icon key | map | route |

---

## Next-city teaser (Washington, D.C.)

**Header:** NEXT: WASHINGTON, D.C.  
**Body:** The eastern line ends at a records archive off the National Mall. A contact there flagged a reading-room request filed under a researcher credential that was deactivated years ago.  
**Selena:** "In Washington, the important documents are the ones with the most crossed out. I am going to read one anyway." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items (Pittsburgh-flavored) — classification

City-specific bingo concepts drafted for Week 3, each mapped to its nearest
shared detector code and classified per `IMPLEMENTING-A-CITY.md` Gotcha 2.
`bingo_challenge_definitions` stores one global `label` per `code` — there is
no per-city label-override column (same schema constraint documented for
Detroit). **Decision A is what's shipped:** Pittsburgh reuses Chicago's 24
shared `fixedChallengeCodes` verbatim (confirmed in the `seasonOne.ts`
Pittsburgh config). All eight concepts below classify as **label-only reuse of
an existing detector** — none need new detector logic; all are blocked only on
the not-yet-built label-override system:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `pittsburgh_before_noon` | Morning Climb: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `pittsburgh_full_shift` | Full Grade: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `pittsburgh_incline` | Incline Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `pittsburgh_long_bridge` | Long Bridge: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `pittsburgh_two_rivers` | Two Rivers: steps two days running | `steps_2k_two_days` | label-only reuse |
| `pittsburgh_partner_walk` | Cross a bridge with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `pittsburgh_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `pittsburgh_after_hours` | After-hours watch: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

None are self-reports beyond their underlying detector, future-optional content,
or unsuitable for MVP — all are straightforward relabels. **Limitation:** ship
with the shared generic labels (already done via Decision A); a per-city
label-override migration is future polish, not required for launch.

---

## Demo-state coverage (known limitation)

Same status as Detroit: `apps/web/lib/demo.ts` builds a full "active week"
fixture only for Chicago (week 1). There is no static-demo path that shows
Pittsburgh as the active week, its ritual states, or its four outcomes. Building
a Pittsburgh "current week" demo block + the `/dev/week-simulator` city selector
is infra follow-up, tracked for Codex — not a content gap (the copy already
exists in `seasonOne.ts`).

---

## Implementation notes

- ✅ Done (PR #6, `codex/cities-buildout`, not yet merged): `weekNumber: 3` is
  a full inline `SeasonWeekConfig` (not a `structuralWeek(3, ...)` stub);
  evidence entries `week03_convergence_map` and `week03_eastern_line` are in the
  `evidence` array; bingo uses Decision A (shared 24 codes); `WEEK_THREE_RITUALS`
  follows the Chicago/Detroit pattern. This pack was reconciled against that
  code on 2026-07-18 — copy matches verbatim except the two items aligned this
  pass (complication summary; Platform Sweep flavor line added to the pack).
- ⚠️ **Split Trail is copy-only** — there is no route-choice / presentation-swap
  feature and none should be built (see the mechanic note above). The shipped
  config uses the standard shared detectors and Platform Sweep.
- ⚠️ **DB landmark sync needed** — migration 009 seeded a placeholder Pittsburgh
  landmark set that doesn't match the five in this pack. Needs an additive
  sync migration before these go live (same fix Detroit got in migration 010).
  Left for Codex's infra pass.
- The eastern-line reference to Washington is flavor only. Week 4 does **not**
  resolve it as a plot thread. See `AGENTS.md` hard rule #6.
- Do not add Meridian references or "same node" convergence lore. The map
  converges because Pittsburgh's rivers converge — that is all it means.
- Not done in this pass (Codex / infra scope): landmark-sync migration, a
  Pittsburgh "active week" demo fixture + week-simulator selector, and test
  coverage for the Week 3 config/outcomes/evidence/teaser. This pass was
  narrative reconciliation of the pack against the shipped copy only.
