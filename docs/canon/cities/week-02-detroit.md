# Week 2 — Detroit: The Machine Restarted

**Status:** DRAFT — awaiting owner review of copy  
**Implements:** `structuralWeek(2, ...)` in `packages/shared/src/season-one/seasonOne.ts`  
**Prerequisite:** Week 1 (Chicago) closes and hands off via the "machine restarted" teaser.

> ✅ **Naming resolved (2026-07-17):** chapter *"The Machine Restarted"* /
> complication *"Assembly Line"* (matches shipped `seasonOne.ts` and the route
> table). Landmarks resolved to the five most well-known Detroit sites, synced
> with the demo fixture.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | The Machine Restarted |
| City | Detroit |
| Complication | Assembly Line |
| Complication summary | Selena is moving through Detroit's old manufacturing infrastructure — long corridors, loading bays, freight routes the city grid doesn't show. The unit starts cold before the first field operative logs movement. |
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
**Story:** {{groupName}} reached the Michigan Central corridor ninety minutes after Selena. A bureau contact confirmed she had been in the main hall — watching the windows — before departing north.  
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

## Bingo items (Detroit-flavored)

City-specific bingo card entries. These replace generic entries for Week 2.

| Code | Label | Type |
|---|---|---|
| `detroit_before_noon` | Morning Shift: 1,000 steps before noon | movement |
| `detroit_full_shift` | Full Shift: hit 100% of daily target | movement |
| `detroit_assembly_run` | Assembly Run: 5,000 steps in a day | movement |
| `detroit_long_haul` | Long Haul: 10,000 steps in a day | movement |
| `detroit_freight_walk` | Freight Route: steps two days running | streak |
| `detroit_partner_walk` | Walk the line with someone — friend, family, or pet | social |
| `detroit_eyes_up` | Notice something on your route you have not seen before | awareness |
| `detroit_after_hours` | After-hours watch: 1,000 steps after 6 PM | movement |

---

## Implementation notes for Codex

- Replace `structuralWeek(2, "Detroit", ...)` in `seasonOne.ts` with a full
  inline config object modeled on the Week 1 Chicago block.
- Evidence IDs `week02_routing_diagram` and `week02_pittsburgh_corridor` must
  be added to the `evidence` array in `SEASON_ONE_CONFIG`.
- The intercept clue's Pittsburgh reference is flavor only — it does not
  obligate any lore in Week 3. Pittsburgh's chapter can reference steel and
  bridges without resolving the "second corridor" as a plot thread.
- Bingo codes go into `fieldOpsCodes` equivalent for week 2 — confirm the
  pattern against how Week 1 fixed challenge codes are wired.
- Do not add Meridian references. Do not escalate the evidence into a
  cross-week mystery arc. See `AGENTS.md` hard rule #6.
