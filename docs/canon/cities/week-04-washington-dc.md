# Week 4 — Washington, D.C.: The Monument Cipher

**Status:** DRAFT — awaiting owner review of copy  
**Implements:** `structuralWeek(4, ...)` in `packages/shared/src/season-one/seasonOne.ts`  
**Prerequisite:** Week 3 (Pittsburgh) closes and hands off via the "eastern line to a D.C. archive" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"The Monument
> Cipher"* / complication *"Redacted Orders"* per
> [`../season-one-route.md`](../season-one-route.md). The redacted charter is a
> standalone artifact — **no** Bureau-altered-history lore (that is parked).

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | The Monument Cipher |
| City | Washington, D.C. |
| Complication | Redacted Orders |
| Complication summary | Selena is after a document in a records archive off the National Mall — one whose restricted passages are still sealed. The unit's own field objectives arrive partly redacted, and must be decoded before the true assignment is legible. |
| Selena's signature move this week | She reads what was hidden by reading around the redactions |
| Next city | Philadelphia |

---

## Complication — Redacted Orders

**Label:** Redacted Orders  
**First line payoff:** The unit clears the first redaction and reads its true objective.  
**First movement payoff:** Your route confirms she moved along the Mall, in the open, not the government corridor.

> **Mechanic (ships as flavor + params on existing systems):** some Field Ops
> descriptions render partially obscured; earning intel tokens reveals the true
> objective text. The underlying detectors are unchanged — the redaction is a
> presentation layer, not a new challenge type.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 04: THE MONUMENT CIPHER

**Body (3 paragraphs):**

> At 9:30 AM, a reading-room request at a records archive off the National Mall was filed under a researcher credential that had been deactivated years earlier. The document pulled: a founding-era charter, portions of which remain restricted.
>
> Selena left before staff reached the desk. The request slip she left behind was itself redacted — someone had blacked out the one box that names the document.
>
> Your unit has been assigned to reconstruct what she was reading before she leaves Washington. Expect your own orders to arrive incomplete.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Decode your redacted objectives, then complete them to trace what Selena read. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Washington, D.C., 5 slots)

The five most well-known D.C. landmarks. Fun facts are the decode reward — they
ship `null` until unlocked (spoiler rule). Keep in sync with the demo fixture
when Week 4 is implemented.

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Lincoln Memorial | The marble statue of Lincoln sits inside a Greek-temple design ringed by 36 columns — one for each state at the time of his death. |
| 2 | Washington Monument | At just over 555 feet it was the tallest structure in the world when finished in 1884; a color change in the marble marks where construction paused for two decades. |
| 3 | U.S. Capitol | The cast-iron dome weighs nearly nine million pounds and is topped by the 19-foot Statue of Freedom. |
| 4 | The White House | The residence has 132 rooms and has housed every U.S. president except George Washington, who chose the site but never lived there. |
| 5 | The National Archives | It displays the original Declaration of Independence, Constitution, and Bill of Rights, sealed in protective cases. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Washington, D.C. — The Monument Cipher. A restricted charter was pulled from a Mall archive under a dead credential. The field briefing is ready — parts of it are still redacted.  
**Selena (shown if briefing not yet opened):** "They gave you orders with the important parts removed. Familiar, isn't it."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The unit has cleared enough redactions to read the real assignment. It is not the one you were given Monday.  
**Selena:** "You are learning to read the black bars instead of the words. Keep going. That is where they hide things." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. The charter's restricted section is nearly reconstructed. Field systems can still close the gap.  
**Selena (close encounter projected):** "You are one page from what I already read. Hurry." — S.C.  
**Selena (trail lost projected):** "You are still reading the version they wanted you to have." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival were handed the same redacted orders. Today shows who read them better." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit worked the objectives it was given — but the objectives were redacted, and the parts left visible led the wrong way. Selena read the charter and was gone before the real assignment came clear.  
**Selena:** "The Bureau counted on you reading only what it left visible." — S.C.  
**Evidence body (basic):** A photostat of a founding-era charter, most of its text blacked out, recovered from the archive reading room.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} cleared enough of the redactions to read the true objectives and follow Selena's path through the archive district. She stayed ahead, but the unit was reading the same document by the end.  
**Selena:** "You got past the black bars. Most people stop at them." — S.C.  
**Evidence body (standard):** A founding-era charter under heavy redaction, its restricted passages sealed with red archival stamps.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} reached the reading room forty minutes after Selena signed out. The charter was still on the desk, open to the restricted section — and one seal had been lifted, cleanly, by someone who had done it before.  
**Selena:** "You reached the desk. You even saw which page. Redaction does not destroy the truth. It only delays it." — S.C.  
**Evidence body (enhanced):** A founding-era charter under heavy redaction. The red seals are modern — applied long after the document itself was written.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} reached the reading room while Selena was still at the desk, the charter open in front of her. She turned it so the operative could see the one line she had uncovered, then walked out through the staff corridor as if her credential were still good.  
**Selena:** "You read it with me. Now you know it is not the document that was redacted — it is the date. Decide what that is worth to you." — S.C.  
**Evidence body (intercept clue, enhanced):** One line survived the redaction, naming a signing hall in Philadelphia — beside a date that does not match the official record.

---

## Evidence

**Standard evidence ID:** `week04_redacted_charter`  
**Intercept clue ID:** `week04_unredacted_line`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE REDACTED CHARTER | ONE UNREDACTED LINE |
| Basic body | A photostat of a founding-era charter, most of its text blacked out, recovered from the archive reading room. | *(intercept clues only unlock on interception)* |
| Standard body | A founding-era charter under heavy redaction, its restricted passages sealed with red archival stamps. | A single line escaped the redactor's pen, naming a signing hall in Philadelphia. |
| Enhanced body | A founding-era charter under heavy redaction. The red seals are modern — applied long after the document itself was written. | One line survived the redaction, naming a hall in Philadelphia — beside a date that does not match the official record. |
| Highlighted fragment | "The red seals are modern" | "a date that does not match the official record" |
| Icon key | document | seal |

---

## Next-city teaser (Philadelphia)

**Header:** NEXT: PHILADELPHIA  
**Body:** The one line the redactors missed names a hall in Philadelphia — the room where the original charter was signed. The copy is in Washington. The original never left.  
**Selena:** "They kept the copy and hid the original. I am going to read the original." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items (D.C.-flavored)

City-specific bingo card entries. These replace generic entries for Week 4.

| Code | Label | Type |
|---|---|---|
| `dc_before_noon` | Early Session: 1,000 steps before noon | movement |
| `dc_full_shift` | Full Record: hit 100% of daily target | movement |
| `dc_mall_walk` | Mall Walk: 5,000 steps in a day | movement |
| `dc_long_archive` | Long Archive: 10,000 steps in a day | movement |
| `dc_standing_order` | Standing Order: steps two days running | streak |
| `dc_partner_walk` | Walk the Mall with someone — friend, family, or pet | social |
| `dc_eyes_up` | Notice something on your route you have not seen before | awareness |
| `dc_after_hours` | After-hours watch: 1,000 steps after 6 PM | movement |

---

## Implementation notes for Codex

- Replace `structuralWeek(4, "Washington, D.C.", ...)` in `seasonOne.ts` with a
  full inline config object modeled on the Week 1 Chicago block.
- Evidence IDs `week04_redacted_charter` and `week04_unredacted_line` go into the
  `evidence` array in `SEASON_ONE_CONFIG`.
- The "Redacted Orders" mechanic is a presentation layer over existing Field Ops
  objectives — obscured description text revealed by intel tokens. It must not
  change which detectors fire or how they score. Confirm against how Field Ops
  descriptions are rendered before wiring the reveal.
- The Philadelphia reference and the "date that does not match" are flavor only.
  Week 5 does **not** resolve them into a conspiracy. See `AGENTS.md` rule #6.
- Do not connect the redacted charter to any network/Meridian backstory. It is a
  restricted historical document and nothing more.
