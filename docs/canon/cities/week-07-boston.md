# Week 7 — Boston: The Midnight Signal

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 7` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(7, ...)` stub is retired)  
**Prerequisite:** Week 6 (New York City) closes and hands off via the "Boston harbor signal every night" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"The Midnight
> Signal"* / complication *"Signal Window"* per
> [`../season-one-route.md`](../season-one-route.md). The Continuity Protocol is a
> standalone artifact — **no** institutions-failed / military-comms-origin lore.

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
| Chapter title | The Midnight Signal |
| City | Boston |
| Complication | Signal Window |
| Complication summary | A signal leaves Boston harbor every night at the same minute, and it can only be answered during a narrow evening window. The unit doesn't need everyone at once — but enough operatives have to contribute before the window closes. |
| Selena's signature move this week | She works to a fixed nightly schedule the pursuers have to match |
| Next city | Savannah |

---

## Complication — Signal Window

**Label:** Signal Window  
**First line payoff:** The unit confirms the signal only answers inside the evening window.  
**First movement payoff:** Your evening contribution lands inside the window — it counts.

> **Mechanic (ships as flavor + params on existing systems):** a group operation
> is available across a broad evening window; players need **not** be
> simultaneous, but enough must contribute before it closes. This reuses the
> participation-threshold operation (Platform Sweep engine) with a within-day
> time window instead of a Fri–Sat day window. No new mechanic.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 07: THE MIDNIGHT SIGNAL

**Body (3 paragraphs):**

> The sixth feed from New York traced to a harbor camera in Boston. It runs an hour ahead of the New York clock for a reason: a signal leaves the harbor here every night at the same minute, and it has for longer than anyone can explain.
>
> Selena arrived in Boston to answer it. The signal can only be received during a narrow window after dark — miss the window, and the night's message is gone until tomorrow.
>
> Your unit has been assigned to be in the field, together, before the window closes. Not all at once — but enough of you, in time.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Contribute during the evening window — the signal only answers before it closes. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Boston, 5 slots)

The five most well-known Boston landmarks. Fun facts are the decode reward — they
ship `null` until unlocked (spoiler rule). Keep in sync with the demo fixture
when Week 7 is implemented.

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | Fenway Park | Opened in 1912, it is the oldest ballpark still in use in the major leagues, home of the 37-foot "Green Monster" wall. |
| 2 | Faneuil Hall | Called the "Cradle of Liberty," this colonial marketplace and meeting hall has hosted public debate since 1743. |
| 3 | USS Constitution | Nicknamed "Old Ironsides," it is the world's oldest commissioned warship still afloat, launched in 1797. |
| 4 | Old North Church | Two lanterns hung in its steeple in 1775 signaled that the British were coming by sea — the city's most famous midnight message. |
| 5 | Boston Common | Established in 1634, it is the oldest public park in the United States. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Boston — The Midnight Signal. A signal leaves the harbor every night at the same minute, and it only answers after dark. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "The signal keeps its own schedule. So do I. The question is whether your unit can."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The unit has hit the evening window twice now — enough hands, in time. The nights you missed it are just as visible.  
**Selena:** "You are learning to be in the right place at the right hour. Most operatives only manage the place." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. Two more windows. Field systems can still close the gap if enough of you are out there after dark.  
**Selena (close encounter projected):** "Answer one more signal and you are level with me. After dark. Don't be late." — S.C.  
**Selena (trail lost projected):** "The window closed again while your unit was asleep. It will not wait." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival both know when the signal goes out. Tonight it comes down to who is standing in the window." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit worked hard, but always at the wrong hour — the evening windows closed with too few operatives in the field. The signal went out each night, unanswered, and Selena read it alone.  
**Selena:** "The signal was sent. Your unit was not listening." — S.C.  
**Evidence body (basic):** A set of old signal instructions recovered near the Old North Church, written for use after dark.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} caught enough of the evening windows to stay in the conversation. The unit answered the signal on most nights and kept Selena within reach of the harbor.  
**Selena:** "You made it into the window more nights than not. Timing is harder than distance." — S.C.  
**Evidence body (standard):** Historic instructions for keeping a message readable as it passes through many hands — a chain of signals meant to run at night.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} answered the signal nearly every night and reached the harbor twenty minutes after the last transmission. A dockworker confirmed Selena had stood at the water's edge until the harbor lights went dark, then walked south.  
**Selena:** "You were in the window when it mattered. Some messages are meant for the moment the lights go out — and you were there for it." — S.C.  
**Evidence body (enhanced):** Historic instructions for a nighttime signal relay, timed to the exact minute the harbor lights go dark.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} answered every window and reached the harbor as the signal was still going out. Selena was there, reading it, and did not startle. She let the operative watch the lights fall dark on schedule, then stepped onto a pier boat that wasn't lit.  
**Selena:** "You kept the whole week's schedule. I have met few units that could. Consider what that means about you." — S.C.  
**Evidence body (intercept clue, enhanced):** One leg of the relay has no address — only the instruction to ask in Savannah, "where they do not write it down."

---

## Evidence

**Standard evidence ID:** `week07_continuity_protocol`  
**Intercept clue ID:** `week07_unwritten_leg`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE CONTINUITY PROTOCOL | THE UNWRITTEN LEG |
| Basic body | A set of old signal instructions recovered near the Old North Church, written for use after dark. | *(intercept clues only unlock on interception)* |
| Standard body | Historic instructions for keeping a message readable as it passes through many hands — a chain of signals meant to run at night. | One leg of the relay has no written address — only an instruction to ask in Savannah. |
| Enhanced body | Historic instructions for a nighttime signal relay, timed to the exact minute the harbor lights go dark. | The relay's next leg has no address at all — only the instruction to ask in Savannah, "where they do not write it down." |
| Highlighted fragment | "the exact minute the harbor lights go dark" | "where they do not write it down" |
| Icon key | signal | lantern |

---

## Next-city teaser (Savannah)

**Header:** NEXT: SAVANNAH  
**Body:** The relay's next leg has no address. The only instruction is to ask in Savannah — where, the protocol says, the route is never written down.  
**Selena:** "Some cities keep their directions in people, not on paper. Savannah is one of them." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `boston_before_noon` | Early Watch: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `boston_full_signal` | Full Signal: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `boston_harbor_run` | Harbor Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `boston_long_trail` | Long Trail: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `boston_two_lanterns` | Two Lanterns: steps two days running | `steps_2k_two_days` | label-only reuse |
| `boston_partner_walk` | Walk the Common with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `boston_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `boston_midnight_watch` | Midnight Watch: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 7`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **Signal Window** — the "evening window" is Platform Sweep flavor; the special op is the unchanged Friday–Saturday participation threshold, not a new time-gated mechanic.
- **Platform Sweep flavor (ships):** "The harbor signal only answers after dark. Bureau analysts need enough of the unit in the field during the evening window before it closes." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- Next-city references in the teaser and intercept clue are **flavor only** — the following week does **not** resolve them into a conspiracy (`AGENTS.md` rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
