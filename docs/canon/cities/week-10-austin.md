# Week 10 — Austin: Dead Air

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 10` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(10, ...)` stub is retired)  
**Prerequisite:** Week 9 (New Orleans) closes and hands off via the "silent Austin frequency" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"Dead Air"* /
> complication *"Signal Interference"* per
> [`../season-one-route.md`](../season-one-route.md). The Override Frequency is a
> standalone artifact — **no** Bureau-faction remote-override conspiracy.

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
| Chapter title | Dead Air |
| City | Austin |
| Complication | Signal Interference |
| Complication summary | The Austin frequency went silent mid-broadcast, and this week the unit's own pursuit reads uncertain until sync confidence is high. The game distinguishes verified pursuit from estimated pursuit, and only verified steps close the real gap. |
| Selena's signature move this week | She works in the static, where an unconfirmed signal looks the same as a real one |
| Next city | Santa Fe |

---

## Complication — Signal Interference

**Label:** Signal Interference  
**First line payoff:** The unit confirms its first stretch of pursuit as verified, not estimated.  
**First movement payoff:** Your synced steps move from estimated to verified — the gap they close is real.

> **Mechanic (ships as flavor + params on existing systems):** this is a flavor
> layer over the game's existing **data-confidence** system (verified vs.
> estimated). Progress reads as estimated until tracker sync confidence is high,
> and Selena stays silent while confidence is low (the trust rule already forbids
> her commenting on unverified data). No new mechanic — this week just names the
> system the player already has.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 10: DEAD AIR

**Body (3 paragraphs):**

> The rhythm out of New Orleans ended on an open rest that pointed to a radio frequency in Austin — one that stopped mid-broadcast and has stayed silent since. Selena came to find out why.
>
> This week the air is full of interference. Pursuit that hasn't synced reads as estimated, not confirmed, and an estimate can be wrong. Only verified steps close the real distance; the rest is static that looks like progress.
>
> Your unit has been assigned to keep its signal clean — sync often, confirm everything — before Selena finds the source of the override.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Keep your trackers synced — only verified steps count against the real gap this week. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Austin, 5 slots)

The five most well-known Austin landmarks. Fun facts are the decode reward — they
ship `null` until unlocked (spoiler rule). Keep in sync with the demo fixture
when Week 10 is implemented.

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Texas State Capitol | Built in 1888 of Texas pink granite, it stands taller than the U.S. Capitol in Washington. |
| 2 | Congress Avenue Bridge | It shelters the largest urban bat colony in North America — about 1.5 million bats stream out at dusk on summer evenings. |
| 3 | Barton Springs Pool | The three-acre spring-fed pool stays around 68–70 degrees year-round, cooled by underground springs. |
| 4 | The University of Texas Tower | The 307-foot campus tower is lit burnt orange to mark major university victories. |
| 5 | Zilker Park | The 350-acre park hosts the Austin City Limits festival and holds the springs that feed Barton Creek. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Austin — Dead Air. A frequency went silent mid-broadcast, and this week the air is full of interference. Sync often; an estimate can lie. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "There is a lot of static this week. Be sure the signal you are following is actually mine."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The unit's synced days are reading as verified pursuit; the un-synced ones are still just static. The real gap is smaller than the estimate — or larger. Confirm to find out.  
**Selena:** "You are learning the difference between a signal and the noise that resembles it. Most never do." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. Verify what's outstanding — a confirmed step closes the gap; an estimated one only looks like it does.  
**Selena (close encounter projected):** "Your verified pursuit puts you right behind me. Do not let an estimate tell you otherwise." — S.C.  
**Selena (trail lost projected):** "You have been chasing an estimate all week. It was never the real distance." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it — on verified steps only.  
**Selena:** "Static will not help either of you today. Only what your trackers can confirm counts." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit followed the loudest signal all week — and it was interference. When the estimated pursuit finally synced, the real distance was far worse than the static had shown. Selena had been broadcasting on a channel that wasn't hers.  
**Selena:** "You followed a signal. You never asked who sent it." — S.C.  
**Evidence body (basic):** A printout of a single waveform recovered near the silent Austin frequency — a signal, flatlined.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} kept its trackers synced and its pursuit verified, so the static never fooled it into chasing an estimate. Selena stayed ahead, but the unit always knew the real distance.  
**Selena:** "You kept your signal clean in a week built for confusion. That is discipline." — S.C.  
**Evidence body (standard):** A waveform and a short access protocol for a frequency that stopped mid-broadcast. The last legible instruction reads "do not trust the carrier."

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} verified nearly everything and reached the frequency's source twenty minutes behind her. A radio tech confirmed Selena had traced the override to a single point — and that the dead frequency had not faded, it had been buried under a stronger signal.  
**Selena:** "You didn't mistake the static for me. Not everything you receive is a true signal — you knew that." — S.C.  
**Evidence body (enhanced):** A waveform and access protocol for the dead Austin frequency. The signal didn't fade — it was overridden, cleanly, by a stronger one on the same channel.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} verified its entire week and traced the override to the source as Selena was reading the same waveform. She held up the printout — one clean signal burying another — and said the interesting part wasn't the dead frequency but where the stronger one came from. Then the lights on the rack went out and she was gone.  
**Selena:** "You verified a whole week while the air lied to you. The Bureau cannot manage that. You did. Note it." — S.C.  
**Evidence body (intercept clue, enhanced):** The overriding signal came from a fixed point in the New Mexico desert — a surveyed marker, not a transmitter.

---

## Evidence

**Standard evidence ID:** `week10_override_frequency`  
**Intercept clue ID:** `week10_desert_source`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE OVERRIDE FREQUENCY | THE DESERT SOURCE |
| Basic body | A printout of a single waveform recovered near the silent Austin frequency — a signal, flatlined. | *(intercept clues only unlock on interception)* |
| Standard body | A waveform and a short access protocol for a frequency that stopped mid-broadcast. The last legible instruction reads "do not trust the carrier." | The overriding signal was traced to a fixed point in the New Mexico desert. |
| Enhanced body | A waveform and access protocol for the dead Austin frequency. The signal didn't fade — it was overridden, cleanly, by a stronger one on the same channel. | The overriding signal came from a fixed point in the New Mexico desert — a surveyed marker, not a transmitter. |
| Highlighted fragment | "it was overridden, cleanly, by a stronger one on the same channel" | "a surveyed marker, not a transmitter" |
| Icon key | waveform | frequency |

---

## Next-city teaser (Santa Fe)

**Header:** NEXT: SANTA FE  
**Body:** The signal that overrode the Austin frequency came from a fixed point in the New Mexico desert — not a transmitter, but a surveyed marker on an old alignment line.  
**Selena:** "Someone is broadcasting from a place that was only ever meant to be measured, not to speak. I want to stand on it." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `austin_before_noon` | Morning Broadcast: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `austin_full_signal` | Full Signal: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `austin_bridge_run` | Bridge Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `austin_long_trail` | Long Trail: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `austin_steady_carrier` | Steady Carrier: steps two days running | `steps_2k_two_days` | label-only reuse |
| `austin_partner_walk` | Walk the trail with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `austin_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `austin_dusk_watch` | Dusk Watch: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 10`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **Signal Interference** — "verified vs. estimated pursuit" uses the EXISTING data-confidence system (already shipped); no new interference mechanic. Copy leans on that system.
- **Platform Sweep flavor (ships):** "Only verified steps cut through the interference. Bureau analysts need the unit synced and confirmed before the window closes." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- Next-city references in the teaser and intercept clue are **flavor only** — the following week does **not** resolve them into a conspiracy (`AGENTS.md` rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
