# Week 3 — Pittsburgh: Three Rivers, Two Trails

**Status:** DRAFT — awaiting owner review of copy  
**Implements:** `structuralWeek(3, ...)` in `packages/shared/src/season-one/seasonOne.ts`  
**Prerequisite:** Week 2 (Detroit) closes and hands off via the "second corridor in Pittsburgh" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"Three Rivers,
> Two Trails"* / complication *"Split Trail"* per
> [`../season-one-route.md`](../season-one-route.md). No parked lore — the
> "convergence" is the city's geography, not a network node.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | Three Rivers, Two Trails |
| City | Pittsburgh |
| Complication | Split Trail |
| Complication summary | Selena crosses into the city on foot, and two routes lead from the river bridge into Pittsburgh — the trail along the Monongahela and the incline up Mount Washington. Both reach the same place. She took one. The unit works both until her route is confirmed. |
| Selena's signature move this week | She uses the city's split geography so a pursuer can commit to the wrong trail |
| Next city | Washington, D.C. |

---

## Complication — Split Trail

**Label:** Split Trail  
**First line payoff:** The unit confirms which of the two trails Selena actually walked.  
**First movement payoff:** Your route rules out the incline — she stayed low, along the water.

> **Mechanic (ships as flavor + params on existing systems):** the group is
> presented with two route options; the choice changes Field Ops *presentation*
> and the order intel unlocks, but both trails converge — there is **no permanent
> branch** and no divergent game state. Same underlying detectors as any week.

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
they ship `null` until unlocked (spoiler rule). Keep in sync with the demo
fixture when Week 3 is implemented.

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

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival picked different trails. One of you has been right all week. Today you find out which." — S.C.

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

## Bingo items (Pittsburgh-flavored)

City-specific bingo card entries. These replace generic entries for Week 3.

| Code | Label | Type |
|---|---|---|
| `pittsburgh_before_noon` | Morning Climb: 1,000 steps before noon | movement |
| `pittsburgh_full_shift` | Full Grade: hit 100% of daily target | movement |
| `pittsburgh_incline` | Incline Run: 5,000 steps in a day | movement |
| `pittsburgh_long_bridge` | Long Bridge: 10,000 steps in a day | movement |
| `pittsburgh_two_rivers` | Two Rivers: steps two days running | streak |
| `pittsburgh_partner_walk` | Cross a bridge with someone — friend, family, or pet | social |
| `pittsburgh_eyes_up` | Notice something on your route you have not seen before | awareness |
| `pittsburgh_after_hours` | After-hours watch: 1,000 steps after 6 PM | movement |

---

## Implementation notes for Codex

- Replace `structuralWeek(3, "Pittsburgh", ...)` in `seasonOne.ts` with a full
  inline config object modeled on the Week 1 Chicago block.
- Evidence IDs `week03_convergence_map` and `week03_eastern_line` go into the
  `evidence` array in `SEASON_ONE_CONFIG`.
- The "Split Trail" mechanic must not create a persistent branch in game state —
  it is presentation/order only. Confirm against how Field Ops presentation is
  driven before wiring anything route-dependent.
- The eastern-line reference to Washington is flavor only. Week 4 does **not**
  resolve it as a plot thread. See `AGENTS.md` hard rule #6.
- Do not add Meridian references or "same node" convergence lore. The map
  converges because Pittsburgh's rivers converge — that is all it means.
