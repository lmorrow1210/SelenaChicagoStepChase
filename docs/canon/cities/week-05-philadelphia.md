# Week 5 — Philadelphia: The Liberty Exchange

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 5` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(5, ...)` stub is retired)  
**Prerequisite:** Week 4 (Washington, D.C.) closes and hands off via the "read the original in the Philadelphia signing hall" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"The Liberty
> Exchange"* / complication *"Shared Custody"* per
> [`../season-one-route.md`](../season-one-route.md). The ledger is a standalone
> artifact — **no** decentralized-Meridian-custody lore (that is parked).

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
| Chapter title | The Liberty Exchange |
| City | Philadelphia |
| Complication | Shared Custody |
| Complication summary | The document Selena is after cannot be moved by one person — it is held under a shared-custody arrangement that requires several hands at once. The unit's objective works the same way: individual effort alone won't unlock it. |
| Selena's signature move this week | She exploits a system that assumed no one would ever assemble enough people at once |
| Next city | New York City |

---

## Complication — Shared Custody

**Label:** Shared Custody  
**First line payoff:** The unit confirms the ledger can't be lifted by one operative — it needs the whole team.  
**First movement payoff:** Your contribution counts toward the shared objective, but only alongside others.

> **Mechanic (ships as flavor + params on existing systems):** the week's
> artifact unlock is gated on participation, not individual volume — **at least
> three players** must contribute to designated team objectives. This reuses the
> existing participation-threshold system (same one the Platform Sweep uses); no
> new mechanic.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 05: THE LIBERTY EXCHANGE

**Body (3 paragraphs):**

> The line Selena uncovered in Washington named a signing hall in Philadelphia — and the original document the Washington copy was made from. That original is held under shared custody: no single custodian can release it alone.
>
> At 7:15 AM, three of the named custodians were reported unreachable within the same ten minutes. By the time the fourth arrived, the ledger recording the document's chain of custody was gone.
>
> Your unit has been assigned to reconstruct the ledger before Selena leaves the city. It will take more than one of you — that is the point.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Contribute to shared objectives — the ledger only comes together with the whole team. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Philadelphia, 5 slots)

The five most well-known Philadelphia landmarks. Fun facts are the decode reward
— they ship `null` until unlocked (spoiler rule). **All five fun facts fact-checked 2026-07-18** — Independence Hall (Declaration + Constitution signed there); Liberty Bell inscription + long-silent crack; PMA "Rocky Steps"; Reading Terminal Market opened 1893 (America's oldest continuously operating public market); Eastern State Penitentiary radial cell design. **DB sync note:** migration 009 seeded a different placeholder set for this city; a landmark-sync migration is needed before this week goes live (flagged for Codex, same fix class as Detroit's migration 010).

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Independence Hall | Both the Declaration of Independence and the U.S. Constitution were debated and signed in this brick assembly room. |
| 2 | The Liberty Bell | Its inscription reads "Proclaim Liberty Throughout All the Land"; a crack has kept the bell silent since the 19th century. |
| 3 | Philadelphia Museum of Art | Its east steps became famous as the "Rocky Steps," and a bronze statue of the boxer stands at their base. |
| 4 | Reading Terminal Market | One of the country's oldest continuously operating public markets, it has fed the city under one roof since 1893. |
| 5 | Eastern State Penitentiary | Its wagon-wheel design of solitary cells influenced prisons worldwide before it closed and became a preserved ruin. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Philadelphia — The Liberty Exchange. A shared-custody document lost its ledger the moment three custodians went dark at once. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "This one you cannot do alone. I am curious whether your unit knows that yet."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The shared objective is filling in — but only where enough of the team showed up together. The gaps are where people worked alone.  
**Selena:** "I can see exactly which days your unit moved as one and which days it did not. So can you, now." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. The ledger is nearly whole. It needs a few more hands, not a few more miles from one person.  
**Selena (close encounter projected):** "One more custodian steps up and you have it. Not one more mile from your best walker." — S.C.  
**Selena (trail lost projected):** "You are still trying to carry this by yourself. It was built so you couldn't." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "The team objective is settled. This last one is just you and your rival. Different rules — I know." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** A few operatives carried most of the week, and it wasn't enough — the ledger's chain of custody needed more hands than showed up. Selena walked the document out through a gap that only exists when a team acts like individuals.  
**Selena:** "You worked as individuals. This was designed for people who don't." — S.C.  
**Evidence body (basic):** A coded ledger recovered near the Independence Hall archive, its columns filled in more than one hand.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} put enough hands on the shared objective to reconstruct most of the ledger and hold the chain of custody together. Selena kept ahead, but she couldn't slip through a gap the team had closed.  
**Selena:** "You moved together. That is rarer than distance." — S.C.  
**Evidence body (standard):** A coded ledger assigning entries to cities, institutions, and stewards named only by initials — no single owner anywhere in it.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} reconstructed the ledger with the whole team on it and reached the exchange hall thirty minutes behind her. A custodian confirmed Selena had read the chain of custody end to end before leaving — and had signed no name.  
**Selena:** "You held it together, all of you at once. That is how it was meant to be held. No one was ever meant to hold this alone." — S.C.  
**Evidence body (enhanced):** A coded ledger with no single owner. Every entry is countersigned by at least three different hands.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} filled the ledger's last entries as a unit and reached the hall while Selena was still inside. She looked at the reconstructed chain of custody, saw every name filled by the team, and set the document down. "Correct," she said, and left through a door three custodians would have had to open together.  
**Selena:** "You did it the way it was built to be done. I did not expect a Bureau unit to manage that. Adjust accordingly." — S.C.  
**Evidence body (intercept clue, enhanced):** One column ties five separate stewards to a single New York address — and none of the five names appears anywhere else in the ledger.

---

## Evidence

**Standard evidence ID:** `week05_custodian_ledger`  
**Intercept clue ID:** `week05_new_york_column`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE CUSTODIAN LEDGER | THE NEW YORK COLUMN |
| Basic body | A coded ledger recovered near the Independence Hall archive, its columns filled in more than one hand. | *(intercept clues only unlock on interception)* |
| Standard body | A coded ledger assigning entries to cities, institutions, and stewards named only by initials — no single owner anywhere in it. | One column ties five separate stewards to a single New York address. |
| Enhanced body | A coded ledger with no single owner. Every entry is countersigned by at least three different hands. | Five stewards, one New York address — and none of the five names appears anywhere else in the ledger. |
| Highlighted fragment | "countersigned by at least three different hands" | "none of the five names appears anywhere else in the ledger" |
| Icon key | ledger | column |

---

## Next-city teaser (New York City)

**Header:** NEXT: NEW YORK CITY  
**Body:** The ledger's New York column lists five stewards at one address. A contact in the city says all five have been seen this week — in five different boroughs, at the same hour.  
**Selena:** "Five sightings, one person, five boroughs. Decide which one is real before the Bureau tells you which to believe." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `philadelphia_before_noon` | Morning Bell: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `philadelphia_full_charter` | Full Charter: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `philadelphia_market_run` | Market Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `philadelphia_long_mile` | Long Mile: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `philadelphia_shared_watch` | Shared Watch: steps two days running | `steps_2k_two_days` | label-only reuse |
| `philadelphia_partner_walk` | Walk with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `philadelphia_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `philadelphia_after_hours` | After-hours watch: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 5`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **Shared Custody** — the "≥3-contributor artifact gate" is narrative; the participation theme rides on the standard Platform Sweep contributor tiers + copy. No separate artifact-gating mechanic is built.
- **Platform Sweep flavor (ships):** "Bureau analysts need at least three operatives to hold the exchange hall's doors at once. No single custodian can cover it alone." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- Next-city references in the teaser and intercept clue are **flavor only** — the following week does **not** resolve them into a conspiracy (`AGENTS.md` rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
