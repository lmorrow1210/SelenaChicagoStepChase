# Handoff — 2026-07-20: Land the PR stack + final integration QA

## Why this doc exists

The owner asked for a "Week 1 MVP QA and stabilization pass." Before handing that
off, I (Claude) checked current repo state and found **most of it already
happened** across several PRs merged/opened since the original ask (July 17–20).
Re-running the same checklist from scratch would duplicate finished work and
risks reverting recent fixes. This doc retargets the task at what is actually
still needed: **landing the existing PR stack, then a final QA pass on the
combined, fully-integrated result** — which nobody has verified yet.

## State snapshot (as of 2026-07-20, ~05:15)

**Live site:** https://lmorrow1210.github.io/SelenaChicagoStepChase/ (deploys on
every push to `main`; last deploy succeeded). Currently shows Week 1 Chicago +
Week 2 Detroit. Weeks 3–13 are implemented in code but **not yet merged to
main**.

**Merged to `main` already (do not re-do):**
- PR #3, #4: Week 1 Chicago + narrative canon docs + Week 2 Detroit
- PR #5 *"Week 1 MVP QA stabilization"*: real fixes to ritual overlay, Case
  Closed report, map page, weekly-phase logic, toasts — this already covers
  weekly-loop clarity and Map hierarchy findings
- PR #7, #8, #9: narrative QA/reconciliation passes on the Weeks 2–13 content
  packs (landmark fact-checks, DB-sync notes, copy corrections)
- PR #10: map declutter — steps-first hierarchy, prediction moved onto main page
- PR #12: copy clarity pass (Field Ops, onboarding, nemesis — plain language)
- PR #14: de-seasoned Evidence screen copy ("season" → "chase")

**Open, CI green, mergeable, NOT yet in main:**

| PR | Branch | Base | What it does |
|----|--------|------|---------------|
| #6 | `codex/cities-buildout` | main | Weeks 3–13 full season config (26 evidence entries, all inline) |
| #15 | `codex/season-wide-test-depth` | `codex/cities-buildout` | 13-week rollover soak test; fixes Week 13 wrap-to-Chicago bug; season-terminal state |
| #16 | `codex/demo-simulator-completeness` | `codex/season-wide-test-depth` | Demo fixtures for any week via `NEXT_PUBLIC_DEMO_WEEK`; simulator deep-links; static-export CI matrix (weeks 1/2/13) |
| #17 | `codex/quality-gates-expansion` | `codex/demo-simulator-completeness` | Playwright smoke (ritual focus trap, prediction submit, 375px overflow), axe a11y gate, Lighthouse budgets, migration integrity test |
| #11 | `codex/selena-signoff` | main (independent) | Selena sign-off rendering fix + focus handling; web Vitest in CI |
| #13 | `codex/map-declutter-hardening` | main (independent) | Prediction-lock disabled states, `--touch-min` hit areas, Vitest coverage for PR #10 |

`#6 → #15 → #16 → #17` is a **dependency stack** — land in that order. `#11` and
`#13` are independent of the stack but both touch the Map/ritual surface, so
there is real conflict/regression risk merging everything together for the
first time.

## The actual task for this session

### Part A — Land the stack (mechanical, careful)

1. Merge `#11` and `#13` into `main` first (independent, smallest blast radius).
   Re-run full verification after each.
2. Rebase/merge `main` into `codex/cities-buildout` (`#6`) to pick up #11/#13,
   resolve any conflicts (map page and ritual components are the likely
   collision points), re-verify.
3. Merge `#6` → `main`.
4. Fast-forward/merge `#15`, then `#16`, then `#17` in order (each already
   targets the next branch up the stack — after #6 lands, retarget each to
   `main` if GitHub doesn't auto-adjust the base).
5. After every merge: full verification sweep (below). Do not proceed to the
   next merge if anything regresses.

### Part B — Final integration QA (this is the real "stabilization pass")

Once everything is in `main`, run this checklist against the **fully merged
state** — not against individual PRs. This is retargeted from the owner's
original list; sections already covered by merged/landed PRs are marked so you
don't re-litigate settled findings, only verify they held after the merge.

**1. Weekly-loop clarity** — *(largely fixed by PR #5, #10, #12 — verify it held)*
- Confirm the Map still shows the group objective and primary action first.
- Confirm the "steps → Selena's lead" relationship reads clearly post-merge.

**2. Map/home hierarchy** — *(fixed by PR #10 — verify)*
- Confirm the primary-action card is still prioritized after merging #6/#11/#13.
- Confirm secondary systems (Field Ops, Nemesis, Prediction, Platform Sweep)
  are visually subordinate, not competing.

**3. Monday Briefing** — *(focus/keyboard behavior partly covered by PR #17's
Playwright "ritual focus trap" test — verify it passes post-merge, don't
re-derive from scratch)*
- Confirm skippable/reopenable, concise, CTA clear.

**4. Feature discoverability** — spot-check Field Ops, Prediction, Nemesis,
Platform Sweep are all reachable and legible from the Map, for **both** Week 1
and at least one Weeks 3–13 city (now live for the first time) via the
simulator's `NEXT_PUBLIC_DEMO_WEEK` deep-link (PR #16).

**5. Case Closed — genuinely re-verify, this has NOT been checked against the
merged result:**
- All four outcomes, Week 1.
- The Week 1 artifact (Brass Dial) and interception-only intercept clue (The
  Calling Card) unlock correctly.
- Every outcome continues to Detroit.
- **New:** with Weeks 3–13 now live, confirm at least Week 13 (the finale)
  behaves correctly — no wrap-to-Chicago (PR #15 fixed this; verify), season
  shows as complete, no dramatic reveal/lore payoff (the finale was
  deliberately softened per an owner decision on 2026-07-18 — confirm the
  "Your move" / "training to notice" strings are gone, not just from the docs
  pack but from the rendered UI).

**6. Selena voice** — *(PR #11 covers rendering; sign-off format `— S.C.`)*
- Spot-check a few lines across Week 1 and one later week for the voice guide
  rules (dry, economical, no restored lore).
- Confirm no Meridian/Bureau-conspiracy/season-arc/finale-payoff language
  anywhere in shipped copy — this rule has held through every prior pass;
  re-grep it once at the end as a final gate:
  ```bash
  grep -rniE "\bmeridian\b|bureau (conspiracy|faction|insider)" \
    packages/shared/src apps/web/lib apps/web/app apps/api/src \
    --include="*.ts" --include="*.tsx"
  # expect: no matches
  ```

**7. Trust states** — *(PR #15 added season-wide coverage — verify it passes,
this is the least-checked area pre-merge)*
- Incomplete/recalculating data never triggers Selena performance commentary.
- Final outcomes never appear before reconciliation completes.

**8. Accessibility and responsive** — *(PR #17 already built Playwright + axe +
Lighthouse budgets — run them, read the actual output, don't skip)*
- Run the CI a11y/Lighthouse jobs from #17 and read results, don't just check
  "pass" — note anything close to budget.
- Manual spot-check: keyboard nav, visible focus, `prefers-reduced-motion`,
  375px mobile overflow (PR #17 has automated coverage — confirm it's testing
  the real thing, not a stale selector).

**9. Technical validation — full sweep on the merged `main`:**
```bash
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" npm run test -w apps/api
NEXT_OUTPUT=export NEXT_PUBLIC_DEMO=1 NEXT_PUBLIC_BASE_PATH=/SelenaChicagoStepChase \
  NEXT_PUBLIC_API_URL=https://example.invalid npm run build -w apps/web
npm run gen:api-types -w apps/web && git diff --exit-code apps/web/lib/api-types.d.ts
grep -rEn '#[0-9a-fA-F]{3,8}\b' apps/web/app apps/web/lib --include='*.tsx' --include='*.ts' --exclude=brand.ts  # expect none
node scripts/contrast-audit.mjs
git diff --check
```

## Constraints (unchanged from the owner's original ask)

- Do not add major new systems.
- Do not modify the database schema unless fixing a demonstrated correctness
  issue (the landmark DB-sync gaps flagged in the Weeks 3–13 canon packs are
  pre-existing and out of scope for this pass — track separately).
- Do not implement any new city content — Weeks 2–13 are done; this pass is
  landing + verifying, not authoring.
- Do not redesign the visual system.
- Do not restore any parked lore (`docs/canon/PARKED-LORE.md` governs — read
  it if unsure whether something is in scope).
- Prefer small, high-impact fixes over rewrites. If Part B turns up a real bug,
  fix it; if it turns up a nice-to-have, note it and move on.

## Before coding

- Inspect current state of all six PRs and how they'll compose (Part A) before
  merging anything.
- Identify blockers (things that must be fixed before this can ship) separately
  from polish (things worth noting but not gating).
- State the highest-priority issues before starting fixes.

## When complete

- Commit to `codex/week-one-qa` (final integration fixes only — the stack
  merges themselves happen via the existing PRs' own merge, not new commits).
- Push the branch.
- Open a draft PR into `main`.
- Include validation results (the full sweep above, actual output not just
  "pass").
- Do not merge.
