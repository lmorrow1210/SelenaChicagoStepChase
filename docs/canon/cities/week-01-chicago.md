# Week 1 — Chicago: The Lakefront Job

**Status:** SHIPPED — this pack documents production copy in `seasonOne.ts`  
**Implements:** `SEASON_ONE_CONFIG.route[0]` in `packages/shared/src/season-one/seasonOne.ts`  
**Role:** Reference implementation. This is the worked example the `_template.md`
and all later city packs are modeled on.

> ✅ **Lore-softening copy pass applied 2026-07-17.** The Meridian component
> reference, the "Chicago node" vocabulary, and the Bureau-insider intercept
> clue have been removed from shipped copy to match the scope decision
> (`AGENTS.md` #6). This pack reflects the current shipped strings. See
> "Copy pass — what changed" at the bottom for the before/after.

---

## Chapter identity

| Field | Value |
|---|---|
| Chapter title | The Lakefront Job |
| City | Chicago |
| Complication | Cold Start |
| Complication summary | The team begins with incomplete surveillance. Completing the first qualifying Field Ops line identifies Selena's real departure route. |
| Selena's signature move this week | Uses Chicago's grid and elevated lines to disguise her direction |
| Next city | Detroit |

---

## Briefing

**Label:** BUREAU FIELD BRIEFING  
**Title:** CASE 01: THE LAKEFRONT JOB

**Body (3 paragraphs):**

> At 4:18 AM, Selena Chicago entered a sealed infrastructure chamber beneath the city.
>
> Eleven minutes later, a sealed brass component was missing.
>
> She was last seen moving toward the elevated lines. Your unit has been assigned to recover the component before she leaves Chicago.

**Supporting cards:**

| Card | Title | Body |
|---|---|---|
| field_ops | FIELD OPS | Complete operations to improve the pursuit and uncover city intel. |
| prediction | PREDICTION | Estimate how far the team will get before the case closes. |
| nemesis | NEMESIS | Outwalk your assigned rival in a five-day duel. |

**Primary CTA:** Begin the pursuit  
**Secondary CTA:** Review assignment

---

## Complication — Cold Start

**Label:** Cold Start  
**First line payoff:** The unit identifies Selena's departure platform.  
**First movement payoff:** Your route confirms Selena is using Chicago's grid to disguise her direction.

---

## Field Ops — Intel landmarks

> **Note:** Chicago's Field Ops board "scouts ahead" — the intel tiles preview
> the *next* city (Detroit), not Chicago itself. The landmark fun-fact copy is
> driven by demo fixtures / the fieldops service, not the `seasonOne.ts` route
> config. This pack documents the narrative config that lives in `seasonOne.ts`.
> When editing intel landmark copy, see `apps/web/lib/demo.ts` and the
> fieldops integration tests. Detroit's five landmarks are authored in
> `week-02-detroit.md`.

---

## Ritual copy

Chicago overrides two ritual strings on top of the shared `defaultRituals`
(via `WEEK_ONE_RITUALS`). Only the Chicago-specific overrides are shown here;
everything else uses the shared defaults.

### Monday briefing

Uses the standard briefing surface (see Briefing above). Primary directive on
open: **REVIEW ASSIGNMENT → Open the Week 1 field briefing.**

### Midweek update — strong pace (Chicago override)

**Headline:** THE GAP IS CLOSING  
**Body:** {{groupName}} erased {{gapClosedPercent}}% of Selena's lead in the first two days.\n\nSurveillance now places her near the elevated lines.  
**Selena:** "You are moving quickly. I wonder whether you are watching the right train."  
**CTA:** Review the new lead

### Midweek update — story reveal (Chicago override)

**Headline:** DEPARTURE ROUTE CONFIRMED  
**Body:** Selena boarded a northbound train—but exited before the next confirmed camera sighting.\n\nInvestigators recovered a partial image of a brass dial marked with thirteen positions.

### Midweek — other states (shared defaults)

- **Expected pace:** "PURSUIT MAINTAINED / The unit remains on pace to keep Selena within reach." — Selena: "Adequate. The Bureau does enjoy an adequate performance."
- **Recovery needed:** "THE TRAIL IS COOLING / The unit is currently projected to lose contact before Sunday."
- **Incomplete data:** "FIELD REPORTS INCOMPLETE / The Bureau cannot calculate a reliable pursuit estimate until trackers respond." *(Selena silent — data rule)*

### Final push

**Label:** FINAL PUSH  
**Selena:** "You are close enough to become inconvenient."

### Sudden death

**Headline:** SUDDEN DEATH  
**Body:** Today decides the matchup. Most verified steps by midnight wins.

### Case closing

**Headline:** CASE CLOSING  
**Body:** Final field reports are being reconciled.  
**Supporting:** This may update the group's pursuit result, nemesis matchups, and Oracle award.

### Special operation fiction (Platform Sweep)

> Bureau analysts have narrowed Selena's route to three elevated platforms. The unit must cover all exits before she changes lines.

---

## Special Operation — Platform Sweep

Participation-threshold operation, active Friday–Saturday (days 5–6).

| Field | Value |
|---|---|
| Label | Platform Sweep |
| Minimum verified steps per player | 2,000 |
| Tier 1 | 40% of players contribute → +1% |
| Tier 2 | 60% contribute → +2% |
| Tier 3 | 80% contribute → +3% |

---

## Case Closed outcomes

### Trail Lost (< 70% progress)

**Headline:** TRAIL LOST  
**Story:** The unit reached the elevated line after Selena's signal disappeared. Surveillance could not confirm which route she took out of the city.  
**Selena:** "You searched the streets. You should have searched beneath them."  
**Next lead:** A matching mechanical signature has appeared in Detroit.

### Pursuit Maintained (70–89%)

**Headline:** PURSUIT MAINTAINED  
**Story:** {{groupName}} confirmed Selena's departure route and kept her within operational range. She left Chicago before the unit reached the platform.  
**Selena:** "You found the route. Not the reason."  
**Next lead:** A mechanical dial marked with thirteen positions. One position is engraved with Chicago's coordinates.

### Close Encounter (90–99%)

**Headline:** CLOSE ENCOUNTER  
**Story:** The unit reached the correct platform moments after Selena's train departed. A red glove was recovered beside the track.  
**Selena:** "Another platform. Another minute. That was the difference."  
**Next lead:** The Brass Dial shows recent use and fresh tool marks.

### Interception (≥ 100%)

**Headline:** SELENA INTERCEPTED  
**Story:** {{groupName}} reached Selena before the train cleared the platform. For seventeen seconds, the pursuit was over.\n\nThe lights failed. When power returned, Selena was gone.  
**Selena:** "Seventeen seconds. That is the closest anyone has come to me. Remember the feeling — it does not repeat often."  
**Next lead:** A calling card was recovered with the Brass Dial.

---

## Evidence

**Standard evidence ID:** `week01_brass_dial`  
**Intercept clue ID:** `week01_access_before_entry`

| Field | Standard (Brass Dial) | Intercept clue (The Calling Card) |
|---|---|---|
| Title | THE BRASS DIAL | THE CALLING CARD |
| Basic body | A mechanical dial marked with thirteen positions was recovered near the sealed chamber beneath the city. | *(intercept clues only unlock on interception)* |
| Standard body | A mechanical dial marked with thirteen positions. One position is engraved with Chicago's coordinates. | Left at the chamber entrance: a card showing one footprint set ahead of another. On the back, one handwritten line — 'You are faster than they told me.' |
| Enhanced body | The Brass Dial shows recent use, fresh tool marks, and one position engraved with Chicago's coordinates. | *(same as standard)* |
| Highlighted fragment | *(none)* | "You are faster than they told me." |
| Icon key | dial | card |

> **Note:** The evidence *ID* stays `week01_access_before_entry` (internal slug,
> referenced by the intercept-unlock logic and persisted unlocks) — only the
> displayed title/body/icon changed. Don't rename the ID.

---

## Next-city teaser (Detroit)

**Header:** NEXT: DETROIT  
**Body:** A manufacturing system dormant for decades has restarted without an operator. Its mechanical signature matches the dial recovered in Chicago.  
**Selena:** "Bring the dial. You will understand it when the machine starts."  
**CTA:** Continue the pursuit

---

## Field Ops fixed challenge codes (shipped)

Chicago ships the full 24-code board (`fieldOpsCodes` in `seasonOne.ts`). These
are shared mechanical challenges, not city-specific bingo flavor — later cities
can substitute city-flavored labels over the same underlying detectors.

```
steps_1k_day · steps_5k_day · steps_10k_day · target_50pct_day ·
target_100pct_day · steps_2k_two_days · steps_any_three_days · steps_12k_day ·
steps_8k_day · weekly_steps_15k · steps_1k_noon · steps_1k_after_6 ·
split_shift_1k · active_500_five_days · active_nonzero_seven_days ·
assist_sent · assist_received · unit_mobilized_50pct · full_team_report_sync ·
take_long_way · eyes_up · walk_with_someone · choose_longer_route · workout_today
```

---

## Copy pass — what changed (2026-07-17)

Applied to remove Meridian / Bureau-conspiracy lore per the scope decision
(`AGENTS.md` hard rule #6). Changed in `seasonOne.ts` and the pinning test
`apps/api/test/weekOneClose.integration.test.ts`.

| Location | Before | After |
|---|---|---|
| Briefing ¶2 | "a Meridian component was missing." | "a sealed brass component was missing." |
| Brass Dial basic body | "…recovered near the Chicago node." | "…recovered near the sealed chamber beneath the city." |
| Interception — Selena | "Someone opened the Chicago node before I did. Ask your Bureau why." | "Seventeen seconds. That is the closest anyone has come to me. Remember the feeling — it does not repeat often." |
| Interception — next lead | "Access Before Entry was recovered with the Brass Dial." | "A calling card was recovered with the Brass Dial." |
| Intercept clue — title | ACCESS BEFORE ENTRY | THE CALLING CARD |
| Intercept clue — body | "A surveillance photograph shows a credentialed Bureau figure entering the Chicago node before Selena arrived…" | "Left at the chamber entrance: a card showing one footprint set ahead of another. On the back, one handwritten line — 'You are faster than they told me.'" |
| Intercept clue — highlight | "before Selena arrived" | "You are faster than they told me." |
| Intercept clue — icon | credential | card |

**Rationale for the intercept-clue reframe:** the old clue's entire content was
the Bureau-insider conspiracy. Replaced with Selena's calling card (defined in
the character bible as "one footprint ahead of another") — it keeps an
intriguing interception-only reward, stays in her voice, and points at nothing
that needs to pay off later.

**Not changed:** the evidence IDs (`week01_brass_dial`,
`week01_access_before_entry`) are internal slugs and stay as-is. The "thirteen
positions" dial detail stays — it maps to the 13-city route, which is in scope.

### Legacy docs still carrying old copy (not updated)

These predate the content-pack structure and now contradict shipped code. Left
as historical background under the spec's scope notice; not authoritative:
- `docs/one-step-ahead-new-chat-handoff.md`
- `docs/week-one-chicago-reference-experience.md`
