# One Step Ahead — Handoff (deep history & file map)

> **Agents start with [`AGENTS.md`](AGENTS.md)** — the compact working guide
> (rules, gates, commands, current state). This file is the detailed
> per-milestone record it links into.

Repo: `/Users/lindseymorrow/SelenaChicagoStepChase`
Branch: `main` — clean, all work committed, all tests green.
Owner: lmorrow1210@gmail.com

---

## Source of truth (read these before touching anything)

| File | Purpose |
|---|---|
| `docs/one-step-ahead-spec.md` | Product spec — final word on feature intent |
| `docs/implementation-plan.md` | Master roadmap: architecture §1, schema §2, API spec §3, screen trees §4, module acceptance criteria §6 |
| `docs/one-step-ahead-design-system-prompt.md` + `SelenaDesign/` | All visual decisions — tokens, components, screens. Consume, don't rebuild. |

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
# Expected: 42 passed, 25 skipped (integration tests skip without TEST_DATABASE_URL)

# With local Postgres (see "Local Postgres" below) ALL tests run:
TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" npm run test -w apps/api
# Expected: 67 passed, 0 skipped (July 2026, M11)

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

Databases that exist: `one_step_ahead_test` (integration tests; suites reset it),
`one_step_ahead_dev` (manual smoke testing; migrations applied, has leftover
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

### Design-system v2 — "vintage detective" re-skin (June 2026)
The whole app was re-skinned to the Claude Design v2 system (Carmen
Sandiego / vintage-detective aesthetic). Source export lives in `SelenaDesign/`.
- **Tokens** (`packages/design-system/tokens/`): v2 palette — `--tobacco`/`--felt`/
  `--mahogany` surfaces, `--parchment`/`--linen`/`--dust` text, `--selena`
  (Chicago sky blue) accent, `--gold`/`--brick`/`--slate`, plus CRT (`--crt-*`)
  and putty-casing (`--casing-*`) tokens for the sidebar. **Hard-edge chrome**:
  all radii are `0` except `--r-avatar` (50%); bevel border-color shorthands
  (`--bevel-raised`/`--bevel-inset`) and hard-offset shadows replace soft blurs.
- **Legacy aliases**: `colors.css` maps every v1 token to a v2 value
  (`--navy`→tobacco, `--blue`→selena, `--cream`→parchment, `--red`→brick, etc.),
  and `base.css` keeps the `sc-pulse-blue` keyframe alias. This is why the ~50
  components/pages that still reference v1 token names re-skinned automatically —
  **do not remove the alias block.** New code should prefer the v2 names.
- **Fonts** via `next/font/google`: **Press Start 2P** (`--font-display`, pixel,
  weight 400 only), **Barlow Condensed** (`--font-body`), **VT323** (`--font-mono`,
  CRT). `@import` removed; loaded in `apps/web/app/layout.tsx`.
- **Components ported to v2** (visuals): `TabBar`/`Sidebar` (spy-terminal + bevel
  chrome; NAV preserves Prediction-on-Map + "Destination" tab), `BingoTile`,
  `ProgressStrip`, `MapPin` (merged with the current/next/visited/upcoming
  variants + `cityName` silhouettes), `CityBadge` (bevel quality rings; keeps all
  38 landmark icons + `getCityIcon()`).
- **A11y**: re-ran the contrast audit under the new palette (`scripts/contrast-audit.mjs`,
  30/30 AA pass). Lightened `--dust` (#8A7050→#AD8C64) and `--crt-dim`
  (#1A7A1A→#229F22); BingoTile free space is Selena-blue with a tobacco glyph.
  Re-added the M9 reduced-motion global kill block that the v2 export had dropped.

### Design-system v3 — UX/density pass + sharp corners (July 2026)
A consistency/density pass over every game screen. See git log for the commit.
- **Spacing**: added `--space-2xs … --space-2xl` in `tokens/spacing.css` (kept `--sp-*`).
  Shared page pattern (`max-width: var(--content-max)` = 1120px, centered,
  `padding-inline: var(--space-lg)`, content-height) applied to Map, Field Ops,
  Prediction, Nemesis, Trophy. `min-height: 100dvh` kept only on login/onboarding
  (centered wizard gates).
- **Sharp 90° corners everywhere**: all radius tokens `0`; global
  `*{border-radius:0 !important}` safety rule in `base.css`; every raw px radius,
  `50%`, and SVG `<rect rx>` stripped from components.
- **One reset clock**: `SundayCountdown` is the single source ("She vanishes in …",
  Sunday 11:59 PM). Removed "Resets …", "She moves in", "Arriving now"; "Sealed
  until Sunday" → "…Sunday 11:59 PM".
- **Prediction** rebuilt: unfiled state = big slider + synced numeric input +
  amber DM-Mono readout + teammate-preview chips + `FILE FORECAST` + stake copy;
  filed chart = horizontal range track with staggered labels, a `current`
  live-total marker, and a compact legend fallback when pins collide.
- **Field Ops**: `BingoTile` has 4 states (available/complete/free/gifted); assist
  is a corner badge only; objective-family icons keyed off `category`; board uses
  `minmax(0,1fr)` tracks + `min-width:0` panels (fixes mobile overflow).
- **Nemesis**: one hero `SkyscraperPair` for today + a compact Mon–Fri `WeekLedger`
  (replaces five stacked cards).
- **Map**: postcard carries the city name; small `[ LAST CONFIRMED SIGHTING ]`
  line; dashed intel `RouteVector` with a pulsing leading dot + legend;
  `sentence()` helper fixes "D.C..". Leaderboard: pressed-bevel + accent left-rule
  for the current user; ▲/▼ deltas.

### Design-system v4 — "Field Terminal" palette (July 2026)
Full palette overhaul away from grey. **Tan/brown molded-plastic chrome housing a
phosphor-green CRT screen; red reserved for stamps/threat/urgency/city-kickers.**
- **Three token families** in `tokens/colors.css`: `--case-*`/`--tan-*` (chrome,
  frames, paper cards), `--screen-*`/`--phosphor*` (on-screen bg + telemetry),
  `--signal-red`/`--red-deep` (stamps + critical). `--phosphor-glow` is an rgb
  triplet for `rgba(var(--phosphor-glow), …)` glows. **The legacy alias block
  remaps every v1/v2/v3 name into these three families — do not remove it**; that's
  why unported components re-skinned for free.
- **Effects** (`tokens/effects.css`): tan bevels (`--tan-300` highlight +
  `--case-shadow` groove), `--screen-inset` (recessed CRT), `--text-glow`.
- **Glow rule**: `base.css` gives body a phosphor `text-shadow`; **paper/tan
  surfaces set `text-shadow: none`** (LandmarkCard, LandmarkTile, CallingCard, Map
  postcard). If you add a tan "printout", set `textShadow: 'none'` on it.
- **Chrome**: Sidebar/TabBar are molded tan chassis (top-lit `--tan-300→--tan-500`
  vertical gradients) with an inset green CRT well; active nav = `--screen-600`
  fill + glowing `--phosphor-hot`. Scanline+vignette overlay `.sc-screenFx` in the
  game layout is scoped to the screen area and gated off for
  `prefers-reduced-motion`/`prefers-contrast: more`.
- **The case (July 2026 polish pass)**: on desktop the screen sits recessed in a
  fixed tan bezel frame (`.sc-caseFrame`, content scrolls under it) with an
  engraved `MODEL OSA/86` line on the lip; the sidebar carries a matching
  engraved model plate + fasteners. The screen background has a faint phosphor
  radial ambience. All chassis fiction is `aria-hidden`. Mobile stays full-bleed
  (the phone is the bezel). Primary/danger Buttons render as lit keys (bright
  top lip, dark seat, matte text, pressed-in click state).
- **Red discipline (§5)**: routine leaderboard/ledger deltas are `--phosphor-dim`
  (neg) / `--phosphor-hot` (pos); red only on stamps, Selena/threat, live urgency
  ("BEHIND TODAY", vanish timer), and landmark city kickers.
- **Nemesis towers**: YOU = `--phosphor`, rival = `--tan-500`, windows
  `--case-shadow`; winner gets crown + `--phosphor-hot` edge + glow.
- Grep gates (all pass): zero `--ink-*/--amber*/--vector/--bone/--manila`, zero old
  greys (`#0C0F14` `#FFB020` `#37D3C4` `#05080C` …), no `border-style: outset/inset`,
  no raw px radii.
- **Preview**: set `NEXT_PUBLIC_DEMO=1` in `apps/web/.env.local` (gitignored) to
  click through every screen without the API; delete after.

### Map + Leaderboard (M2)
- `GET /api/weeks/current` — full composed payload: week, current/next city, route, progress strip, leaderboard (with delta vs last week), countdown, lastSyncedAt, state (in_progress / closing_soon / arrival).
- `POST /api/sync/run` — rate-limited 1/10min, mock Fitbit client, runs unlock + bingo detection.
- Map screen: route pins (4 variants: current=blue glow, next=red, visited=gold-tinted, upcoming=ghost), group stats, progress strip, leaderboard, no-group empty state, lastSyncedAt pill. Each pin renders the city's landmark silhouette when available.

### City + Landmarks (M3)
- `GET /api/cities/current` — city + 7 landmarks with states (locked/unlocked/today) + group workout status.
- ~~`services/unlocks.ts: detectUnlocks(...)`~~ — the M3 all-members-worked-out unlock rule was retired by M10 (scout economy drives unlocks) and the dead file was deleted July 2026.
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

### Tests (45 total, all green in CI against postgres:16 service)
- `test/engines.test.ts` — 11 unit tests covering all engine functions above.
- `test/lib.test.ts` — 7 unit tests for invite codes, AES-256-GCM crypto, JWT session.
- `test/week.test.ts` — 4 unit tests for DST-safe week boundary math.
- `test/fitbitClient.test.ts` — 3 unit tests for MockFitbitClient fixture behavior.
- `test/backoff.test.ts` — 8 unit tests: 429 backoff + cron scheduling helpers.
- `test/groups.integration.test.ts` — 5 (incl. admin removal + nemesis re-pair), `test/predictions.integration.test.ts` — 3, `test/weekRollover.integration.test.ts` — 3, `test/cities.integration.test.ts` — 1 (trophy view: 403/404/200 paths) (all run when `TEST_DATABASE_URL` is set; suites share the DB so vitest `fileParallelism` is off; `test/helpers/db.ts` resets + applies every migration).
- **Time-of-day flake fixed (June 2026):** the predictions suite used to pin groups to `America/Chicago`, so the Monday-noon reveal fired early whenever tests ran after local noon. `createGroupWithWeek` now picks a fixed-offset `Etc/GMT±N` zone where it's currently mid-morning. If a new test depends on "before reveal" semantics, reuse `preNoonTimezone()` from that file.

### Production bugs found & fixed by the first real integration run (June 2026)
These had never been caught because the integration tests had never executed anywhere:
1. **pg DATE parsing** — node-postgres returned `DATE` columns as JS `Date` objects while the entire codebase compares them as `YYYY-MM-DD` strings. Net effect: the prediction submission window NEVER opened (always 409) and `GET /api/predictions/current` 500'd. Fixed globally in `db/pool.ts` with `pg.types.setTypeParser(DATE, v => v)`. **Don't remove that parser.**
2. **Bingo seed too small** — `generateCard` requires 24 distinct challenges; 002 seeded 18. Migration `003_more_bingo_challenges.sql` adds 8 (pool = 26).
3. **`closeWeekPredictions`** reused `$2` in two type contexts → Postgres "inconsistent types deduced for parameter $2". Fixed with explicit `::int` casts.

A full end-to-end smoke (dev-login ×2 → group → sync → nemesis day-close → reroll 409 → stats/badges/bingo → `weekRollover`) was run against `one_step_ahead_dev` and behaved correctly, including notifications.

---

### M10 "Field Ops" — merged screen + scout economy (July 2026, addendum)
The One Step Ahead master brief + addendum landed a full rebrand, the
"Midnight Dossier" visual system, and a gameplay re-architecture:
- **Rebrand**: One Step Ahead / The Search for Selena Chicago ("She's
  always one step ahead."). Package scope @one-step-ahead/*; CI DB
  one_step_ahead_test. GitHub repo/folder name + Pages basePath still
  SelenaChicagoStepChase (rename together when ready).
- **Nav is 4 screens**: Map · Field Ops · Prediction · Nemesis.
  /fieldops merges City+Bingo (Ops Board = cause, recon Trail =
  effect; drone animation on new lines). /bingo + /city redirect;
  /city/[id] trophies remain. Prediction is standalone again.
- **Scout economy** (migration 004 + scoutService): 5 recon landmarks
  per city, always ONE CITY AHEAD (getReconCity wraps the route).
  BINGO lines = scout tokens; team unlocks pace ≤1/day with
  per-player caps (2 for ≥3 groups, 3 for pairs, uncapped solo);
  overflow beyond 5 → forecast-edge bonus. The old
  all-members-worked-out unlock rule is retired from sync/cron
  (services/unlocks.ts is now unused by the pipeline).
- **Objective pool = 52** (13 honor-system) across
  steps/workout/sleep/heart/social/wildcard/strength/cardio/recovery/
  hydration. Weekly cards are a SHARED base (seededRand(weekId)) with
  per-player accessibility substitutions (users.objective_prefs +
  groups.disabled_categories; onboarding "objectives" step + profile
  admin toggles).
- **The Dossier** (renamed from "Intel Wallet", July 2026 — /dossier,
  GET /api/fieldops/dossier, teammate view via ?user_id= gated to the
  same group with 403 otherwise): the scout who pops a landmark keeps
  the card; revisits mint a CONFIRMED holo variant. **Gift-a-Tile**
  (POST /api/fieldops/gift): 2 assists/week, giver must have completed
  the tile. **Honor tiles** (POST /api/fieldops/honor): dashed-ring
  mark, tap to self-report.
- **Spoiler rule** (July 2026): `fun_fact` is the decode reward — the
  API ships it as NULL for locked intel nodes and un-carded dossier
  catalogue slots (was leaking to any authenticated client). Also
  fixed: /api/fieldops 500'd on every call against a real DB
  (ambiguous bare `id` in the weeks JOIN groups query — caught by the
  first HTTP-level integration run).
- Tests: 59 green incl. test/scout.integration.test.ts (pacing, caps,
  shared cards, substitutions, gifts, honor, intel cards) and
  test/fieldops.integration.test.ts (HTTP payloads, fun_fact
  encryption, dossier access control).
- All four /api/fieldops routes are documented in openapi.yaml with
  ScoutState/IntelNode/DossierCard schemas; types regenerated.
- ~~**Known gaps**: new auto detectors
  steps_before/steps_after/workout_day_streak/sleep_nights stay
  incomplete until the Health API intraday context is wired~~ — **done
  July 2026 (M11), see below.**

### M11 — intraday detectors + design cut-list (July 2026, overnight session)

**Intraday bingo auto-detectors are live** (67 tests, up from 59):
- Migration `005_intraday_steps.sql`: `step_logs.steps_by_hour JSONB` —
  a 24-int array (index = local hour), NULL = no intraday data that day.
- `DayMetrics.steps_by_hour`: `MockFitbitClient` buckets its day total
  through a fixed waking-day profile (`hourlySplit`, exported + tested —
  sums exactly, deterministic, quiet 00:00–05:00); **`RealFitbitClient`
  returns `null` deliberately** — the v4 docs only confirm the daily
  rollup surface, so wire the hourly rollup after the sandbox smoke test.
  Null buckets mean intraday tiles stay incomplete, never false-fire.
- `evaluateDetector` implements `steps_before` / `steps_after` (sum of
  hourly buckets before/after `detector.hour`), `workout_day_streak`
  (ctx from a SQL streak query in `updateBingoCard`, same rows-present
  semantics as `daily_target_streak`), and `sleep_nights` (N nights this
  week ≥ `detector.hours`, ctx = the week's `sleep_minutes` rows).
- **Bug fixed in passing**: `sleep_minutes` with `window:"weekend_day"`
  ('8+ hours on a weekend night') used to fire on ANY day; it now
  requires the log's weekday to be Sat/Sun (a night belongs to its
  wake-up morning). Unit + integration covered.
- ~~Still stubbed: `bedtime_before`~~ — **shipped 2026-07-16** after the
  product call landed: a night qualifies only when bedtime falls
  18:00–23:59 on the calendar day BEFORE the wake-up log date
  (post-midnight bedtimes always fail; afternoon outliers are treated as
  nap/bad data). `detector.nights` = qualifying nights needed this week.
  Context plumbing: `week_bedtimes` (log_date + bedtime per synced night)
  built in `updateBingoCard` from the same query as `week_sleep_minutes`.
  Unit-covered in `test/engines.test.ts` (68 API tests total now).
- New suite `test/bingoIntraday.integration.test.ts`: sync persistence of
  the buckets (incl. NULL), end-to-end tile completion through the real
  SQL context, and the no-intraday negative case.

**Design cut-list shipped** (all three items from the July polish pass):
- Paper-grain: `--paper-grain` token (tokens/effects.css) — an inline-SVG
  feTurbulence tint at ≤7% alpha, layered as the background-image over
  tan fills on LandmarkCard (both variants incl. the confirmed
  gradient-border trick), LandmarkTile, CallingCard, map postcard.
  Collapses to `none` under `prefers-contrast: more`.
- Corner brackets: `.sc-corners` utility (tokens/base.css) — 8-layer
  gradient crop marks inset 3px on the panel's ::after; applied to map
  console/routeSection/leaderboard, fieldops board/intelPanel,
  predictionPanel, championPanel. Hidden under `prefers-contrast: more`.
- Live status strip: `apps/web/lib/CaseStatusStrip.tsx` on the bottom
  case lip (desktop only), left of the model engraving:
  `OPERATIVE: <name> · WK OF <mm.dd> · SIGNAL: LOCK <hh:mm>` (or
  SEARCHING / NO CARRIER) with a phosphor signal dot. Data from
  `useSession()` only — no new queries. `aria-hidden` like the rest of
  the chassis fiction (every fact is announced properly in-screen).
- Verified: Lighthouse a11y 100 (map/fieldops/dossier), contrast 23/23,
  no overflow at 390, strip hidden on mobile, tsc + both builds green.

**Professional-UX pass (same overnight session, second wave):**
- **Demo toast bug fixed**: `demoMutation` now takes (path, body) and
  flips `read` on the notifications fixture — before this the public
  demo showed the same two "unread" toasts forever on every screen.
  Fixtures stay in-memory: a fresh visit gets its toasts back once.
- **Sidebar flyout**: the rail owns a fixed 60px of layout and the
  hover/focus-expanded panel overlays the screen instead of reflowing
  the entire page. Gotcha for later: `position: sticky` creates a
  stacking context, so the host (`.sc-sidebarHost`) carries
  `z-index: var(--z-nav)` — the nav's own z-index cannot rise above
  later siblings. Sidebar also expands on keyboard focus now.
- **Login rebuilt** as a mini field terminal (tan case, CRT well with
  scanlines + tube vignette, Selena mugshot with AT LARGE stamp,
  mission brief, lit-key button with hover/pressed states) — it was the
  last v1-styled screen and the demo's front door.
- **Terminal scrollbars** (base.css): `scrollbar-color` + webkit rules
  so Windows/Linux scrollbars match the CRT.
- **Per-screen document titles** (game layout effect) and a
  **route-change CRT settle** ((game)/template.tsx, fade + phosphor
  flare, killed under reduced motion).
- **Nemesis pacing strip** cells use fluid clamp() type so the red
  "BEHIND TODAY" line holds one line on phones (copy unchanged).
- Build gotcha hit tonight: running `npm run build` while `next dev`
  is serving corrupts `.next` (dev 500s afterwards) — stop the dev
  server or delete `.next` before rebuilding dev.

### M12 — Sunday nemesis reveal (July 2026)

**A1 shipped: next week's nemesis is revealed on Sunday without moving any
week-close scoring off Monday.**
- Migration `006_sunday_nemesis_reveal.sql`: widens `weeks.status` to
  `scheduled | active | closed`, replaces the active-week index with a unique
  one-active-per-group partial index, and adds a unique scheduled-week partial
  index.
- `prepareNextWeekReveal` in `services/weekRollover.ts`: creates next week's
  row as `scheduled` and runs `pairAndPersist` against it. It is idempotent, so
  repeated Sunday cron ticks do not duplicate weeks or matchups.
- `weekRollover` now activates an existing scheduled week on Monday
  (`scheduled → active`) after closing the old active week. Predictions, city
  badges, bingo freeze/badges, nemesis close-out, and weekly-total fallback all
  still run Monday after full Mon–Sun data.
- `cron.ts`: every Sunday sync tick checks for the active week ending that day
  and prepares the reveal. Monday 00:00 still runs the full rollover.
- `/api/nemesis/current`: on Sunday, if tomorrow's scheduled week exists, it
  returns that revealed matchup with top-level `state: "scheduled"`. Other
  active-week routes (Map, Field Ops, Prediction, Sync, Profile) stay anchored
  to `status = 'active'`.
- `groups.ts`: leaving/removing a member now repairs both active and scheduled
  nemesis matchups, so a Sunday preview cannot keep pointing at someone who has
  left the group.
- Demo + contract updated: `apps/web/lib/demo.ts` shows the scheduled reveal,
  OpenAPI includes `scheduled`, and `apps/web/lib/api-types.d.ts` was
  regenerated.
- Tests: API suite is now **71/71**. New coverage proves scheduled reveal
  creation, Sunday cron idempotency, and Monday activation of the scheduled
  week.

### M13 — Narrative DNA N1 Beat Engine (July 2026)

**First deterministic story layer shipped: real events now create in-fiction
beat notifications.**
- Migration `007_narrative_beats.sql`: adds `beat_definitions` and
  `beat_events`; widens `notifications.kind` to include `'beat'`; seeds the
  starter beat set plus `sunday_nemesis_reveal`.
- `services/beats.ts`: deterministic trigger evaluation and rendering. Copy
  variants are chosen with `seededRand(...)`, and every fired beat is recorded
  in `beat_events` before delivery. The uniqueness constraint uses
  `UNIQUE NULLS NOT DISTINCT` so group-scope beats with `user_id = NULL` are
  truly idempotent under Postgres.
- Daily hook: `cron.ts` evaluates day-scope beats after sync → bingo/scout →
  nemesis day-close. Priority chooses at most one group beat and one user beat
  per player per date, with cooldown checks.
- Weekly hook: `weekRollover.ts` evaluates week-scope beats after
  `closeWeekPredictions` has stamped `group_total_steps` and `target_hit`.
- Sunday reveal hook: `prepareNextWeekReveal` now sends user-scope Selena
  intercepts naming each paired nemesis for the scheduled week.
- Frontend: `ToastShelf` renders `kind='beat'` as a tan paper calling-card
  intercept instead of a normal alert/social toast. Demo fixtures include a
  beat notification.
- Starter beats implemented: `near_miss_week`, `weak_day`,
  `target_blowout`, `hot_pursuit_streak`, `nemesis_flip`, `streak_broken`,
  `sudden_death_eve`, and `sunday_nemesis_reveal`.
- Tests: API suite is now **74/74**. Coverage includes pure trigger rules,
  cron idempotency for day beats, and Sunday reveal beat creation.

### M14 — Week 1 Chicago vertical slice stabilized (July 17, 2026)

**Week 1 is implemented and verified on `codex/week-one`; PR #3 still needs
human review/merge.**
- Preserved Claude's local vertical-slice WIP in commit
  `9f5a9ee WIP: implement Week 1 vertical slice`.
- Finished the remaining demo/OpenAPI cleanup in
  `d714085 Finish Week 1 demo contract`, pushed to `origin/codex/week-one`.
- Week 1 architecture now uses shared production logic for chase math,
  weekly phases, data confidence, primary action, primary beat, and Platform
  Sweep tiers. The web simulator imports those shared calculators and the
  production narrative components, not API source files.
- Migration `008_week_one_narrative.sql` adds Week 1 narrative persistence,
  ritual views, Season Evidence unlocks, and fixed Week 1 Field Ops challenge
  definitions. Migration `009_season_one_route.sql` adds the 13-city Season
  One route.
- `/api/weeks/current` now returns the full `seasonState` contract:
  chapter metadata, phase, data confidence, chase calculation, primary action,
  primary beat, Platform Sweep, evidence preview, ritual views, previous case,
  and sync confidence.
- New routes: `/api/evidence` for the Season Evidence Board and
  `/api/rituals/view` for persisted ritual views.
- Rollover finalizes Week 1 outcomes, unlocks evidence, and supports late-sync
  reconciliation without duplicating rewards/evidence. Tests cover rollover
  idempotency, late-sync correction, Platform Sweep tiers, evidence unlocks,
  and all four final outcomes.
- Production surfaces compile: Map/home, Monday Briefing, Midweek Update,
  Final Push, sudden death treatment, Case Closing, Case Closed report,
  Evidence Board, Field Ops/Prediction/Nemesis narrative copy, and simulator.
- Static demo fixtures now include the full Week 1 current-week contract plus
  `/api/evidence`; `test/demoFixture.test.ts` guards this so Pages cannot drift
  from the API contract silently.
- OpenAPI was tightened so required Week 1 fields are required in generated
  web types; `apps/web/lib/api-types.d.ts` was regenerated.
- Verification on the finished branch:
  - `TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" npm run test -w apps/api`
    → **153/153 passed**.
  - API and web typechecks passed.
  - Normal web build passed.
  - Static Pages export passed with
    `NEXT_OUTPUT=export NEXT_PUBLIC_DEMO=1 NEXT_PUBLIC_BASE_PATH=/SelenaChicagoStepChase NEXT_PUBLIC_API_URL=https://example.invalid`.
  - OpenAPI generated types were stable after regeneration.
  - Raw-hex frontend policy passed.
  - Contrast audit passed **23/23**.

### M15 — Season One content-complete + launch prep (Oct 16–17, 2026)

State at end of this session (nothing below was pushed to `main`; `main` is
still `e1ea2eb`):

- **Weeks 1–2 are on `main`; Weeks 3–13 are in open PRs.** Six PRs are open,
  all green on CI, all mergeable:
  - **#6** `codex/cities-buildout` — Weeks 3–13 fully implemented (inline
    configs, 26 explicit evidence entries, migration `011` landmark sync).
    Bingo uses option A (shared 24 codes) for every city.
  - **#15** `codex/season-wide-test-depth` (base: #6) — 13-week rollover soak,
    outcome matrix, canon-vs-DB landmark drift guard.
  - **#16** `codex/demo-simulator-completeness` (base: #15) — demo fixtures
    and `/dev/week-simulator` cover all 13 weeks.
  - **#17** `codex/quality-gates-expansion` (base: #16) — Playwright smoke +
    axe + Lighthouse CI job, static-export matrix (weeks 1/2/13).
  - **#11** `codex/selena-signoff` — renders "— S.C." on Selena ritual lines.
  - **#13** `codex/map-declutter-hardening` — prediction input/slider hardening.
- **Merge-ability proven locally:** a throwaway `integration` branch (local
  only, not pushed; HEAD `2c0449c`) merged all six with zero semantic
  conflicts. Only conflict: `apps/web/package.json` + `package-lock.json`
  between #13 and the others (union the devDeps `react-test-renderer`,
  `@types/react-test-renderer`, `vitest`; regenerate the lockfile with
  `npm install`, never hand-edit). Result: API 178/178, web vitest 9/9,
  tsc/contrast/raw-hex/OpenAPI-sync/lore-grep all clean, static export
  builds. The Playwright/Lighthouse job could not run in the sandbox (browser
  download blocked) — rely on GitHub CI.
- **Merge order + mechanics:** #6 → #15 → #16 → #17, then #11 and #13 in any
  order. Use **merge commits, not squash**, for the stack; after each merge
  retarget the next PR's base to `main` (or let GitHub auto-retarget when the
  base branch is deleted). Squashing #6 forces
  `git rebase --onto main <old-#6-tip> <branch>` + force-push for each
  downstream PR.
- **`launch-prep` branch** (pushed, no PR yet, commit `8e34031`): adds
  `docs/LAUNCH-RUNBOOK.md` (Google Cloud setup, env vars, Railway/Vercel
  steps, cross-domain cookie notes, device QA checklist, rollback),
  `apps/api/scripts/health-smoke.ts` (`npm run smoke:health -w apps/api`;
  prints status codes / key names / counts only, never values, tokens, or
  email), and root `engines.node >=22.18`. `realFitbitClient.ts` had
  `accessToken`/`fetchImpl` loosened from private to protected so the script
  can inject a token — no behavior change.

**Review findings still open (from the six-agent audit):**

| Sev | Item | Where |
|---|---|---|
| Fix before merge | #17's `browser-quality` job uses Node 20; Lighthouse 13.4 needs Node >=22.19 — bump that job to Node 22 or pin lighthouse 12 | `.github/workflows/ci.yml` |
| Medium | #17 static server returns HTTP 200 for its 404 fallback, so broken routes pass smoke tests | `scripts/serve-static-demo.mjs` |
| Owner call | #15 changes production behavior: rollover after Week 13 no longer wraps to Chicago; group is left with no active week and `/api/weeks/current` falls back to the latest closed week. Confirm intent; add a post-finale `/api/weeks/current` assertion | `apps/api/src/services/weekRollover.ts` ~24–40, 403–410 |
| Copy fix | Boston is not "an hour ahead of the New York clock" (same time zone) — reword to "an hour before the sightings" / "ahead of the New York sightings" | `seasonOne.ts` ~1190, 1196, 1218 + Week 6/7 packs |
| Fact fix | Santa Monica Pier fun fact: "has carried its amusement park since 1909" — pier opened 1909, Pleasure Pier is 1916 → "has stood since 1909" | migration `011` + Week 12 pack |
| Fact fix | Zilker Park: Barton Springs flows *into* Barton Creek, doesn't "feed" it | migration `011` + Week 10 pack |
| Spoiler leak | `CaseClosedReport` shows `teaser.body` to every outcome; in Weeks 8–12 the teaser repeats the locked intercept-clue text, so players who miss the interception still read it | `CaseClosedReport.tsx` |
| Scope (owner awareness) | Wk 11 "thirteen fixed points joined by one figure" and Wk 12 "the real one is in San Francisco, and it has not happened yet" are the most connective hooks; both match the packs and QA finding N2 accepted them, but they sit on the rule #6 line. Wk 13 "Whatever comes next, you are ready for it." works against N6 — suggest cutting | `seasonOne.ts` ~1543–1553, 1626, 1635, 1700 |
| Nit | Wk 13 season-close card text in code ("THE CASE IS CLOSED"/"Review the chase") differs from pack ("SEASON ONE COMPLETE"/"Review the season"); a test pins the code header. Pick one source of truth. Pack's N6 banner is stale | `seasonOne.ts` 1704–1709, `week-13-san-francisco.md` |
| Nit | #13 raises the shared Slider from 28px to `--touch-min` (44px); Profile and Onboarding sliders grow 16px — eyeball them | `Slider.jsx` |
| Nit | No test pins migration `011` landmarks against `seasonOne.ts` (only vs packs) | tests |
| Nit | Hard-coded row counts (65/72/16) in `migrations.integration.test.ts` will break on the next seeding migration | #15 |

**Launch blockers found by the Health API / deploy review (see
`docs/LAUNCH-RUNBOOK.md` on `launch-prep`):**

1. **Cross-domain session cookie.** Cookie is host-only `SameSite=Lax`
   (`apps/api/src/lib/session.ts:33-41`), CORS allows one origin
   (`apps/api/src/index.ts:29-39`), web fetches with `credentials:"include"`.
   On `*.vercel.app` + `*.railway.app` the cookie is never sent (login
   "succeeds", next call 401s); `SameSite=None` doesn't fix iOS Safari. **Fix:
   put both on one domain Lindsey owns (`app.` + `api.`) — no code change.**
2. **OAuth app in Testing mode** expires refresh tokens after 7 days. Publish
   the app before real players (unverified is OK up to 100 users, shows a
   warning screen; a privacy-policy URL is likely required — unconfirmed).
3. **`NODE_ENV=production` must be set by hand** — it gates the Secure cookie
   flag and locks `/api/auth/dev-login` (`routes/auth.ts:171`); missing it
   leaves dev-login open.
4. **Production defaults to the REAL Health client** when `HEALTH_API_MODE` is
   unset (`clientFactory.ts:14-15`). Set `mock` explicitly until the smoke
   test passes.
5. **Cron is an in-process timer** (`index.ts:62-64`, `cron.ts:221-236`): run
   exactly one API instance, disable Railway sleeping, and don't deploy
   around Monday 00:00 group-local (a missed tick is never replayed, so that
   week's rollover is skipped).
6. **Time-zone bug in real mode (code fix needed, not yet done):**
   `workout_before` (`bingo.ts:~212`) and `bedtime_before` (`bingo.ts:~269`)
   read `getUTCHours()` on real Health API timestamps, but `bingoService.ts`
   passes them through unconverted (`:248-250`), so for Chicago players
   "workout before 8 AM" and "in bed before 11 PM" tiles evaluate wrong. Mock
   mode hides it. Fix with `startUtcOffset`/civil times from the sessions.
7. `realFitbitClient.ts:224` uses `?? 0` for steps, so a parser mismatch
   silently records 0 steps (runbook has a SQL sanity check); `sessions[0]`
   can pick a nap as main sleep (`:277`); `CRON_TZ_STRATEGY` and `SENTRY_DSN`
   in `.env.example` are never read.

**Health API doc check (Oct 2026):** base URL, steps `dailyRollUp` path/body
and `countSum` string handling, and exercise/sleep list filters match current
docs (high confidence). Active-zone-minutes field names (`sumIn*HeartZone`)
are guessed — Google doesn't publish them (low). Heart-rate zones are derived
from AZM; Google's native types are `time-in-heart-rate-zone` /
`calories-in-heart-rate-zone` (low). Hourly steps (`steps_by_hour`) remain
unimplemented; the smoke script probes a `windowSize` 3600s rollUp. The
`health_metrics_and_measurements` scope appears unused. Rate limit 300
req/min/user. **No sandbox exists** — testing = OAuth Testing mode + test
users + real accounts. Legacy Fitbit Web API shuts off **Oct 30, 2026**.

**Sandbox notes for future sessions:** Google Fonts is blocked in the cloud
sandbox, so `next build` fails at `next/font` — work around with
`NEXT_FONT_GOOGLE_MOCKED_RESPONSES` pointing at a module (outside the repo)
that returns a stub `@font-face` for any URL. Playwright browser downloads
are blocked too. Postgres 16 can be started with
`pg_ctlcluster 16 main start` (password `postgres`).

## What is NOT done — next tasks in priority order

1. **Land the open PRs** (owner approval required — do not merge unasked).
   First apply the "fix before merge" items in the M15 table (Node 22 in the
   `browser-quality` job; 404 status in the static server), get an owner
   answer on the post-Week-13 behavior, then merge #6 → #15 → #16 → #17, then
   #11 and #13, using merge commits and retargeting bases as described in
   M15. Confirm the Pages deploy afterwards
   (https://lmorrow1210.github.io/SelenaChicagoStepChase/ — until then the
   live demo shows only Chicago + Detroit).
2. **Copy/fact cleanup pass** from the M15 table (Boston time-zone line,
   Santa Monica Pier, Zilker/Barton Springs, teaser spoiler leak, Week 13
   hook + season-close card source of truth). Small, one PR.
3. **Fix the bingo time-of-day time-zone bug** (M15 blocker 6) with tests,
   ideally after the owner's smoke-test output confirms the real timestamp
   shape.
4. **Owner-only launch steps** — follow `docs/LAUNCH-RUNBOOK.md`: pick the
   `app.`/`api.` domain; Google Cloud OAuth app (publish out of Testing,
   privacy-policy URL); run `npm run smoke:health -w apps/api` with a real
   token and share the shape-only output; flip `HEALTH_API_MODE=real`;
   Railway (api, single instance, `NODE_ENV=production`) + Vercel (web)
   deploy; physical-device QA on iOS Safari and Android Chrome.
5. **Deploy env vars (reference)**: Railway (api) + Vercel (web) per locked decisions; env vars: `DATABASE_URL`, `JWT_SECRET`, `TOKEN_ENC_KEY`, `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI`, `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL`.
6. **M9 manual QA (history)**: responsive iOS Safari + Android Chrome on physical devices. ~~Lighthouse a11y ≥ 95~~ — **done (June 2026), re-verified July 2026 under the Field Terminal palette**: all screens back at **100** after the palette (fixes: `--phosphor-dim` #429A57→#4AAB61 so muted text clears AA even where axe blends the tan bevel edge into raised faces; Toast message text is primary `--phosphor`). Viewport sweep 390/768/1440: no horizontal overflow on any screen. Original June 2026 detail: all screens (login, map, city, city/[id], prediction, bingo, nemesis, profile, onboarding steps) audit at **100**. Fixes: `--muted` lightened `#4A6080` → `#8A9FBB` (was 2.5:1 on card, now ≥4.5:1 on every surface — **Lindsey should eyeball the lightened secondary text**, the palette was marked "locked"); Slider range input got an `aria-label`; City screen dims only the avatar (not the member name) for not-worked-out members; onboarding StepDots got `role="group"`. Reduced-motion is covered by the global kill rule in tokens/effects.css.
7. **Owner product calls still open:** Saturday sudden-death final rule/
   treatment; Selena's blue-fedora costume vs the green/red palette; whether
   Season One ends or loops after Week 13 (see #15); optional per-city bingo
   labels (IMPLEMENTING-A-CITY option B — needs an append-only migration and
   owner sign-off).

Already done, kept here so future agents do not chase ghosts:
- ~~Plan §3 stragglers~~ — **all done**: `GET /api/predictions/history`;
  `DELETE /api/groups/me/members/:userId` with nemesis re-pair (leave re-pairs
  too); raw-hex CI gate; global reduced-motion kill rule; **past-city trophy
  view** (`GET /api/cities/:id` + `/city/[cityId]` page, visited map pins link
  to it); **OpenAPI 3.0 spec** (`apps/api/openapi.yaml`) + generated web types
  (`apps/web/lib/api-types.d.ts`, regenerate with
  `npm run gen:api-types -w apps/web`, CI fails on drift).
- ~~City icons — 30 SVGs from Gemini in progress~~ **DONE (June 2026)**: 38
  city landmark silhouettes hand-authored and integrated.
- ~~v2 re-skin visual polish pass needed~~ — **RETIRED (July 2026, M11
  session)**: v3/v4 superseded the old risk and the deployed demo was
  screenshot-checked at desktop/mobile sizes.

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
    week.ts         weekMonday, weekSunday, createFirstWeek
    fitbitClient.ts FitbitClient interface + MockFitbitClient
  db/migrations/
    001_init.sql    full schema (never edit)
    002_seed_cities.sql  3 cities × 7 landmarks + defs (never edit)

packages/design-system/components/
  game/        Avatar, BingoTile, CityBadge, LandmarkTile, MapPin,
               PredictionCard, ProgressStrip, SkyscraperPair — all migrated
  game/city-icons/   SVG source files for city landmarks (drop here, run ingest script)
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

1. Read `AGENTS.md`, then the M15 section above.
2. Ask Lindsey: OK to apply the pre-merge fixes and merge the PR stack?
   What should happen after Week 13? Which domain for `app.`/`api.`?
3. Apply fixes, merge in order, confirm CI + Pages.
4. Copy/fact cleanup PR, then the bingo time-zone fix.
5. Walk Lindsey through `docs/LAUNCH-RUNBOOK.md`. Narrative DNA N2
   (Monday briefing / Saturday sudden-death treatment) is still the next
   *feature* milestone, but launch readiness outranks it.

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
- **v2 tokens**: don't remove the "Legacy aliases" block in `colors.css` (it's what lets v1-named references re-skin) or the `sc-pulse-blue` keyframe alias in `base.css`. All radii are `0` except `--r-avatar` — square corners are intentional. Shadows are hard offsets (`Xpx Ypx 0 0 var(--bevel-lo)`), not blurs; `--glow-*` are now hard offsets too.
- **v2 fonts**: `--font-display` is **Press Start 2P, weight 400 only** — never set `fontWeight` on it (faux-bold smears the pixels). It's a wide pixel font; keep display sizes small (≤24px) or text overflows. `--font-mono` (VT323) is designed for ≥24px.
- **A11y gate**: run `node scripts/contrast-audit.mjs` after any token/color change — it checks WCAG AA for every text/surface pair the UI uses. Currently 30/30 pass; `--dust` and `--crt-dim` are tuned to the minimum that clears 4.5:1, so don't darken them.
