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
# Expected: 25 passed, 7 skipped (integration tests skip without TEST_DATABASE_URL)

npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
# Expected: no output (both exit 0)

npm run build -w apps/api
npm run build -w apps/web
# Expected: both succeed
```

---

## Git log (current state)

```
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
- Simple `/onboarding` page (create/join group). Full 5-step onboarding is NOT done (see M1 gaps below).

### Design-system (M0/M1)
- All game components migrated from `window.React` / `window.DesignSystem_19034b` shim to ESM imports + default exports: `Button`, `Input`, `EmptyState`, `Skeleton`, `Avatar`, `MapPin`, `ProgressStrip`, `LandmarkTile`, `CityBadge`, `PredictionCard`, `BingoTile`, `Sidebar`, `TabBar`, `Icon`.
- **Not yet migrated: `SkyscraperPair`** (still uses `window.React`/`window.DesignSystem_19034b` — needs same treatment for M6 Nemesis screen).
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

### Tests
- `test/engines.test.ts` — 11 unit tests covering all engine functions above.
- `test/lib.test.ts` — 7 unit tests for invite codes, AES-256-GCM crypto, JWT session.
- `test/week.test.ts` — 4 unit tests for DST-safe week boundary math.
- `test/fitbitClient.test.ts` — 3 unit tests for MockFitbitClient fixture behavior.
- `test/groups.integration.test.ts` — 4 integration tests (skipped without `TEST_DATABASE_URL`).
- `test/predictions.integration.test.ts` — 3 integration tests for prediction submit/reveal/closeWeekPredictions (skipped without `TEST_DATABASE_URL`).

---

## What is NOT done — next tasks in priority order

### 1. M6 — Nemesis (highest priority — engines already built)

The scoring logic (`decideDay`, `tallyScore`, `weekOutcome`, `pairPlayers`) is done and tested. What's needed:

**API:**
- `GET /api/nemesis/current` — must return:
  ```json
  {
    "matchup": { "id", "player_a", "player_b", "score_a", "score_b", "status", "daily_results", "rerolled", "tiebreaker_date" },
    "you": { "user_id", "display_name", "avatar_colorway", "steps_today", "steps_this_week" },
    "nemesis": { same shape },
    "weekMax": <highest daily steps in group this week for skyline normalization>,
    "outcome": "a" | "b" | "tiebreak" | null (null if week still active),
    "state": "active" | "tiebreak" | "complete" | "bye" | "no_matchup"
  }
  ```
- `POST /api/nemesis/reroll` — one reroll per matchup; 409 `REROLL_USED` if already rerolled. Re-pairs the user randomly with another unpaired group member. Mutates `nemesis_matchups`.
- `POST /api/nemesis/day-close` (internal, called by sync pipeline) — append day result to `daily_results`, update `score_a`/`score_b`, set `status='tiebreak'` if 5-day tie, set `status='complete'` + `winner_id` when done.

**Monday pairing persistence:**
- On Monday week-start (called from week rollover or lazily on first `/nemesis/current` request that week), run `pairPlayers` over all group members, INSERT into `nemesis_matchups`. Bye player gets no row (or a sentinel row — pick one and stick with it).

**Wire into sync:**
- After bingo detection in `POST /api/sync/run`, call day-close if it's midnight (or expose a manual trigger for now — same pattern as sync stub).

**Frontend:**
- `SkyscraperPair.jsx` needs same ESM migration as other components (replace `window.React`/`window.DesignSystem_19034b` with `import * as React from 'react'` and `import { Icon } from '../icons/Icon.jsx'`; add `export default SkyscraperPair`). See the BingoTile.jsx migration as the exact template.
- `apps/web/app/(game)/nemesis/page.tsx` — implement the screen per plan §4:
  - `ScoreBar` (two avatars + score tally)
  - 5 × `SkyscraperPair` (Mon–Fri, heights normalized to `weekMax`)
  - `TodayContextStrip` (your steps vs nemesis today)
  - Empty state: "Get your nemesis" (no matchup yet)
  - Winner banner + rematch prompt (status=complete)
  - Tiebreak banner (Saturday sudden death)

**DB note:** `nemesis_matchups` schema already exists in `001_init.sql`. No new migration needed unless you add an index.

### 2. M7 — Profile & Badges

**API:**
- `GET /api/users/me/stats` — `{ total_steps_alltime, total_steps_this_week, city_wins, bingo_lines_alltime, current_streak }`. All from step_logs + weeks + badges.
- `GET /api/badges` — all earned badges for the current user with code/label/description/quality/earned_at.
- Badge award logic belongs in the week-close rollover (M8), but the endpoints can ship now querying the `badges` table.

**Frontend:**
- `apps/web/app/(game)/profile/page.tsx` — currently a placeholder `<h1>Profile</h1>`. Implement per plan §4:
  - Avatar showcase (120px, use `colorway` prop)
  - Stats row: total steps as km (DM Mono), city wins, bingo lines
  - Badge grid (bronze/silver/gold borders — use `quality` field)
  - Settings panel: weekly target slider (`PATCH /api/users/me`, `weekly_step_target` 35k–140k), sync status + "Sync now" button, disconnect Fitbit (`DELETE /api/auth/fitbit`), sign out (`POST /api/auth/logout`)
  - Avatar editor modal (skin tone / hair color / colorway picker — `PATCH /api/users/me` with avatar fields)

### 3. M8 — Real sync + cron + week rollover

This is the biggest remaining chunk and the one that makes the game actually work end-to-end:

**Week rollover transaction** (Monday 00:00 group-local):
1. Close current week: `closeWeekPredictions(db, weekId)` (already written).
2. Compute step leader; award city badge (quality: 0–2 unlocks → bronze, 3–5 → silver, 6–7 → gold; only if `target_hit`).
3. Evaluate streak badges (3/6/12 consecutive city wins).
4. Finalize nemesis matchup winner + badge.
5. Freeze bingo cards (`frozen=true`).
6. Create next week: `createFirstWeek` variant that uses next `route_order` (wraps after last city).
7. Generate new bingo cards for all members.
8. Assign new nemesis matchups via `pairPlayers`.
9. Open prediction window.
All in a single transaction — partial failure must roll back.

**Sync pipeline (cron, 3×/day):**
- Real `FitbitClient` behind the same interface as `MockFitbitClient`. Base URL: `health.googleapis.com/v4` (verify before coding — see plan §5).
- Hourly cron tick; select groups whose local time is noon / 6pm / midnight.
- Midnight run: sync all → unlock detection → bingo detection → nemesis day-close.
- 429 backoff: exponential 1s→32s, 5 tries; per-user failures don't abort the batch.
- `invalid_grant`: set `fitbit_connected=false`, create alert notification.

### 4. M1 gaps — full onboarding

The current `/onboarding` is a minimal create/join form. The full spec requires 5 steps:
1. Connect Fitbit (show scope consent status; reconnect banner if `fitbit_connected=false`)
2. Weekly target slider (35k–140k, default 70k)
3. Avatar editor (skin tone → hair color → colorway, live preview)
4. Create or join group
5. → `/map`

Route structure: `apps/web/app/(onboarding)/onboarding/[step]/page.tsx` (per plan §1 repo layout).

### 5. M9 — Notifications & Polish (last)
- Toast system (achievement gold / social blue / alert red) — `GET /api/notifications` + mark-read endpoint.
- Week-closure summary card.
- Arrival confetti (biggest moment in the app).
- Responsive QA iOS Safari + Android Chrome.
- Lighthouse a11y ≥ 95.
- Reduced-motion audit (all animations gated by `prefers-reduced-motion`).

---

## Key file map (most-touched areas)

```
apps/api/src/
  routes/
    auth.ts         Google OAuth, dev-login, session, logout
    groups.ts       create, join, me, leave
    users.ts        GET/PATCH /api/users/me
    sync.ts         POST /api/sync/run  ← wire nemesis day-close here
    weeks.ts        GET /api/weeks/current
    cities.ts       GET /api/cities/current
    predictions.ts  GET/POST /api/predictions/current
    bingo.ts        GET /api/bingo/current, /friends
    ← ADD: nemesis.ts   GET /api/nemesis/current, POST /reroll
    ← ADD: badges.ts    GET /api/badges
  services/
    prediction.ts   scorePredictions (pure, unit-tested)
    bingo.ts        generateCard, evaluateDetector (pure, unit-tested)
    bingoService.ts createOrGetBingoCard, updateBingoCard (DB-backed)
    nemesis.ts      decideDay, tallyScore, weekOutcome, pairPlayers (pure, unit-tested)
    ← ADD: nemesisService.ts   pairAndPersist, closeDayForMatchup
    weekClose.ts    closeWeekPredictions (DB-backed)
    ← ADD: weekRollover.ts     full Monday rollover transaction
    sync.ts         syncUserDay, syncUserToday
    unlocks.ts      detectUnlocks
    week.ts         weekMonday, weekSunday, createFirstWeek
    fitbitClient.ts FitbitClient interface + MockFitbitClient
  db/migrations/
    001_init.sql    full schema (never edit)
    002_seed_cities.sql  3 cities × 7 landmarks + defs (never edit)

packages/design-system/components/
  game/
    SkyscraperPair.jsx   ← needs ESM migration (window.* → import)
    SkyscraperPair.d.ts  ← add default export line
    (all others: Avatar, BingoTile, CityBadge, LandmarkTile,
     MapPin, PredictionCard, ProgressStrip — already migrated)
  navigation/  Sidebar, TabBar  — migrated
  core/        Button            — migrated
  forms/       Input             — migrated
  feedback/    EmptyState, Skeleton — migrated
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
    nemesis/page.tsx            placeholder ← M6
    profile/page.tsx            placeholder ← M7
```

---

## Design-system component migration template

Every component still using `window.*` needs this exact treatment (SkyscraperPair is the last one):

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

## Recommended execution order for this session

Given Fable's context limit, here's the order that delivers the most playable game per token spent:

1. **SkyscraperPair ESM migration** (~10 min) — unblocks M6 frontend.
2. **M6 Nemesis service + routes** — `nemesisService.ts` (pair+persist, day-close), `routes/nemesis.ts` (current + reroll), wire day-close into sync.
3. **M6 Nemesis screen** — `nemesis/page.tsx` with SkyscraperPair skyline.
4. **M7 Profile screen + stats/badges endpoints** — relatively self-contained.
5. **M8 week rollover transaction** — the capstone that ties everything together.

If you hit the limit mid-M6, commit what compiles and leave a note in this file about where you stopped.

---

## Gotchas accumulated across sessions

- `localDateParts` / `zonedTimeToUtcIso` helpers are duplicated in `weeks.ts` and `predictions.ts`. Future cleanup: consolidate into `services/week.ts` (but don't do it mid-feature — it breaks things).
- `syncUserToday` returns the local date string so the sync route can pass it to `detectUnlocks` and `updateBingoCard`. Don't change that return type.
- `updateBingoCard` skips tiles that are already `complete` — this is intentional and correct.
- `bingo_cards` has a `UNIQUE (week_id, user_id)` constraint — `createOrGetBingoCard` uses `ON CONFLICT DO UPDATE SET tiles = bingo_cards.tiles` (i.e., a no-op on conflict) which is safe.
- `SkyscraperPair` needs a `default export` added to its `.d.ts` — the `.jsx` export map in `packages/design-system/package.json` already handles it via the wildcard `"./components/*"` mapping.
- The `Avatar` component takes `colorway` (a preset name like `"chicago"`) not numeric `skin`/`hair` indices. Use `COLORWAYS[((n-1) % 6)]` to map DB integers to colorway names.
- `EmptyState` props: `body` (not `message`), `action` is a `ReactNode` (not `{label, href}`).
- `Skeleton` props: `preset` (`"bingo"` | `"landmark"` | `"leaderboard"` | `"block"`), not `height`/`width`.
