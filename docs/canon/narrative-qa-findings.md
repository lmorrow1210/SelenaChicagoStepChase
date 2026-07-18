# Season One — Narrative QA Findings (2026-07-18)

Cross-cutting narrative findings from the Weeks 2–13 content-pack finalization
pass. Companion to the per-city packs (`cities/week-*.md`) and the Week 1
usability findings (`week-01-qa-findings.md`).

**Scope of this pass:** reconcile every city pack against the shipped
`seasonOne.ts` copy, fact-check landmarks, lock canon, and surface season-wide
narrative issues. This document lists the issues that are **not** local to one
city. Ranked by priority.

---

## N1 — Selena's `— S.C.` sign-off is specified but never rendered ⚑ OWNER DECISION

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

| # | Finding | Needs |
|---|---|---|
| N1 | `— S.C.` sign-off specified but not rendered | **Owner decision** → Codex implements |
| N2 | Season reads as a connected trail | Owner awareness (recommend: leave as-is) |
| N3 | Route-doc closing-lines table superseded | Narrative fix on PR #7 branch |
| N4 | Landmark facts verified; DB seeds differ | Codex: sync migrations Weeks 2–13 |
| N5 | Voice-guide compliance | None — passes |
