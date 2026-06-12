# Selena's Chase — Handoff (Claude Code → Fable, June 2026)

Repo: `/Users/lindseymorrow/SelenaChicagoStepChase`
Branch: `main` — clean, all work committed, all tests green.
Owner: lmorrow1210@gmail.com

---

## Source of truth (read these before touching anything)

| File | Purpose |
|---|---|
| `docs/selenas-chase-spec.md` | Product spec — final word on feature intent |
| `docs/implementation-plan.md` | Master roadmap: architecture §1, schema §2, API spec §3, screen trees §4, module acceptance criteria §6 |
| `docs/selenas-chase-design-system-prompt.md` + `SelenaDesign/` | All visual decisions — tokens, components, screens. Consume, don't rebuild. |

---

## Hard rules — never break these

1. **Never log step values, tokens, or email** (PII rule). Structured logger must redact `steps`, `token`, `email`.
2. **Never call the real Health API in tests** — use `MockFitbitClient` from `src/services/fitbitClient.ts`.
3. **Never edit a shipped migration** — add new numbered ones.
4. **All frontend code uses design-system tokens only** — no raw hex or magic numbers outside `packages/design-system/tokens/`.
5. **OAuth refresh tokens always encrypted** with `encryptToken()` from `src/lib/crypto.ts`.

---

## Baseline verification (run these first, all must pass)

```bash
npm run test -w apps/api
# Expected: 33 passed, 11 skipped (integration tests skip without TEST_DATABASE_URL)

# With local Postgres (see "Local Postgres" below) ALL tests run:
TEST_DATABASE_URL="postgres://localhost:5432/selenas_chase_test" npm run test -w apps/api
# Expected: 44 passed, 0 skipped

npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
# Expected: no output (both exit 0)

npm run build -w apps/api
npm run build -w apps/web
# Expected: both succeed
```

### Local Postgres (installed June 2026 session)

PostgreSQL 16 is installed via Homebrew on this machine. The server is NOT a
launchd service — start it manually (the LC_ALL is required or postgres
refuses to boot):

```bash
LC_ALL="en_US.UTF-8" /opt/homebrew/opt/postgresql@16/bin/pg_ctl -D /opt/homebrew/var/postgresql@16 -l /tmp/pg16.log start
```

Databases that exist: `selenas_chase_test` (integration tests; suites reset it),
`selenas_chase_dev` (manual smoke testing; migrations applied, has leftover
smoke data — safe to drop and recreate). CI runs the full suite against a
postgres:16 service container, so the 11 integration tests gate every push.

---

## Git log (current state)

```
fe00d19 Fix production bugs surfaced by first real integration run; run integration tests in CI
489bc08 M9: notifications API, toast shelf, week summary + unlock + badge notifications, arrival confetti, reduced-motion
11c6085 M1: full 5-step onboarding wizard
2800084 M8 sync pipeline: real Health API client, hourly cron, 429 backoff, invalid_grant handling
6e0af6b Update HANDOFF.md: M6/M7/M8-rollover complete, next steps + new gotchas
0df13cb M8 week rollover: full Monday 00:00 transaction + integration tests
6a10619 M7 Profile & Badges: stats/badges endpoints, full profile screen, migrate StatCard/Badge/Slider to ESM
9223a90 chore: ignore tsbuildinfo build artifacts
e869237 M6 Nemesis: pairing persistence, day-close service, current/reroll routes, sync wiring, Nemesis screen
96dca33 Design-system: migrate SkyscraperPair to ESM imports + default export
503da8c Update HANDOFF.md: full state snapshot for Fable handoff
c9b65d4 M4 complete + M5 Bingo: week-close scoring, bingo persistence, API routes, Bingo screen
66bfc5a Modules 1-4: Google OAuth, design-system ESM migration, Map/City/Prediction screens
3df94a6 Game engines: prediction scoring, bingo card/lines/detector engine, nemesis pairing+scoring — pure functions, 25 tests green
783fe0a API: mock Fitbit client + idempotent sync service + rate-limited /api/sync/run stub
b8a4a24 API: users routes, first-week creation service (tz-aware), CI workflow; update HANDOFF
a757b24 Web: Next.js scaffold with AppShell, session context, typed API client, design-system package
c0b05f6 API: session auth, token crypto, error envelope, group routes + tests; save implementation plan
664798a Module 0 groundwork: monorepo scaffold, DB migrations, shared schemas, handoff doc
a219593 init: add docs and README
```

---

## What is complete

### Infrastructure (M0)
- Monorepo: npm workspaces — `apps/api` (Express 4, TS), `apps/web` (Next.js 14 App Router), `packages/shared` (zod schemas + constants), `packages/design-system` (tokens + components).
- DB migrations: `001_init.sql` (full schema), `002_seed_cities.sql` (3 cities × 7 landmarks, 10 badge defs, 18 bingo challenge defs).
- CI: `.github/workflows/ci.yml` — typecheck + api tests + web build.

### Auth (M1 — mostly complete)
- Google OAuth: `GET /api/auth/google` redirect, `GET /api/auth/google/callback` (id_token verify, upsert by `google_sub`, encrypt refresh token with `encryptToken`, redirect new→`/onboarding`, returning→`/map`).
- `DELETE /api/auth/fitbit` (revoke token + clear).
- `POST /api/auth/dev-login` (non-production only) + login UI.
- `GET /api/auth/session`, `POST /api/auth/logout`.
- Full 5-step onboarding wizard at `/onboarding/[step]` (see M1 section below).

### Design-system (M0/M1)
- All game components migrated from `window.React` / `window.DesignSystem_19034b` shim to ESM imports + default exports: `Button`, `Input`, `EmptyState`, `Skeleton`, `Avatar`, `MapPin`, `ProgressStrip`, `LandmarkTile`, `CityBadge`, `PredictionCard`, `BingoTile`, `Sidebar`, `TabBar`, `Icon`, `SkyscraperPair`, `StatCard`, `Badge`, `Slider`.
- **Not yet migrated: `Card`, `CountdownPill`** (still on `window.*` — nothing imports them; migrate when first used). `Toast` was migrated for M9.
- `SkyscraperPair` gained an optional `max` prop — normalizes tower heights to a supplied value (the Nemesis screen passes group `weekMax`) instead of the pair max.
- Fonts via `next/font/google` (Barlow Condensed, DM Sans, DM Mono). `@import` removed from design-system.

### Map + Leaderboard (M2)
- `GET /api/weeks/current` — full composed payload: week, current/next city, route, progress strip, leaderboard (with delta vs last week), countdown, lastSyncedAt, state (in_progress / closing_soon / arrival).
- `POST /api/sync/run` — rate-limited 1/10min, mock Fitbit client, runs unlock + bingo detection.
- Map screen: route pins, group stats, progress strip, leaderboard, no-group empty state, lastSyncedAt pill.

### City + Landmarks (M3)
- `GET /api/cities/current` — city + 7 landmarks with states (locked/unlocked/today) + group workout status.
- `services/unlocks.ts: detectUnlocks(db, groupId, date, triggeringUserId)` — when all group members have ≥1 workout for date D, the day-N landmark unlocks. Idempotent upsert on `city_unlocks`.
- City screen: landmark grid (3-2-2), group workout status with avatars, unlock logic wired.

### Prediction (M4 — complete)
- `GET /api/predictions/current` — week, myPrediction, others (hidden until reveal), liveGroupTotal, state (pending / partial / revealed / final).
- `POST /api/predictions` — one-per-week via DB unique constraint → 409 `PREDICTION_EXISTS`.
- Reveal logic: all submitted OR Monday noon (group tz).
- Prediction screen: globe background, DM Mono input, lock-in flow, waiting/revealed/final states.
- **`services/weekClose.ts: closeWeekPredictions(db, weekId)`** — sums actual step totals, calls `scorePredictions`, writes `actual_delta`/`is_winner` to all predictions, stamps `weeks.status='closed'` + `group_total_steps` + `target_hit`. Idempotent. Used by M8 rollover.

### Bingo (M5 — complete)
- **`services/bingoService.ts`**:
  - `createOrGetBingoCard(db, weekId, userId)` — generates 24-tile category-balanced card + free space, persists to `bingo_cards`. Idempotent.
  - `updateBingoCard(db, weekId, userId, date)` — evaluates every tile's detector JSON against day-scoped + week-scoped metrics (steps, workouts, sleep, AZM, HR zones, streak, rank, hot pursuit), recomputes `bingo_lines`/`blackout`. Skips frozen cards. Completed tiles never revert.
- `GET /api/bingo/current` — card with tiles enriched with label + icon, bingo_lines, blackout, frozen, plus friends progress.
- `GET /api/bingo/friends` — all group members' bingo progress.
- Bingo detection wired into `POST /api/sync/run` (after unlock detection).
- Bingo screen: 5×5 grid, status pill (lines / blackout / frozen), friends list.

### Game logic engines (all unit-tested, M4/M5/M6 core)
All in `apps/api/src/services/`:
- `prediction.ts: scorePredictions(entries, actualTotal)` — min delta wins; tie → earliest `submitted_at`.
- `bingo.ts: generateCard`, `countBingoLines`, `isBlackout`, `evaluateDetector` — 25-tile card generation + 5+5+2 line detection + full detector evaluation.
- `nemesis.ts: decideDay`, `tallyScore`, `weekOutcome`, `pairPlayers` — Mon–Fri best-of-5; Saturday sudden death on 5-way tie.

### Nemesis (M6 — complete)
- **`services/nemesisService.ts`**:
  - `pairAndPersist(db, weekId, groupId)` — random pairs via `pairPlayers`, idempotent. **Bye = no row** (locked decision: a member with no `nemesis_matchups` row for the week is the bye).
  - `closeDayForMatchup(db, matchupId, date)` — decides the day, upserts into `daily_results` (re-close replaces the entry, idempotent), retallies scores, advances status: 5 weekday results → outcome; 5-day tie → `status='tiebreak'` + `tiebreaker_date`=Saturday; Saturday non-tie result → complete. No-op once complete.
  - `closeElapsedDays(db, matchupId, todayLocal)` — closes every day before today (Mon–Sat); called from `/api/sync/run` after bingo detection as the stand-in for the M8 midnight cron.
- `GET /api/nemesis/current` — lazily pairs on first request of the week; returns `{ matchup, you, nemesis, week, today, weekMax, outcome, state }`; state ∈ active/tiebreak/complete/bye/no_matchup (`no_matchup` = group has <2 members).
- `POST /api/nemesis/reroll` — one per matchup (409 `REROLL_USED`); re-pairs with a random unpaired member (the bye player), old opponent becomes bye; 409 `REROLL_UNAVAILABLE` if nobody is unpaired.
- Nemesis screen: ScoreBar, Mon–Fri SkyscraperPair skyline normalized to `weekMax` (done/today/future states, today animates), TodayContextStrip, winner/tiebreak banners, bye + no-matchup empty states, reroll button.

### Profile & Badges (M7 — complete)
- `GET /api/users/me/stats` — `{ total_steps_alltime, total_steps_this_week, city_wins, bingo_lines_alltime, current_streak }` (streak = consecutive most-recent closed weeks with a `city` badge).
- `GET /api/badges` — earned badges joined with definitions + city name.
- Profile screen: 120px avatar showcase, stats row (all-time steps as km in DM Mono), badge grid with bronze/silver/gold borders, settings panel (target slider with explicit Save, sync now with 429 handling, disconnect Fitbit, sign out), avatar editor modal (skin/hair/colorway swatches, live preview, PATCH /api/users/me).

### Week rollover (M8 — complete)
- **`services/weekRollover.ts: weekRollover(pool, weekId)`** — single transaction, rolls back on failure, idempotent on rerun:
  1. `closeWeekPredictions` + `prediction_win` badge
  2. City badge to step leader (quality by unlock count 0–2 bronze / 3–5 silver / 6–7 gold, only if `target_hit`) + `streak_3/6/12`
  3. Nemesis: closes Mon–Fri + Saturday tiebreak, force-completes unresolved matchups by weekly step total (dead-even = draw, no winner), `nemesis_victor` badge
  4. Freezes bingo cards; `bingo` / `blackout` / `perfect_week` / `hot_pursuit` badges
  5. Next week at next `route_order` (wraps to first city), target = Σ member targets, fresh bingo cards, new pairings
- `test/weekRollover.integration.test.ts` — 3 integration tests (full rollover, idempotency, route wrap).

### Sync pipeline + cron (M8 — complete)
- `lib/backoff.ts` — `withBackoff` exponential + full jitter (1s→32s cap, 5 tries), unit-tested against a mocked 429 storm.
- `services/realFitbitClient.ts` — refresh-token flow via google-auth-library, in-process access-token cache (never persisted), 401 → refresh → retry once (second 401 = `InvalidGrantError`), partial sync (sleep/heart optional, steps required). **⚠ endpoint base `health.googleapis.com/v4` still needs verification against Google's docs + the sandbox account before first production sync (plan §5 flag). This file is the only touchpoint.**
- `services/cron.ts` — hourly tick aligned to top of hour (`startCron`, armed in index.ts, `DISABLE_CRON=1` opt-out); groups synced at local noon/6pm/midnight (`localClock` is unit-tested); noon re-pulls yesterday; midnight closes yesterday (sync → unlocks → bingo → nemesis); Monday 00:00 group-local runs `weekRollover`; per-user failures never abort the batch; `invalid_grant` → `fitbit_connected=false` + alert notification.
- `services/clientFactory.ts` — process-wide client shared by the sync route and cron: real in production, mock elsewhere, `HEALTH_API_MODE=real|mock` overrides.

### Onboarding (M1 — complete)
- `/onboarding/[step]` wizard: connect (Fitbit status, Google OAuth link, skip-for-now) → target (slider + daily readout) → avatar (live-preview editor) → group (create/join). Index redirects to `/onboarding/connect`. Step-dot progress indicator.

### Notifications & polish (M9 — mostly complete)
- `GET /api/notifications` (latest 20, unread first) + `POST /api/notifications/read` (ids or all).
- `ToastShelf` in `Providers` polls unread notifications (60s + window focus), renders the design-system `Toast` (achievement gold / social blue / alert red), auto-marks read after 8s or on dismiss.
- Notification producers: first-time landmark unlocks (group-wide, xmax=0 freshness guard), newly-earned badges, week-closure summary (social, all members, only on the run that created the next week).
- Arrival confetti + banner on the Map when `state='arrival'`; hidden under `prefers-reduced-motion`. SkyscraperPair rise also gated.
- **Remaining M9 items (manual/QA):** responsive QA on iOS Safari + Android Chrome, Lighthouse a11y ≥ 95, full reduced-motion audit of older screens.

### Tests (44 total, all green in CI against postgres:16 service)
- `test/engines.test.ts` — 11 unit tests covering all engine functions above.
- `test/lib.test.ts` — 7 unit tests for invite codes, AES-256-GCM crypto, JWT session.
- `test/week.test.ts` — 4 unit tests for DST-safe week boundary math.
- `test/fitbitClient.test.ts` — 3 unit tests for MockFitbitClient fixture behavior.
- `test/backoff.test.ts` — 8 unit tests: 429 backoff + cron scheduling helpers.
- `test/groups.integration.test.ts` — 5 (incl. admin removal + nemesis re-pair), `test/predictions.integration.test.ts` — 3, `test/weekRollover.integration.test.ts` — 3 (all run when `TEST_DATABASE_URL` is set; suites share the DB so vitest `fileParallelism` is off; `test/helpers/db.ts` resets + applies every migration).

### Production bugs found & fixed by the first real integration run (June 2026)
These had never been caught because the integration tests had never executed anywhere:
1. **pg DATE parsing** — node-postgres returned `DATE` columns as JS `Date` objects while the entire codebase compares them as `YYYY-MM-DD` strings. Net effect: the prediction submission window NEVER opened (always 409) and `GET /api/predictions/current` 500'd. Fixed globally in `db/pool.ts` with `pg.types.setTypeParser(DATE, v => v)`. **Don't remove that parser.**
2. **Bingo seed too small** — `generateCard` requires 24 distinct challenges; 002 seeded 18. Migration `003_more_bingo_challenges.sql` adds 8 (pool = 26).
3. **`closeWeekPredictions`** reused `$2` in two type contexts → Postgres "inconsistent types deduced for parameter $2". Fixed with explicit `::int` casts.

A full end-to-end smoke (dev-login ×2 → group → sync → nemesis day-close → reroll 409 → stats/badges/bingo → `weekRollover`) was run against `selenas_chase_dev` and behaved correctly, including notifications.

---

## What is NOT done — next tasks in priority order

1. **Verify the real Health API** (plan §5 flag): confirm endpoint base/paths/scopes against Google's docs with a sandbox account; adjust `realFitbitClient.ts` (single touchpoint). Until then production must run `HEALTH_API_MODE=mock`.
2. **Deploy**: Railway (api) + Vercel (web) per locked decisions; env vars: `DATABASE_URL`, `JWT_SECRET`, `TOKEN_ENC_KEY`, `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI`, `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL`.
3. **M9 manual QA**: responsive iOS Safari + Android Chrome, Lighthouse a11y ≥ 95, reduced-motion audit of M2–M4 screens.
4. **Plan §3 stragglers** (nice-to-have): past-city trophy view polish, OpenAPI yaml + generated client. (Done: `GET /api/predictions/history`; `DELETE /api/groups/me/members/:userId` with nemesis re-pair — leave re-pairs too; raw-hex CI gate on app code; global reduced-motion kill rule in tokens/effects.css.)
5. **Confirm with Lindsey**: Saturday sudden-death tiebreak (plan §10 flag) before real users.

---

## Key file map (most-touched areas)

```
apps/api/src/
  routes/
    auth.ts         Google OAuth, dev-login, session, logout
    groups.ts       create, join, me, leave
    users.ts        GET/PATCH /api/users/me, GET /api/users/me/stats
    sync.ts         POST /api/sync/run (unlock + bingo + nemesis day-close)
    weeks.ts        GET /api/weeks/current
    cities.ts       GET /api/cities/current
    predictions.ts  GET/POST /api/predictions/current
    bingo.ts        GET /api/bingo/current, /friends
    nemesis.ts      GET /api/nemesis/current, POST /reroll
    badges.ts       GET /api/badges
  services/
    prediction.ts   scorePredictions (pure, unit-tested)
    bingo.ts        generateCard, evaluateDetector (pure, unit-tested)
    bingoService.ts createOrGetBingoCard, updateBingoCard (DB-backed)
    nemesis.ts      decideDay, tallyScore, weekOutcome, pairPlayers (pure, unit-tested)
    nemesisService.ts  pairAndPersist, closeDayForMatchup, closeElapsedDays
    weekClose.ts    closeWeekPredictions (DB-backed)
    weekRollover.ts weekRollover — full Monday transaction (nothing calls it yet)
    sync.ts         syncUserDay, syncUserToday
    unlocks.ts      detectUnlocks
    week.ts         weekMonday, weekSunday, createFirstWeek
    fitbitClient.ts FitbitClient interface + MockFitbitClient
  db/migrations/
    001_init.sql    full schema (never edit)
    002_seed_cities.sql  3 cities × 7 landmarks + defs (never edit)

packages/design-system/components/
  game/        Avatar, BingoTile, CityBadge, LandmarkTile, MapPin,
               PredictionCard, ProgressStrip, SkyscraperPair — all migrated
  navigation/  Sidebar, TabBar  — migrated
  core/        Button, StatCard, Badge — migrated; Card, CountdownPill — NOT yet (unused)
  forms/       Input, Slider     — migrated
  feedback/    EmptyState, Skeleton, Toast — migrated
  icons/       Icon              — migrated

apps/web/app/
  (auth)/login/page.tsx         Google link + dev-login form
  onboarding/page.tsx           simple create/join (not full 5-step)
  (game)/
    layout.tsx                  Sidebar + TabBar shell
    map/page.tsx                Map + Leaderboard (M2) ✓
    city/page.tsx               City + Landmarks (M3) ✓
    prediction/page.tsx         Prediction (M4) ✓
    bingo/page.tsx              Bingo (M5) ✓
    nemesis/page.tsx            Nemesis duel (M6) ✓
    profile/page.tsx            Profile & Badges (M7) ✓
```

---

## Design-system component migration template

Every component still using `window.*` needs this exact treatment (remaining: `Card`, `CountdownPill` — both currently unused):

```diff
-const React = window.React;
+import * as React from 'react';

 // inside the component, replace:
-const { Icon } = window.DesignSystem_19034b;
+import { Icon } from '../icons/Icon.jsx';

 // at the bottom of the file, add:
+export default ComponentName;
```

In the matching `.d.ts`, add `export default ComponentName;` at the end.

---

## Decisions already locked (don't re-litigate)

- REST over GraphQL; Express on Railway; Next.js on Vercel.
- Bingo tiles server-detected only — no write endpoint for tile state.
- Week boundaries use `groups.timezone`; sync 3×/day (noon/6pm/midnight group-local).
- Nemesis 5-day tie → **Saturday sudden death** (confirm with Lindsey before M6 ships — flagged in plan §10).
- Notifications v1 in-app only (no email/push).
- Landmark content: curated text in DB + illustrated static assets.
- `bingo_cards.tiles` and `nemesis_matchups.daily_results` are denormalized JSONB on purpose.

---

## Recommended execution order for the next session

All feature modules (M0–M9) are built. See "What is NOT done" above — the
remaining work is Health-API verification, deployment, and manual QA, none of
which is automatable from this machine alone.

---

## Gotchas accumulated across sessions

- `localDateParts` / `zonedTimeToUtcIso` helpers are duplicated in `weeks.ts` and `predictions.ts`. Future cleanup: consolidate into `services/week.ts` (but don't do it mid-feature — it breaks things).
- `syncUserToday` returns the local date string so the sync route can pass it to `detectUnlocks` and `updateBingoCard`. Don't change that return type.
- `updateBingoCard` skips tiles that are already `complete` — this is intentional and correct.
- `bingo_cards` has a `UNIQUE (week_id, user_id)` constraint — `createOrGetBingoCard` uses `ON CONFLICT DO UPDATE SET tiles = bingo_cards.tiles` (i.e., a no-op on conflict) which is safe.
- The `Avatar` component takes `colorway` (a preset name like `"chicago"`) not numeric `skin`/`hair` indices. Use `COLORWAYS[((n-1) % 6)]` to map DB integers to colorway names.
- `EmptyState` props: `body` (not `message`), `action` is a `ReactNode` (not `{label, href}`).
- `Skeleton` props: `preset` (`"bingo"` | `"landmark"` | `"leaderboard"` | `"block"`), not `height`/`width`.
- pg returns `DATE` columns as JS `Date` objects (local-midnight) — naive `.toISOString().slice(0,10)` can shift a day. Services that do date arithmetic select dates with `to_char(col, 'YYYY-MM-DD')` instead (see `nemesisService.ts`, `weekRollover.ts`).
- There is no `--red-20` or `--scrim` token. Use `--red-12` for tinted red backgrounds and `color-mix(in srgb, var(--navy) 70%, transparent)` for modal scrims (`--card-elevated` for the modal surface, `--z-overlay` for z-index).
- `nemesis_matchups` bye convention: **no row** for the bye player. `GET /api/nemesis/current` distinguishes `bye` (≥2 members, no row) from `no_matchup` (<2 members).
- Reroll swaps you with the bye player; your old opponent becomes the bye. In an even-sized group with no bye it 409s `REROLL_UNAVAILABLE`.
