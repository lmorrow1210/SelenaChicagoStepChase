# Week 12 — Los Angeles: The Moving Picture

**Status:** READY FOR OWNER REVIEW — implemented in code and reconciled against
this pack; final gate is owner copy sign-off + Codex's infra/test pass  
**Implements:** the full inline `SeasonWeekConfig` for `weekNumber: 12` in
`seasonOne.ts` (Weeks 3–13 bulk buildout, draft PR #6; the old `structuralWeek(12, ...)` stub is retired)  
**Prerequisite:** Week 11 (Santa Fe) closes and hands off via the "forged survey photo traces to an L.A. film lab" teaser.

> Authored 2026-07-17 from the route table + voice guide. Chapter *"The Moving
> Picture"* / complication *"Edited Reality"* per
> [`../season-one-route.md`](../season-one-route.md). The Composite Record is a
> standalone media forgery — **no** Bureau-faction-fabricated-evidence conspiracy.

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
| Chapter title | The Moving Picture |
| City | Los Angeles |
| Complication | Edited Reality |
| Complication summary | The reports coming out of Los Angeles contradict each other — clips, stills, and timestamps that can't all be true. Completing Field Ops surfaces the metadata that shows which evidence is authentic and which was staged. |
| Selena's signature move this week | She lets a convincing fake do the misdirecting for her |
| Next city | San Francisco |

---

## Complication — Edited Reality

**Label:** Edited Reality  
**First line payoff:** The unit surfaces the first piece of metadata — one clip is dated wrong.  
**First movement payoff:** Your field work exposes a staged report; the authentic one moves up.

> **Mechanic (ships as flavor + params on existing systems):** the unit is given
> contradictory "evidence," and completing Field Ops reveals metadata that
> establishes which items are authentic. This reuses the existing intel-unlock /
> reveal pattern (like decoding a locked intel tile) applied to sorting real from
> staged. No new mechanic.

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 12: THE MOVING PICTURE

**Body (3 paragraphs):**

> The forged survey photograph from Santa Fe traced to a film lab in Los Angeles — a place that makes locations look real for a living. The reports arriving from the city now contradict each other: clips, stills, and timestamps that cannot all be true at once.
>
> Someone here is very good at building a convincing account of something that never happened. The trick is not to believe the footage — it is to read what the footage can't fake: the metadata underneath it.
>
> Your unit has been assigned to complete the field work that surfaces that metadata, and sort the real record from the edited one, before Selena leaves the city.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Complete operations to surface metadata and separate the authentic evidence from the staged. |
| prediction | PREDICTION | Estimate how far the team moves before the case closes Sunday night. |
| nemesis | NEMESIS | Five daily rounds against your assigned rival. Most verified steps wins the day. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Field Ops — Intel landmarks (Los Angeles, 5 slots)

The five most well-known Los Angeles landmarks. Fun facts are the decode reward —
they ship `null` until unlocked (spoiler rule). **All five fun facts fact-checked 2026-07-18** — Hollywood Sign (1923, originally "HOLLYWOODLAND"); Griffith Observatory (free public telescopes since 1935); Santa Monica Pier (western end of Route 66, since 1909); TCL Chinese Theatre (forecourt prints since 1927); Getty Center (16,000 tons of travertine, tram access). **DB sync note:** migration 009 seeded a different placeholder set for this city; a landmark-sync migration is needed before this week goes live (flagged for Codex, same fix class as Detroit's migration 010).

| Day | Landmark name | Fun fact (shown after unlock) |
|---|---|---|
| 1 | The Hollywood Sign | Erected in 1923, it originally read "HOLLYWOODLAND" and advertised a real-estate development before becoming the city's icon. |
| 2 | Griffith Observatory | Perched on Mount Hollywood, its free public telescopes have drawn visitors to the night sky since 1935. |
| 3 | Santa Monica Pier | The pier marks the western end of Route 66 and has carried its amusement park over the Pacific since 1909. |
| 4 | TCL Chinese Theatre | Its forecourt has held the handprints and footprints of film stars set in concrete since 1927. |
| 5 | The Getty Center | The hilltop museum is clad in 16,000 tons of travertine stone and reached by its own cable-drawn tram. |

---

## Ritual copy

### Monday briefing

**Headline:** NEW CASE OPEN  
**Body:** Los Angeles — The Moving Picture. The reports out of the city contradict each other; someone is very good at faking a location. The field briefing is ready.  
**Selena (shown if briefing not yet opened):** "You are about to be shown several truths. At most one of them is real. Read the seams."  
**CTA:** Open the briefing

---

### Midweek update

**Headline:** MID-WEEK SIGNAL  
**Body:** Three days in. The unit's field work has surfaced enough metadata to throw out two of the staged reports. The footage still looks convincing. The data underneath it does not.  
**Selena:** "You stopped trusting your eyes and started reading the timestamps. That is the only way through this city." — S.C.

---

### Final push (Friday–Saturday)

**Headline:** FINAL PUSH  
**Body:** Two days remain. One authentic record is separating from the fakes. Field systems can still confirm it.  
**Selena (close encounter projected):** "You have nearly found the real footage. Do not let the pretty one distract you now." — S.C.  
**Selena (trail lost projected):** "You are still watching the version they edited for you." — S.C.

---

### Sudden death (Saturday, tied nemesis)

**Headline:** SUDDEN DEATH  
**Body:** Five days even. Saturday decides it.  
**Selena:** "You and your rival were handed the same edited reel. Today, one of you believed a fake." — S.C.

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit chased the most convincing footage — sharp, well-lit, perfectly timed. It was the fake. The authentic record was a dull clip no one thought to check, and by the time the metadata surfaced, Selena had walked off the set entirely.  
**Selena:** "You watched the version they edited for you." — S.C.  
**Evidence body (basic):** A film reel and a stack of stills recovered from a Los Angeles lab — all showing the same event.

---

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} read the metadata instead of the footage and threw out the staged reports one by one. Selena stayed ahead, but the unit never committed to a fake.  
**Selena:** "You checked the seams. Most people never look past a clean image." — S.C.  
**Evidence body (standard):** A record assembled from many sources — clips, timestamps, and stills combined into one convincing account of something that never happened.

---

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** {{groupName}} surfaced nearly all the metadata and reached the lab twenty minutes behind her. A film tech confirmed Selena had been through the same reels — and had left the one authentic frame face-up on the light table, as if she wanted it found.  
**Selena:** "You found the real frame in a room full of forgeries. A convincing record is not the same as a true one — and you knew the difference." — S.C.  
**Evidence body (enhanced):** A composite record — images, timestamps, and logs stitched into a single false account. The seams only show in the metadata.

---

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} sorted every fake from the real and reached the lab while Selena was still at the light table. She turned the one authentic frame toward the operative — a bridge in fog, timestamped wrong — and said the interesting thing was not that the record was faked, but which ending it was faked to hide. Then the room went dark between two frames and she was gone.  
**Selena:** "You read a whole city of forgeries and still found the one true frame. The Bureau would have believed the pretty one. You did not. Note it." — S.C.  
**Evidence body (intercept clue, enhanced):** One frame in the composite was never edited. It shows a bridge in fog — San Francisco — timestamped after the record claims the chase ended.

---

## Evidence

**Standard evidence ID:** `week12_composite_record`  
**Intercept clue ID:** `week12_uncut_frame`

| Field | Standard | Intercept clue |
|---|---|---|
| Title | THE COMPOSITE RECORD | THE UNCUT FRAME |
| Basic body | A film reel and a stack of stills recovered from a Los Angeles lab — all showing the same event. | *(intercept clues only unlock on interception)* |
| Standard body | A record assembled from many sources — clips, timestamps, and stills combined into one convincing account of something that never happened. | One frame in the composite was never edited. It shows a bridge in fog — San Francisco. |
| Enhanced body | A composite record — images, timestamps, and logs stitched into a single false account. The seams only show in the metadata. | One frame was never edited: a bridge in fog, San Francisco, timestamped after the record claims the chase ended. |
| Highlighted fragment | "The seams only show in the metadata" | "timestamped after the record claims the chase ended" |
| Icon key | film | record |

---

## Next-city teaser (San Francisco)

**Header:** NEXT: SAN FRANCISCO  
**Body:** One frame in the composite was never touched. It shows a bridge in fog — San Francisco — stamped with a time after the record claims the chase was over.  
**Selena:** "They edited an ending for you. The real one is in San Francisco, and it has not happened yet." — S.C.  
**CTA:** Continue the pursuit

---

## Bingo items — classification

Per `IMPLEMENTING-A-CITY.md` Gotcha 2. `bingo_challenge_definitions` stores one
global `label` per `code` (no per-city override column), so **Decision A ships**:
this week reuses Chicago's 24 shared `fixedChallengeCodes`. All eight concepts
below are **label-only reuse of an existing detector** — no new detector logic:

| Code (proposed) | Label | Nearest existing detector | Classification |
|---|---|---|---|
| `losangeles_before_noon` | Morning Take: 1,000 steps before noon | `steps_1k_noon` | label-only reuse |
| `losangeles_full_scene` | Full Scene: hit 100% of daily target | `target_100pct_day` | label-only reuse |
| `losangeles_boardwalk_run` | Boardwalk Run: 5,000 steps in a day | `steps_5k_day` | label-only reuse |
| `losangeles_long_boulevard` | Long Boulevard: 10,000 steps in a day | `steps_10k_day` | label-only reuse |
| `losangeles_second_take` | Second Take: steps two days running | `steps_2k_two_days` | label-only reuse |
| `losangeles_partner_walk` | Walk the pier with someone — friend, family, or pet | `walk_with_someone` | label-only reuse |
| `losangeles_eyes_up` | Notice something on your route you have not seen before | `eyes_up` | label-only reuse |
| `losangeles_night_shoot` | Night Shoot: 1,000 steps after 6 PM | `steps_1k_after_6` | label-only reuse |

Per-city label override is future polish, not required for launch.

---

## Implementation & shared-system notes

- ✅ **Done in code (PR #6):** full inline `SeasonWeekConfig` for `weekNumber: 12`;
  both evidence entries; bingo Decision A; rituals on the Chicago/Detroit pattern.
  Reconciled against this pack 2026-07-18 — load-bearing copy (briefing, four
  outcomes, evidence, teaser, complication summary) matches verbatim. The
  `closeCopy.nextLead` fields are a distinct derived "next lead" line, lightly
  condensed from the evidence bodies by design (not documented separately here).
- ⚠️ **Mechanic ships as copy flavor:** **Edited Reality** — "contradictory clips, reveal metadata" is copy; no clip/metadata mechanic exists. Standard detectors + Platform Sweep.
- **Platform Sweep flavor (ships):** "Every convincing clip is a lead the unit has to check. Bureau analysts need the metadata surfaced before the real footage is buried." Platform Sweep itself is the
  unchanged shared participation-threshold operation.
- **Intentional shared defaults:** Case Closing uses generic `defaultRituals()`
  copy; the Monday-briefing Selena line is aspirational (no render field, same as
  Chicago/Detroit); `finalPush` ships one Selena line, with the projected-outcome
  distinction conveyed by the beat's `<OUTCOME> PROJECTED.` prefix.
- ⚠️ **Infra follow-ups for Codex:** DB landmark-sync migration (see landmarks
  note) and a demo "active week" fixture (the static demo shows Chicago only).
- Next-city references in the teaser and intercept clue are **flavor only** — the following week does **not** resolve them into a conspiracy (`AGENTS.md` rule #6).
- No Meridian / network / "same node" lore. The artifact is a standalone object.
