# Week 6 — New York City: Five Borough Decoy

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 6` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(6, ...)` stub is retired)  
**Prerequisite:** Week 5 (Philadelphia) closes and hands off via the "five stewards, one New York address" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"Five Borough
> Decoy"* / complication *"False Positives"* per
> [`../season-one-route.md`](../season-one-route.md). The "Identity Cascade" is a
> standalone decoy record — **not** a network-authenticates-identity lore hook.

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
| Chapter title | Five Borough Decoy |
| City | New York City |
| Complication | False Positives |
| Complication summary | Selena is reported in all five boroughs at once. Most of the sightings are decoys — relays and stand-ins timed to look real. The unit must sort the false leads from the one that isn't before committing the week. |
| Selena's signature move this week | She floods the field with plausible sightings so the obvious one is wrong |
| Next city | Boston |

---

## Complication — False Positives

**Label:** False Positives  
**First line payoff:** The unit rules out its first decoy sighting.  
**First movement payoff:** Your route confirms one borough's lead was staged — the timing doesn't hold.

> **Mechanic (ships as flavor + params on existing systems):** several candidate
> leads are presented; Field Ops completion and prediction accuracy improve the
> quality of the route estimate (narrowing the field). There is **no permanent
> branch** — no divergent game state, just a better or worse estimate. Same
> detectors as any week.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 06: FIVE BOROUGH DECOY

**Body (3 paragraphs):**

> Overnight, Selena was reported in all five boroughs — the harbor, midtown, the Bronx, Brooklyn, and Queens — within the same hour. Every sighting checked out on its own. Together, they are impossible.
>
> The Philadelphia ledger named five stewards at one New York address. The Bureau now believes the five sightings and the five names are the same trick: one person, made to look like many.
>
> Your unit has been assigned to find the sighting that is real. Four of them want your attention. Only one deserves it.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Complete operations to rule out the staged sightings and narrow the real lead. |
| prediction | PREDICTION | A sharper prediction improves the route estimate — accuracy matters this week. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (New York City, 5 slots)

The five most well-known NYC landmarks. Fun facts are the decode reward — they
ship `null` until unlocked (spoiler rule). Keep in sync with the demo fixture
when Week 6 is implemented.

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Statue of Liberty | A gift from France dedicated in 1886, the copper statue slowly turned green as its surface weathered over decades. |
| 2 | Empire State Building | Built in just 410 days during the Depression, its 102 stories held the title of world's tallest building for nearly forty years. |
| 3 | Central Park | The 843-acre park is entirely landscaped — nearly every lake, hill, and meadow in it was designed and built by hand. |
| 4 | Times Square | Named for The New York Times, which moved there in 1904; the first New Year's Eve ball dropped there in 1907. |
| 5 | Brooklyn Bridge | When it opened in 1883 it was the longest suspension bridge in the world, and the first built of steel wire. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** New York City — Five Borough Decoy. Selena was reported in all five boroughs in the same hour. Four are lying. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "Five of me tonight. Only one is worth following. Choose carefully."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. Two of the five sightings have collapsed under their own timing. Three remain. The unit's predictions are sharpening the field.  
**Selena:** "You are throwing out the fakes faster than the Bureau expected. Keep discarding. The truth is what's left." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. One sighting is holding up under every check. Field systems can still close on it.  
**Selena (close encounter projected):** "You found the real one. Now the only question is speed." — S.C.  
**Selena (trail lost projected):** "You are still watching a decoy. It is very good, isn't it." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival each backed a different sighting. Today, one of you was watching a ghost." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit committed to the borough with the clearest footage. It was the best-made decoy — a relayed feed and a stand-in with a matching coat. The real Selena moved through a borough no one was watching.  
**Selena:** "You chased the face that was chosen for you." — S.C.  
**Evidence body (basic):** A surveillance printout logging five simultaneous sightings of Selena across five boroughs.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} discarded the staged sightings one by one and kept pace with the lead that held up. Selena stayed ahead, but the unit never spent a day on a ghost.  
**Selena:** "You stopped trusting the obvious feed. That is the whole lesson of this city." — S.C.  
**Evidence body (standard):** A surveillance record showing five borough sightings that share one movement pattern — the same gait, timed to look like five people.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} narrowed the five leads to one and reached the borough twenty-five minutes behind her. A transit contact confirmed only one set of footsteps had ever really been Selena's — the unit had been watching the right one for two days.  
**Selena:** "You found the real sighting and stayed on it. A system that recognizes everyone can misidentify anyone — but you didn't." — S.C.  
**Evidence body (enhanced):** A surveillance record: five sightings, five boroughs, one gait. Four were relays. Only one set of steps was ever really hers.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} collapsed four decoys and caught the fifth in motion — Selena, crossing between platforms, no stand-in, no relay. She raised an eyebrow at being the one they picked, then stepped onto a train the board said wasn't running.  
**Selena:** "Four decoys and you chose me. The Bureau has never once managed that on the first try. Note it." — S.C.  
**Evidence body (intercept clue, enhanced):** A sixth feed on the record came from Boston — an hour before the New York sightings it supposedly triggered.

---

## Evidence

**Standard evidence ID:** `week06_identity_cascade`  
**Intercept clue ID:** `week06_boston_feed`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE IDENTITY CASCADE | THE BOSTON FEED |
| Basic body | A surveillance printout logging five simultaneous sightings of Selena across five boroughs. | *(intercept clues only unlock on interception)* |
| Standard body | A surveillance record showing five borough sightings that share one movement pattern — the same gait, timed to look like five people. | A sixth feed on the record routes through a Boston harbor camera. |
| Enhanced body | A surveillance record: five sightings, five boroughs, one gait. Four were relays. Only one set of steps was ever really hers. | A sixth feed came from Boston — an hour before the New York sightings it supposedly triggered. |
| Highlighted fragment | "Only one set of steps was ever really hers" | "an hour before the New York sightings it supposedly triggered" |
| Icon key | record | feed |

---

## Next-city teaser (Boston)

**Header:** NEXT: BOSTON  
**Body:** The sixth feed traces to a harbor camera in Boston, running an hour ahead of the New York clock. A contact there says a signal goes out from the harbor every night at the same minute.  
**Selena:** "There is a signal in Boston that only transmits at night. I intend to be listening when it does." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `nyc_before_noon` | Morning Rush: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `nyc_full_fare` | Full Fare: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `nyc_borough_run` | Borough Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `nyc_long_avenue` | Long Avenue: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `nyc_express_line` | Express Line: steps two days running | `steps_2k_two_days` | label-only reuse |
| `nyc_partner_walk` | Walk a block with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `nyc_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `nyc_after_hours` | After-hours watch: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 6`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **False Positives** — the "five decoys / pick the real borough" framing is copy only; no multi-candidate or decoy-resolution mechanic exists. Standard detectors + Platform Sweep.
- **Platform Sweep flavor (ships):** "Bureau analysts have narrowed the real Selena to three of the five boroughs. The unit must cover every candidate before the decoys reset." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- Next-city references in the teaser and intercept clue are **flavor only** — the following week does **not** resolve them into a conspiracy (`AGENTS.md` rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
