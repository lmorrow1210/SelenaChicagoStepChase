# Season One — Narrative QA Findings (2026-07-18)

Cross-cutting narrative findings from the Weeks 2–13 content-pack finalization
pass. Companion to the per-city packs (`cities/week-*.md`) and the Week 1
usability findings (`week-01-qa-findings.md`).

**Scope of this pass:** reconcile every city pack against the shipped
`seasonOne.ts` copy, fact-check landmarks, lock canon, and surface season-wide
narrative issues. This document lists the issues that are **not** local to one
city. Ranked by priority.

---

> ✅ **Decisions received (owner, 2026-07-18):**
> **N1 — resolved: render the sign-off.** Option (A) accepted — append `— S.C.`
> in the `SelenaLine` component. **Codex implements** (small follow-up branch,
> per the recommended plan; reconcile the component's existing leading `— ` at
> the same time).
> **N6 — resolved: soften the finale.** Owner: "we aren't doing a dramatic game
> ending." Option (B) applied — the softened Week 13 copy now lives in
> `cities/week-13-san-francisco.md` (pack updated 2026-07-18); **Codex applies**
> the matching `seasonOne.ts` string changes on `codex/cities-buildout` (exact
> old→new strings posted on PR #6). N2's connected-trail flavor stays as-is.

## N1 — Selena's `— S.C.` sign-off is specified but never rendered ⚑ RESOLVED — render it (see decision note above)

**What:** Every city pack and the `season-one-route.md` closing-lines table show
Selena's lines with a trailing `— S.C.` sign-off, and `selena-voice-guide.md`
states the convention is binding ("All lines are sign-off `— S.C.`"). But:

- **0 of 118** `selena:` strings in `seasonOne.ts` contain `S.C.` (verified by grep).
- The `SelenaLine` component (`apps/web/lib/narrative/RitualOverlay.tsx`) renders a
  **leading** `— ` before the line and appends **nothing** — so the product shows
  `— <line>` with no `S.C.` attribution anywhere.

**Impact:** the sign-off that the canon treats as part of Selena's voice does not
appear in the shipped experience, on any beat (Case Closed, teaser, midweek,
final push, sudden death), for any of the 13 weeks.

**Two ways to resolve — owner call:**
- **(A, recommended)** Honor the convention: append `— S.C.` in the `SelenaLine`
  component (one place, applies everywhere, keeps the config strings clean).
  Codex would reconcile the component's existing leading `— ` at the same time
  (likely drop the leading dash and render the line as `"<line>" — S.C.`).
  Rationale: the voice guide makes the sign-off binding, and it reinforces Selena
  as a distinct character voice against Bureau system text.
- **(B)** Decide the styling (red italic + leading dash) *is* the attribution and
  the explicit `S.C.` is an authoring convention only. Then the packs and the
  route doc should stop showing `— S.C.` so canon doesn't imply it ships.

**Owner lane:** this is a design decision. **Codex lane:** implementation once
decided. Not changed in this pass (neither product code nor a mass pack rewrite)
because it needs the owner's call first.

---

## N2 — The season reads as a connected breadcrumb trail (scope check) ⚑ OWNER AWARENESS

**What:** The next-city teasers and intercept clues form a continuous thread that
hands off week to week:

> dial → routing diagram → convergence map → redacted charter → custodian ledger
> → identity cascade → continuity protocol → missing square → rhythmic key →
> override frequency → alignment chart → composite record → final record

Each week's briefing opens by explicitly picking up the prior week's teaser (e.g.
Detroit's "freight bridge above the Monongahela" → Pittsburgh's "freight signal on
the Monongahela rail bridge"). Verified: the teaser→briefing handoff is coherent
for all 12 transitions.

**Why it's flagged:** `season-scope.md` bars "a 13-piece evidence arc" and asks for
"one standalone artifact per week, no connective lore." This chain sits right on
that line. It stays **within** scope — each artifact is a standalone object (not a
piece of one meta-object), each week resolves independently across its four
outcomes, and the finale explicitly refuses a conspiracy payoff — but it reads as
a richer connected pursuit than "flavor skin on identical loops."

**Recommendation:** no change; this is well-executed and on the right side of the
line. Flagged only so the owner is aware the season has more connective tissue
than a strict reading of the scope doc implies. If the owner wants it looser, the
lever is the intercept clues (which carry the most forward-pointing weight).

---

## N3 — `season-one-route.md` closing-lines table is superseded (canon drift)

**What:** `season-one-route.md` carries a "two lines per city (fall short / close)"
Selena closing-lines table. The shipped reality is **four distinct lines per city**
(`trail_lost` / `pursuit_maintained` / `close_encounter` / `interception`). The
two-line table predates the full four-outcome buildout and no longer matches what
ships.

**Status:** Week 2's row was flagged in PR #7. The whole table should be marked
superseded and point to the per-city packs as the source of truth (maintaining a
parallel copy table invites exactly this drift). Recommend not duplicating
canonical copy across two files.

**Lane:** narrative (mine), but the file is edited by PR #7 — any fix belongs on
that branch to avoid a conflict.

---

## N4 — Landmark data + fact-check status (infra handoff)

All landmark fun facts for Weeks 2–13 were fact-checked against authoritative
sources during this pass. **One correction:** Savannah's Cathedral of St. John the
Baptist twin spires are ~214 ft (was "nearly 210 ft"). The packs are now the
fact-checked source of truth.

**Infra handoff (Codex):** migration 009 seeded placeholder landmark sets that
differ from the finalized packs for **every city 2–13**. Each needs an additive
`UPDATE landmarks … FROM (VALUES …)` sync migration (pattern: Detroit's
`010_detroit_landmarks_sync.sql` in PR #7). Do not delete or alter schema.

---

## N6 — Finale copy delivers a season-long thematic payoff ⚑ RESOLVED — softened (see decision note at top)

**What:** Week 13's evidence — both tiers — reads as a retrospective on the whole
season, and the interception note lands an explicit reframe:

- Standard (`THE FINAL RECORD`, enhanced): "A record of the whole pursuit —
  thirteen cities, closed in one hand. Where the final entry should be, there is
  only a note: 'Your move.'"
- Intercept (`THE LAST NOTE`, enhanced): "You were never chasing a thief. You were
  training to notice. Until the next city. — S.C."

Read with the connected teaser chain (N2), several intercept clues carry a
premeditation undertone that this finale resolves — W3 "drawn before the trails
were ever walked," W6 "an hour before the sightings it *triggered*," W12
"timestamped after the record claims the chase ended," → W13 "you were never
chasing a thief."

**Why it's flagged:** `season-scope.md` (authoritative) bars "a season finale
reveal," "any deepening… that pays off across weeks," and "one standalone
artifact per week, no connective lore." The finale copy is a *thematic/character*
payoff — it names **no** Meridian, conspiracy, or network, and "Until the next
city" is soft/open — so it does not touch the parked lore. But it is the single
place the shipped copy most clearly delivers a cross-week payoff.

**Internal-doc tension:** `selena-voice-guide.md` describes Selena as "secretly
leading its operatives toward a truth they were never meant to discover," which
*supports* the "training to notice" reframe. `season-scope.md` says it wins over
other docs. So the two canon documents point different directions here, and the
owner should reconcile which governs the finale.

**Options — owner call:**
- **(A)** Keep as-is: accept a thematic (non-lore) finale payoff as the intended
  emotional beat. Defensible — it names no barred lore and is interception-gated.
- **(B, strict scope)** Soften the two W13 enhanced bodies so the finale reads as
  "chase complete, she got away clean, open-ended" without the retroactive
  "you were being trained" reframe. Minimal change: drop "You were never chasing a
  thief. You were training to notice." and "thirteen cities, closed in one hand /
  'Your move.'" in favor of a flatter close. This is a one-pack + one-config edit
  (`week-13-san-francisco.md` + the two `week13_*` evidence entries).

**Not changed in this pass** — it's the finale's emotional payload and a
deliberate authored choice (pack = code); rewriting it is an owner creative call,
not a reconciliation fix.

---

## N5 — Voice-guide compliance (pass)

No violations found across 118 Selena strings:
- **No exclamation points** in Selena's voice (guide rule).
- **Sentence length:** four lines run to four sentences (DC close-encounter, Austin
  interception, LA interception, SF season-close). All are climax beats using
  short emphatic fragments ("Note it." / "Rest."), within the guide's "rarely more
  / occasional fragments for emphasis" allowance. Not flagged as violations.
- **All 65 outcome + teaser Selena lines are unique** — no accidental repetition
  across cities.

---

## Summary for the owner

| # | Finding | Status |
|---|---|---|
| N1 | `— S.C.` sign-off specified but not rendered | ✅ Decided: render it → **Codex implements** |
| N2 | Season reads as a connected trail | ✅ Owner aware — stays as-is |
| N3 | Route-doc closing-lines table superseded | ✅ Fixed on PR #7 branch |
| N4 | Landmark facts verified; DB seeds differ | ✅ Codex shipped migrations 010/011 (incl. 214-ft fix) |
| N5 | Voice-guide compliance | ✅ Passes |
| N6 | Finale delivers a season-long thematic payoff | ✅ Decided: softened — pack updated; **Codex syncs `seasonOne.ts`** |
