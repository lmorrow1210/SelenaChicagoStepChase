# Week N — [City]: [Chapter Title]

**Status:** DRAFT — awaiting owner review  
**Implements:** `structuralWeek(N, ...)` in `packages/shared/src/season-one/seasonOne.ts`  
**Prerequisite:** Week N-1 closes and hands off via the next-city teaser.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | |
| City | |
| Complication | |
| Complication summary | (1–2 sentences: what makes this city operationally difficult for the group this week) |
| Selena's signature move this week | (what tactic she's using — evasion style, not plot) |
| Next city | |

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 0N: [CHAPTER TITLE IN CAPS]

**Body (3 paragraphs):**

> [Paragraph 1: The inciting event — what Selena did, timestamp and location, what was taken or done.]
>
> [Paragraph 2: Where she was last seen, how she moved, what the Bureau knows.]
>
> [Paragraph 3: The assignment — what the unit needs to do before she leaves the city.]

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Complete operations to [city-specific intel goal]. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Complication — [Complication label]

**Label:** [One or two words]  
**First line payoff:** (what the group learns when the first Field Ops line is completed)  
**First movement payoff:** (what the group learns when the first movement is logged)

---

## Field Ops — Intel landmarks ([City], 5 slots)

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

Fun facts ship `null` until unlocked (spoiler rule). Keep them specific, factual,
and interesting — not trivia-show filler.

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** [City] — [Chapter title]. [One sentence teaser of the case.] The field briefing is ready.  
**Selena (if briefing not opened):** "[One taunt, signed — S.C. or unsigned per tone]"  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** [Where Selena is mid-week, what intelligence is coming in.]  
**Selena:** "[Midweek observation or taunt.]" — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. [Where she is now, what systems can still close the gap.]  
**Selena (close encounter projected):** "[Near-capture acknowledgment.]" — S.C.  
**Selena (trail lost projected):** "[Comfortable distance line.]" — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "[Nemesis/rivalry observation for this city.]" — S.C.

---

## Case Closed outcomes

Follow Selena's voice rules for all four. Each should feel distinct.
The {{groupName}} template variable is replaced at render time — do not
hardcode a group name. Check `CaseClosedReport.tsx` for how `fill()` works:
if the group name starts with "The", don't prepend "The" in the template.

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** [What went wrong — specific to this city's geography or Selena's tactic.]  
**Selena:** "[Sting line, city-specific.]" — S.C.  
**Evidence body (basic):** [Spare, factual — what was recovered.]

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} [tracked her / confirmed her route / kept pace] — but she cleared the city.  
**Selena:** "[Acknowledgment of the group's competence, with a caveat.]" — S.C.  
**Evidence body (standard):** [More detail than basic — something confirmed or clarified.]

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} reached [location] [time delta] after Selena. [What was left behind or observed.]  
**Selena:** "[Acknowledgment that it was genuinely close.]" — S.C.  
**Evidence body (enhanced):** [Richest version — something noticed that basic/standard missed.]

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} reached Selena at [location]. [Brief, specific encounter. She escapes.]  
**Selena:** "[Something that acknowledges the group has surprised her.]" — S.C.  
**Evidence body (intercept clue):** [A detail that points toward next city — flavor only, not plot obligation.]

---

## Evidence

**Standard evidence ID:** `week0N_[slug]`  
**Intercept clue ID:** `week0N_[slug]`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | | |
| Basic body | | *(intercept clues only unlock on interception)* |
| Standard body | | |
| Enhanced body | | |
| Highlighted fragment | | |
| Icon key | | |

---

## Next-city teaser

**Header:** NEXT: [NEXT CITY IN CAPS]  
**Body:** [One or two sentences — what's been detected or reported in the next city.]  
**Selena:** "[Teaser line.]" — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items (city-flavored)

| Code | Label | Type |
|---|---|---|
| `[city]_before_noon` | [City name]-flavored morning movement challenge | movement |
| `[city]_full_shift` | Hit 100% of daily target | movement |
| `[city]_[local]` | [City-flavored label] | movement / streak / social / awareness |
| (add up to 8 total) | | |

---

## Implementation notes for Codex

- Replace `structuralWeek(N, ...)` with a full inline config object modeled on
  the Week 1 Chicago block in `seasonOne.ts`.
- Add evidence IDs to the `evidence` array in `SEASON_ONE_CONFIG`.
- The intercept clue's next-city reference is flavor only — it does not
  obligate lore in Week N+1.
- Do not add Meridian references. Do not escalate evidence into a cross-week
  mystery arc. See `AGENTS.md` hard rule #6.
