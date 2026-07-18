# Implementing a City Pack (Codex handoff)

How to turn a drafted content pack in [`cities/`](cities/) into shipped code.
Each city is one bounded milestone. Do them **one at a time**, verify, then move on.

> Read first: [`season-scope.md`](season-scope.md) (rule #6 — no lore),
> [`season-one-route.md`](season-one-route.md), the city's pack, and the shipped
> **Week 1 Chicago** block in `packages/shared/src/season-one/seasonOne.ts`
> (`SEASON_ONE_CONFIG.route[0]`) as the reference implementation.

---

## What "implement a city" means

Replace that week's `structuralWeek(N, ...)` stub with a full inline
`SeasonWeekConfig`, add its two evidence entries, resolve bingo, optionally add a
demo fixture, and verify. The narrative (briefing, rituals, close copy, teaser)
is a direct transcription from the pack. Two things are **not** pure
transcription — read the gotchas below before starting.

---

## Steps

### 1. Inline config
In `SEASON_ONE_CONFIG.route`, replace `structuralWeek(N, "City", ...)` with a
full object shaped like `route[0]` (Chicago). Fill every field from the pack:
`id` (`season_one_week_0N`), `seasonId`, `weekNumber`, `cityName`,
`chapterTitle`, `complication {id,label,summary}`, `rituals`, `briefing`,
`fieldOps`, `specialOperation`, `evidence {standardEvidenceId, interceptClueId}`,
`closeCopy` (all four outcomes), `nextCityTeaser`.

- **rituals:** start from `defaultRituals("City")` and override the
  city-specific strings the pack specifies (midweek `strongPace`/`storyReveal`,
  `finalPush.selena`, `suddenDeath`, `specialOperationFiction`). Mirror how
  `WEEK_ONE_RITUALS` is built.
- **specialOperation:** reuse the `platformSweep` shape; give it a per-week `id`
  and the label the pack's complication implies.

### 2. Evidence entries (+ remove the week from the generic loop)
In `SEASON_ONE_CONFIG.evidence`:
- Add two explicit entries using the pack's IDs (`weekNN_<slug>`), with
  `title`, `body`, `basicBody`, `enhancedBody`, `highlightedFragment`, `iconKey`
  (model on the `week01_brass_dial` / `week01_access_before_entry` entries).
- **Remove that week from the `Array.from({length: …})` generic loop** that
  fabricates `weekNN_standard_evidence` / `weekNN_intercept_clue`. Decrement its
  length and adjust the `week = index + …` offset so it only covers the still-
  unimplemented weeks. Otherwise you get duplicate/orphaned evidence IDs.
- The config's `evidence.standardEvidenceId` / `interceptClueId` **must** match
  the entry IDs — `seasonOneConfig.test.ts` asserts every reference resolves via
  `getEvidence()` to the right `weekNumber`.

### 3. Verify
```bash
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" npm run test -w apps/api
NEXT_OUTPUT=export NEXT_PUBLIC_DEMO=1 NEXT_PUBLIC_BASE_PATH=/SelenaChicagoStepChase \
  NEXT_PUBLIC_API_URL=https://example.invalid npm run build -w apps/web
node scripts/contrast-audit.mjs
grep -rniE "\bmeridian\b" packages/shared/src apps/web/lib apps/web/app   # expect none
```

---

## ⚠️ Gotcha 1 — the rollover integration test hard-codes Detroit as structural

`apps/api/test/weekOneClose.integration.test.ts` currently assumes **week 2
(Detroit) is a structural stub**:
- ~L263: *"A Detroit week (structural config, no fixed codes) uses the full pool."*
- ~L365: expects the newly-activated week's evidence slot title `"SEALED EVIDENCE"`.
- ~L402: *"The new active week is Detroit (week 2)…"*

When you implement **Detroit specifically**, update these assertions to match the
real config (fixed codes present; the sealed-slot label still shows
`"SEALED EVIDENCE"` for *locked* slots, so that one likely still holds — confirm).
For weeks 3+, grep the close/rollover tests for the city before you start; add
coverage rather than leaving stale assumptions.

## ⚠️ Gotcha 2 — city-flavored bingo labels need a decision (owner call)

`fieldOps.fixedChallengeCodes` are **DB codes** from
`bingo_challenge_definitions` (append-only migrations 002/003/004/008), not free
text. The packs' "Bingo items" (e.g. `detroit_before_noon`, "Morning Climb")
**do not exist as codes yet.** Chicago fills all 24 non-free board slots with 24
shared detector codes (`steps_1k_day`, …); the guard test pins Chicago at 24.

Two ways to ship a city's board — **owner/Codex decision, note which you used:**
- **(A) Reuse the shared 24 codes** (fastest): set the city's
  `fixedChallengeCodes` to the same 24 Chicago uses. Ships the city's *narrative*
  now with generic bingo labels. City flavor in the bingo becomes a later polish.
- **(B) City-flavored board** (polish): add an **append-only** migration defining
  the city's bingo codes/labels (reuse existing `detector` JSON so no new
  detector logic), then reference those 24 codes. More work; needs 24 codes, not
  the pack's 8 — pad with shared codes.

Recommendation: ship **(A)** to get the narrative live, do **(B)** as a separate
pass once the owner confirms they want per-city bingo labels. Do **not** invent a
per-city label-override system without the owner's sign-off.

---

## Optional — demo fixture

A city only needs a full current-week demo block when you want the static demo to
*show it as the active week*. Model on the Chicago season-state block in
`apps/web/lib/demo.ts` (`seasonState`, `chase`, `primaryAction`, `primaryBeat`,
`platformSweep`, `evidencePreview`). Keep fixtures internally consistent (the
2026-07-17 audit fixed drift here) — derive chase numbers from the same inputs.
If any response shape changes, regenerate OpenAPI types
(`npm run gen:api-types -w apps/web`) so CI's byte-diff passes.

---

## Ready-to-paste Codex prompt

```
Implement Week <N> (<City>) of Season One into code.

Read docs/canon/season-scope.md, docs/canon/IMPLEMENTING-A-CITY.md, the pack
docs/canon/cities/week-<NN>-<city>.md, and the Week 1 Chicago block in
packages/shared/src/season-one/seasonOne.ts as the reference.

Do exactly the steps in IMPLEMENTING-A-CITY.md:
1. Replace structuralWeek(<N>, ...) with a full inline SeasonWeekConfig from the pack.
2. Add the two evidence entries; remove week <N> from the generic Array.from loop.
3. For bingo: use option (A) — reuse Chicago's 24 shared fixedChallengeCodes —
   unless the owner has approved option (B). State which you used.
4. Update apps/api/test/weekOneClose.integration.test.ts if it references this week
   (Gotcha 1 — definitely for Detroit).
5. Verify with the full checklist (tsc, API tests, static export build, contrast
   audit, lore grep). Do NOT add Meridian/conspiracy lore (rule #6).

Return a summary + the verification results. Do not merge.
```
