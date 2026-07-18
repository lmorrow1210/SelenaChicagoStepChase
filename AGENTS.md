# AGENTS.md — One Step Ahead (The Search for Selena Chicago)

Working guide for coding agents (Codex, Claude, etc.). **Read this first;
`HANDOFF.md` holds the deep per-milestone history and file map.
`CODEX-HANDOFF.md` (2026-07-16) holds the current queued work + the full
Narrative DNA spec — read it before starting new feature work.**

## What this is

A web-first multiplayer fitness game: friends connect step trackers and chase
the villain Selena Chicago city-to-city on weekly step totals. npm-workspaces
monorepo:

- `apps/web` — Next.js 14 app-router frontend (React 18, styled-jsx, TanStack Query)
- `apps/api` — Express + Postgres API (vitest, zod, numbered SQL migrations)
- `packages/design-system` — tokens (CSS custom properties) + JSX components
- `packages/shared` — zod schemas shared web/api
- `SelenaDesign/` — frozen design-export reference. **Do not edit.**
- `docs/` — product spec + implementation plan (behavior source of truth)

## Verify everything with these (all must pass before you're done)

```bash
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
npm run test -w apps/api            # integration suites skip without a DB
TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" \
  npm run test -w apps/api          # full suite: 67/67 (start postgresql@16 first)
npm run build -w apps/web           # needs network (next/font Google Fonts)
node scripts/contrast-audit.mjs     # WCAG AA gate, 23/23
```

Local Postgres: `brew services start postgresql@16` (databases
`one_step_ahead_dev` / `one_step_ahead_test` already exist).

## CI gates (`.github/workflows/ci.yml`) — reproduce locally before pushing

1. Typecheck api, full api tests against postgres:16, web build.
2. **OpenAPI types sync** — any `apps/api/openapi.yaml` change must ship with
   `npm run gen:api-types -w apps/web` output committed
   (`apps/web/lib/api-types.d.ts`); CI diffs it byte-for-byte.
3. **No raw hex in app code** — grep over `apps/web/app` + `apps/web/lib`
   (`*.ts/tsx`). Use design-system tokens via `var(--…)`. The ONE exception is
   `apps/web/lib/brand.ts` (manifest/theme-color literals; the grep excludes it).
4. **Contrast audit** — `scripts/contrast-audit.mjs` must stay 23/23 and its
   PAIRS list must be updated when the palette changes.

`.github/workflows/pages.yml` deploys a static demo to GitHub Pages on every
push to main with `NEXT_OUTPUT=export NEXT_PUBLIC_DEMO=1
NEXT_PUBLIC_BASE_PATH=/SelenaChicagoStepChase`. **Trap:** the normal build
passing does NOT guarantee the export passes — a page touching the
`searchParams` prop (or any dynamic API) breaks it. Read query params with
`useSearchParams()` inside `<Suspense>` instead. Reproduce with the exact env
above. The `actions/deploy-pages` step occasionally flakes ("try again
later") — `gh run rerun <id> --failed`, no code change.

## Hard rules — never break

1. **Never log step values, tokens, or email** (PII). The structured logger
   must redact `steps`, `token`, `email`.
2. **Never call the real Health API in tests** — use `MockFitbitClient`.
3. **Never edit a shipped migration** — add new numbered ones
   (`apps/api/src/db/migrations/`).
4. **Design tokens only in frontend code** — no raw hex outside
   `packages/design-system/tokens/` (+ `lib/brand.ts`, see above).
5. **OAuth refresh tokens always encrypted** with `encryptToken()`
   (`apps/api/src/lib/crypto.ts`).
6. **Do not build the season arc** — no escalating mystery, no Meridian
   lore expansion, no season finale, no multi-week evidence conspiracy, no
   Bureau-insider payoff. The game is a weekly step competition between
   friends. Selena is a recurring villain framing device. Weeks 2–13 each
   get city flavor (chapter title, complication, bingo items, intel
   landmarks, briefing, ritual copy, outcome stories) and nothing more.
   **Authoritative scope + narrative source of truth:
   [`docs/canon/`](docs/canon/README.md)** — start with
   `docs/canon/season-scope.md`. Parked lore that must never reach shipped
   copy is quarantined in `docs/canon/PARKED-LORE.md`.

## Design system — "Field Terminal" (v4, July 2026)

A 1980s tan/brown molded-plastic field terminal housing a phosphor-green CRT.

- **Three families** in `packages/design-system/tokens/colors.css`:
  `--case-*`/`--tan-*` (chrome, frames, tan "printout" paper cards),
  `--screen-*`/`--phosphor*` (on-screen backgrounds + all telemetry/text),
  `--signal-red`/`--red-deep` (stamps, Selena/threat, urgency, city kickers —
  red must stay RARE; routine deltas are `--phosphor-dim`/`--phosphor-hot`).
- A **legacy alias block** maps every older token name (`--navy`, `--blue`,
  `--gold`, `--amber`→…) into these families. **Do not remove it.**
- **Square corners everywhere** — all radius tokens are `0` and `base.css`
  enforces `border-radius: 0 !important`. No raw px radii, no `rx=` on rects.
- **Glow rule** — body text glows (`--text-glow`); tan/paper surfaces set
  `text-shadow: none` (they're matte printouts).
- **Paper grain** — tan printout fills take `background: var(--paper-grain)
  var(--tan-200)` (feTurbulence tooth, ≤7% alpha; auto-`none` under
  `prefers-contrast: more`). **Corner brackets** — add `className="sc-corners"`
  to a bordered screen panel for drafting-style crop marks (base.css utility).
  **Case status strip** — `lib/CaseStatusStrip.tsx` is the live
  operative/week/signal readout on the desktop case lip; it reads
  `useSession()` only, keep it query-free.
- **Contrast gotcha** — Lighthouse/axe blends the 1px `--tan-300` bevel edge
  into raised faces; muted text can fail there even when the static audit
  passes. `--phosphor-dim` (#4AAB61) is tuned for this; check Lighthouse
  (`npx lighthouse <url> --only-categories=accessibility
  --chrome-flags="--headless=new"`), not just the script. Baseline: **100 on
  all 9 screens** (a11y, best-practices, SEO).
- One reset clock: `apps/web/lib/SundayCountdown.tsx` ("She vanishes in …",
  Sunday 11:59 PM). Don't add competing reset copy.

## Previewing without the backend

`echo "NEXT_PUBLIC_DEMO=1" > apps/web/.env.local` then `npm run dev -w
apps/web` — `apps/web/lib/demo.ts` fixtures back every screen and the session
auto-logs-in. **Delete `.env.local` afterwards** (it silently flips dev into
demo mode). Demo fixtures are a de-facto API contract — keep them in sync with
route changes (e.g. locked intel ships `fun_fact: null`).

## Game-specific invariants

- **Spoiler rule**: `fun_fact` is the decode reward. `/api/fieldops` returns it
  NULL for locked intel; `/api/fieldops/dossier` returns it NULL for un-carded
  catalogue slots, and the catalogue covers only cities the chase has reached.
  Tests pin this (`apps/api/test/fieldops.integration.test.ts`).
- **Dossier access**: `?user_id=` only within the viewer's group (403 outside).
- Red = Selena/threat/urgency/stamps only. Team movement = `--phosphor-hot`.
- Mobile: inputs ≥16px (iOS zoom), `--touch-min` 44px targets, safe-area on the
  TabBar, `viewport`/`themeColor`/manifest already wired in `apps/web/app/`.

## Current state (July 2026)

`main` is green: CI + Pages deploy passing, 74/74 API tests, Lighthouse 100
(a11y/BP/SEO) on all screens, WCAG audit 23/23. Live demo:
https://lmorrow1210.github.io/SelenaChicagoStepChase/

**Open work (needs the owner, not an agent):**
1. Health API live smoke test with the sandbox account, then flip
   `HEALTH_API_MODE=real` (client already written; see HANDOFF §"What is NOT done").
2. Deploy: Railway (api) + Vercel (web).
3. Physical-device QA (iOS Safari / Android Chrome).
4. Product call: Saturday sudden-death tiebreak; Selena's blue-fedora costume
   vs the green/red palette.

**Agent-workable backlog:**
- ~~Intraday auto-detectors~~ + ~~design cut-list (paper-grain, corner
  brackets, status strip)~~ — **both shipped July 2026 (M11)**, see
  HANDOFF §M11. What remains of them:
  - `RealFitbitClient.steps_by_hour` returns `null` on purpose — wire the
    hourly rollup once the owner's sandbox smoke test confirms the
    intraday endpoint shape (comment in `realFitbitClient.ts`).
  - ~~`bedtime_before` detector~~ — **shipped July 2026.** Product rule
    (confirmed 2026-07-16): a night counts only when bedtime falls
    18:00–23:59 on the calendar day BEFORE the wake-up log date; a
    post-midnight bedtime (1 A.M., 2 A.M., …) always fails, no exceptions.
    See `evaluateDetector` in `apps/api/src/services/bingo.ts` +
    `week_bedtimes` context in `bingoService.ts`.
- ~~Sunday nemesis reveal~~ — **shipped July 2026 (M12)**. Migration `006`
  adds `weeks.status = 'scheduled'` plus one-active/one-scheduled partial
  indexes; Sunday cron prepares next week's row + nemesis pairings, and Monday
  rollover flips `scheduled → active` while keeping prediction/badge/tiebreak
  close-out on Monday after full Mon–Sun data. `/api/nemesis/current` reads the
  Sunday reveal; Map/Field Ops/Prediction stay on the active week.
- ~~Narrative DNA N1 Beat Engine~~ — **shipped July 2026 (M13)**. Migration
  `007` adds beat definitions/events and `notifications.kind='beat'`; cron
  evaluates deterministic day beats, week rollover evaluates near-miss week
  beats, and Sunday nemesis reveal sends Selena intercepts. Beat notifications
  render as paper calling-card toasts; demo fixtures include a beat.
