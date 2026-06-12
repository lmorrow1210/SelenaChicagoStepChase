# Selena's Chase — Implementation Plan v1.0

Phased execution roadmap. Source of truth: `selenas-chase-spec.md` (product) and `selenas-chase-design-system-prompt.md` + design-system bundle (`SelenaDesign/`: `styles.css`, `_ds_bundle.js`, `components/`) for all visual decisions. Nothing below overrides the spec; the two places where this plan proposes a change are explicitly flagged with **⚠ PROPOSED CHANGE**.

---

## 1. Architecture Overview

### System diagram
```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (desktop + mobile web)                                 │
│  Next.js app — React 18, App Router, design-system components   │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS / JSON (REST), cookie session (httpOnly JWT)
┌──────────────▼──────────────────────────────────────────────────┐
│  API SERVER — Node 20 / Express (Railway)                       │
│  /api/* routes · auth middleware · game-logic services          │
│  ├── services/sync        (pull Fitbit data via Google Health)  │
│  ├── services/unlocks     (landmark / bingo / badge detection)  │
│  ├── services/week        (week rollover, arrival, scoring)     │
│  └── jobs/                (node-cron: 3× daily sync + Mon/Sun)  │
└──────┬───────────────────────────────┬──────────────────────────┘
       │ pg (node-postgres)            │ OAuth 2.0 + REST
┌──────▼──────────────┐        ┌───────▼──────────────────────────┐
│ PostgreSQL 16       │        │ Google identity + Google Health  │
│ (Railway)           │        │ API (Fitbit data, v4)            │
└─────────────────────┘        └──────────────────────────────────┘
```

### Why this stack
- **Next.js (App Router)** — spec-mandated. Server components for static-ish screens, client components for live game UI. Built-in font loading for the three Google families. Deploys to Vercel with zero config.
- **Separate Express API** rather than Next API routes — the game needs long-lived cron jobs (3× daily sync, Monday rollover at each group's local midnight) and a single place for game-logic invariants. Vercel serverless functions are a poor home for scheduled, stateful jobs; Railway runs a persistent Node process.
- **PostgreSQL** — spec-mandated, and correct: heavily relational (users↔groups↔weeks↔logs), needs transactions for week rollover (badge awards + city advance must be atomic), and benefits from constraints (one prediction per player per week is a unique index, not application code).
- **REST, not GraphQL** — chosen deliberately (§3). The client's data needs are screen-shaped and predictable. REST + a small number of composed "screen payload" endpoints keeps the backend simple.
- **State management: TanStack Query + Context** — server state in TanStack Query caches keyed by endpoint; identity (current user, group, week) in one `SessionContext`. No Redux.

### Repository layout (monorepo)
```
selenas-chase/
├── apps/
│   ├── web/                        # Next.js (Vercel)
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (onboarding)/onboarding/[step]/page.tsx
│   │   │   ├── (game)/layout.tsx          # AppShell: Sidebar/TabBar
│   │   │   ├── (game)/map/page.tsx        # default route → redirect "/" here
│   │   │   ├── (game)/prediction/page.tsx
│   │   │   ├── (game)/city/page.tsx
│   │   │   ├── (game)/city/[cityId]/page.tsx   # past-city trophy view
│   │   │   ├── (game)/bingo/page.tsx
│   │   │   ├── (game)/nemesis/page.tsx
│   │   │   └── (game)/profile/page.tsx
│   │   ├── components/             # screen-level compositions
│   │   ├── lib/api.ts              # typed fetch client
│   │   ├── lib/session.tsx         # SessionContext
│   │   └── styles/                 # imports design-system styles.css + tokens/
│   └── api/                        # Express (Railway)
│       ├── src/
│       │   ├── index.ts            # bootstrap, CORS, helmet, cookie parser
│       │   ├── routes/             # auth, users, groups, weeks, sync,
│       │   │                       # predictions, nemesis, bingo, cities, badges
│       │   ├── services/           # sync, unlocks, week, badges, fitbit client
│       │   ├── jobs/               # cron definitions
│       │   ├── db/                 # pool, migrations/, seeds/
│       │   └── middleware/         # requireAuth, requireGroupAdmin, errors
│       └── test/
├── packages/
│   ├── design-system/              # the existing bundle: tokens/, components/, styles.css
│   └── shared/                     # zod schemas + TS types shared web↔api
└── package.json                    # npm workspaces
```

### Environment variables
| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | api | Railway Postgres connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | api | OAuth 2.0 app (login + Health scopes) |
| `GOOGLE_REDIRECT_URI` | api | `https://api.<domain>/api/auth/google/callback` |
| `HEALTH_API_BASE` | api | `https://health.googleapis.com/v4` (per spec — verify at integration time, §5) |
| `JWT_SECRET` | api | Signs session JWTs (httpOnly cookie) |
| `TOKEN_ENC_KEY` | api | 32-byte key, AES-256-GCM encryption of stored OAuth refresh tokens |
| `WEB_ORIGIN` | api | CORS allowlist — the Vercel URL |
| `NEXT_PUBLIC_API_URL` | web | Base URL of the Express API |
| `CRON_TZ_STRATEGY` | api | `per-group` (see jobs, §6 Module 8) |
| `SENTRY_DSN` | both | Error tracking (optional, §9) |

`.env.local` for dev, Railway/Vercel dashboard vars for production. Never commit secrets; `.env.example` documents every key.

### Security
- **OAuth tokens encrypted at rest** — refresh tokens AES-256-GCM in `users.fitbit_refresh_token_enc`; access tokens in memory/short-lived cache only.
- **Session** — httpOnly, `Secure`, `SameSite=Lax` cookie with signed JWT (`user_id`, 7-day expiry, rotated on use). No tokens in localStorage.
- **CORS** — API allows only `WEB_ORIGIN`, credentials enabled.
- **PII discipline** — never log raw step data or tokens; structured logger redacts `steps`, `token`, `email`. Third-party services receive no PII.
- **Input validation** — every route body/query validated with zod schemas from `packages/shared`.
- **Rate limiting** — `express-rate-limit` on auth routes and prediction submit.

---

## 2. Database Schema

See `apps/api/src/db/migrations/001_init.sql` and `002_seed_cities.sql` (already written, copy of this plan's §2 SQL).

**Notes**
- `bingo_cards.tiles` is denormalized JSONB on purpose: a card is always read/written whole, the 25-tile shape never joins, freezing is a flag. Index 12 is FREE SPACE.
- `nemesis_matchups.daily_results` likewise — five rows of paired data always rendered together.
- Week boundaries use the **group's timezone** (`groups.timezone`); `starts_on`/`ends_on` are dates in that tz. Monday rollover computes per-group local midnight.
- Migrations: `node-pg-migrate`. Numbered sequentially; never edit a shipped migration.
- Route after Reykjavik: London, Paris, Berlin, Rome, Istanbul, Cairo, Nairobi, Cape Town, Dubai, Mumbai, Bangkok, Tokyo, Seoul, Sydney, Lima, Buenos Aires, São Paulo, Havana, Mexico City, Los Angeles → loop.

---

## 3. API Specification

REST. All routes under `/api`, JSON in/out, auth via session cookie unless marked public. Errors: `{ "error": { "code": "GROUP_FULL", "message": "…" } }`. Codes: `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `VALIDATION` 422, `CONFLICT` 409, `RATE_LIMITED` 429.

### Auth
| Method/Path | Auth | Description |
|---|---|---|
| `GET /api/auth/google` | public | Redirect to Google OAuth consent (login + Health scopes in one flow) |
| `GET /api/auth/google/callback` | public | Exchange code; upsert user; encrypt + store refresh token; set session cookie; redirect (`/onboarding` if new, `/map` if returning) |
| `POST /api/auth/logout` | ✓ | Clear session cookie |
| `GET /api/auth/session` | ✓ | `{ user, group, activeWeek }` — boot payload for `SessionContext` |
| `DELETE /api/auth/fitbit` | ✓ | Revoke + delete stored tokens, `fitbit_connected=false` |

### User
| Method/Path | Auth | Body → Response |
|---|---|---|
| `GET /api/users/me` | ✓ | full profile incl. avatar config, target, sync status |
| `PATCH /api/users/me` | ✓ | `{ display_name?, weekly_step_target?, avatar_skin?, avatar_hair?, avatar_colorway? }` |
| `GET /api/users/:id/stats` | ✓ same-group | `{ citiesEarned, winStreak, allTimeSteps, predictionWins }` |
| `GET /api/users/:id/badges` | ✓ same-group | badge list with definition + quality + city |

### Group
| Method/Path | Auth | Notes |
|---|---|---|
| `POST /api/groups` | ✓ | `{ name }` → create, generate unique 6-char code (charset `ABCDEFGHJKMNPQRSTUVWXYZ23456789`), caller = admin + member. 409 if already in a group. |
| `POST /api/groups/join` | ✓ | `{ invite_code }` → 404 unknown, 409 `GROUP_FULL` (max 8) or already-in-group |
| `GET /api/groups/me` | ✓ | group + member list (avatars, names) |
| `PATCH /api/groups/me` | admin | `{ name? }` |
| `DELETE /api/groups/me/members/:userId` | admin | remove player; reassign their nemesis pairing if mid-week (re-pair or bye) |
| `POST /api/groups/me/leave` | ✓ | leave; if admin leaves, oldest member promoted |

### Week / Map screen
| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/weeks/current` | ✓ | Composed Map payload: `{ week, city, nextCity, selenaLeadSteps, route, progressStrip, leaderboard, countdown, lastSyncedAt, state }`, `state ∈ 'in_progress'|'arrival'|'closing_soon'|'no_group'` |
| `GET /api/weeks/history` | ✓ | past weeks: city, badge result, totals |

`selenaLeadSteps` = `group_target_steps − group steps so far`, floored at a taunt-minimum (config, e.g. 5,000) so Selena is always "ahead."

### Sync
| Method/Path | Auth | Notes |
|---|---|---|
| `POST /api/sync/run` | ✓ | Manual "sync now" (rate-limited 1/10 min). Same code path as cron. |
| `POST /api/internal/sync/group/:groupId` | internal token | Cron runner only; not exposed via CORS |

### Prediction
| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/predictions/current` | ✓ | `{ myPrediction?, others: hidden|revealed, liveGroupTotal, revealAt, state }` — others hidden until all submitted OR Monday noon |
| `POST /api/predictions` | ✓ | `{ predicted_steps }` → 409 if already submitted or window closed (after Monday 11:59pm) |
| `GET /api/predictions/history` | ✓ | per-week results, win count |

### Nemesis
| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/nemesis/current` | ✓ | `{ matchup?, days, score, state }` |
| `POST /api/nemesis/reroll` | ✓ | 409 if already rerolled or after Monday |
| `POST /api/nemesis/assign` | ✓ | "Get your nemesis" empty state (auto-assign) |

### Bingo
| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/bingo/current` | ✓ | my card (25 tiles with labels/icons/states), bingo count, blackout flag |
| `GET /api/bingo/friends` | ✓ | `[ {user, bingoLines} ]` |

No write endpoints — tiles are server-detected only (spec: no manual input).

### City
| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/cities/current` | ✓ | city meta + 7 landmark slots (locked/unlocked/today), today's group workout status ("3 of 5") |
| `GET /api/cities/:id` | ✓ | past-city trophy view, or `FORBIDDEN` for future cities |

### Badges
`GET /api/badges/definitions` — public reference list. User badge reads under `/api/users/:id/badges`.

### OpenAPI
Author `apps/api/openapi.yaml` (3.0) mirroring the above; generate the typed client for `apps/web/lib/api.ts` with `openapi-typescript`. Tables normative for behavior; YAML normative for shapes.

---

## 4. Frontend Component Architecture

### Design-system layer (already exists — consume, don't rebuild)
From `packages/design-system`: `Icon`, `Button`, `Card`, `StatCard`, `Badge`, `CountdownPill`, `Input`, `Slider`, `Toast`, `EmptyState`, `Skeleton`, `Sidebar`, `TabBar`, `Avatar`, `ProgressStrip`, `CityBadge`, `LandmarkTile`, `BingoTile`, `SkyscraperPair`, `PredictionCard`, `MapPin`, `WorldMap`. The app adds **screen containers and data wiring only**. Net-new components must use tokens from `styles.css` — no magic numbers.

### Shell
```
<RootLayout>                       fonts (Barlow Condensed, DM Sans, DM Mono), styles.css
└── <Providers>                    QueryClientProvider + SessionProvider + ToastProvider
    └── <AppShell>                 ds: Sidebar (≥1024px) ⇄ TabBar (<1024px), avatar→/profile
        └── {screen}
```
- `SessionContext` — `{ user, group, activeWeek, refresh() }` from `GET /api/auth/session`. Identity only.
- Game data: TanStack Query hooks (`useMapData`, `useBingoCard`, …), `staleTime` 60s, refetch on focus. Steps only change on sync → no polling; `lastSyncedAt` pill shows freshness.
- Local `useState` for pure-UI state.

### Screen trees (ds: = design-system component)
```
MapScreen
├── MapHero: ds:WorldMap (route, pins: current→/city, selena→SelenaTooltip), ds:CountdownPill (closing_soon)
├── ds:ProgressStrip (avatars positioned by pct = steps/target, clamp 100%)
├── WeeklyLeaderboard → LeaderboardRow ×N {rank, avatar, name, steps, delta, isMe}
├── ArrivalCelebration (state='arrival': confetti + "You've arrived in {city}!")
└── ds:EmptyState (no_group: create/join CTA)

PredictionScreen
├── GlobeBackground (bright illustrated globe, slow parallax)
├── ds:PredictionCard: LiveGroupTotal (DM Mono) · numeric Input · "Lock it in" · results (revealed|waiting|final)
└── ds:CountdownPill

CityScreen
├── CityHeader {name, country}
├── LandmarkGrid (3-2-2) → ds:LandmarkTile ×7 {locked|unlocked|today}
├── GroupWorkoutStatus: avatars + check overlays, "3 of 5 worked out today — 1 more to unlock!"
└── UnlockToastTrigger (achievement toast on new unlock)

BingoScreen
├── BingoGrid 5×5 → ds:BingoTile ×25
├── BingoLineOverlay (sweep animation) · BingoStatus · FriendProgressRow

NemesisScreen
├── ScoreBar {avatars, scoreA, scoreB}
├── Skyline → ds:SkyscraperPair ×5 {done|today|future}
├── TodayContextStrip · ds:EmptyState ("Get your nemesis") · WinnerBanner (crown + rematch)

ProfileScreen
├── AvatarShowcase (120px, idle sway) · StatsRow ds:StatCard ×3 · BadgeCollection
├── AvatarEditor modal (skin → hair → colorway, live preview) · SettingsPanel (target slider, sync, disconnect, sign out)

Onboarding: Login → ConnectFitbit → TargetSlider → AvatarEditor → CreateOrJoinGroup → /map
```
Every list/grid has `ds:Skeleton` loading + `ds:EmptyState`. Props interfaces live in `packages/shared` and mirror API schemas.

---

## 5. Google Health API Integration (Fitbit data)

> **⚠ Verify at integration time:** spec names `health.googleapis.com/v4`. Confirm current endpoint base, scope strings, quotas in Google's docs before Module 1. `fitbitClient` is the single touchpoint, so this is a one-file change.

### OAuth 2.0 flow (combined login + health consent)
1. `GET /api/auth/google`: response_type `code`, `access_type=offline`, `prompt=consent`, scopes = `openid email profile` + health scopes for **activity (steps, workouts), sleep, heart rate**.
2. Callback exchanges code server-side, verifies `id_token`, upserts user by `google_sub`.
3. Refresh token → AES-256-GCM with `TOKEN_ENC_KEY` → `users.fitbit_refresh_token_enc`. Access token in-process LRU only.
4. Set session cookie, redirect.

Declining health scopes still creates the account: `fitbit_connected=false`, reconnect banner, steps render 0 with CTA.

### Sync pull (per user, per run)
```
syncUser(user):
  token = refreshAccessToken(user)         # 401 → refresh → retry once
  date  = today in group tz (noon run also re-pulls yesterday)
  pull steps, activities, active-zone-minutes, sleep, heart-rate zones
  UPSERT step_logs (user_id, log_date)
  if steps ≥ dailyTarget and target_hit_at IS NULL → target_hit_at = now()
```

### Schedule
3× daily — **noon, 6pm, midnight group-local**. Cron ticks hourly; selects groups whose local time matches a sync hour. Midnight run doubles as day-close: sync → unlock/bingo/nemesis detection for the ended day.

### Error handling
- **429:** exponential backoff with jitter (1s→32s, 5 tries); per-user failures don't abort the group batch.
- **invalid_grant:** `fitbit_connected=false`, alert notification, skip until reconnected.
- **Partial sync:** metric pulls independent; store successes, retry missing next run. `last_synced_at` updates only if steps pull succeeded.
- **Idempotency:** UPSERT on `(user_id, log_date)` — reruns always safe.

### Caching & testing
- `step_logs` *is* the cache; the app never reads the Health API at request time.
- `services/fitbitClient.ts` is the only Google touchpoint. Tests inject `MockFitbitClient` with fixture days (normal, zero-activity, big workout, missing-sleep, 429 storm). One real sandbox Fitbit account pre-launch only.

---

## 6. Feature Modules — build order, acceptance criteria

Sequential; each ends demoable. A **stub sync** (manual `POST /api/sync/run` against the mock client) ships inside Module 2 so M2–M7 develop against realistic data flow; M8 replaces the trigger with cron + real API.

### Module 0 — Foundations
Monorepo scaffold, Express bootstrap, Postgres + migrations 001/002, design-system wired into Next.js (fonts, styles.css, tokens), CI (lint, typecheck, test). **Done when:** `npm run dev` boots web+api, seeded DB, blank AppShell with Sidebar/TabBar swap at 1024px.

### Module 1 — Auth & Onboarding
Google OAuth routes, token encryption, session cookie, onboarding (Connect Fitbit → target slider 35k–140k default 70k → 3-step avatar editor → create/join group), group CRUD.
**Acceptance:** 5-step onboarding lands on Map; second user joins via 6-char code; 9th member → `GROUP_FULL`; declining health scopes still creates account with reconnect banner; refresh token verified encrypted in DB.

### Module 2 — Map + Leaderboard (+ sync stub)
`GET /api/weeks/current` composed payload; first-week creation on group formation (city = route_order 1, target = Σ member targets); WorldMap + pins + Selena tooltip; ProgressStrip; leaderboard with delta vs last week; countdown/arrival/no-group states; mock sync stub.
**Acceptance:** avatars at correct strip positions; leaderboard sorted desc, my row highlighted; current pin → /city; Selena tooltip "N steps ahead"; no-group overlay; `lastSyncedAt` pill.

### Module 3 — City + Landmarks
`GET /api/cities/current`; daily unlock detection (everyone has ≥1 workout for date D → unlock landmark day(D)); `city_unlocks` with `triggering_user`; LandmarkGrid states; unlock animation (silhouette → color bloom, 500ms spring); workout status row; toast; past-city trophy view; future-city forbidden.
**Acceptance:** last member's workout flips the day's landmark with bounce + toast; one inactive member at day close keeps it locked permanently; day N ↔ landmark day N; reduced-motion → crossfade.

### Module 4 — Prediction
Endpoints with one-per-week constraint and Monday-midnight window; reveal = all-in OR Monday noon; globe background; DM Mono input + "Lock it in"; waiting/revealed/final states; week-close scoring (`actual_delta`, winner = min delta, ties → earliest `submitted_at`).
**Acceptance:** second submit 409; hidden until reveal; final shows actual total, deltas, winner.

### Module 5 — Bingo
Monday card generation (24 random distinct challenges + free space at 12, category-balanced); detector engine evaluating `detector` JSON against `step_logs` (+ group/nemesis context) each sync; line detection (5+5+2), blackout; grid with 4 tile states; sweep animation (400ms gold); friend row; Sunday freeze; badge awards. `beat_nemesis_day` stubbed until M6.
**Acceptance:** fixture 10,400-step day auto-completes `steps_10k_day`; full row increments `bingo_lines` + sweep; 25/25 → blackout badge; no write endpoint; frozen card rejects detection.

### Module 6 — Nemesis
Monday random pairing (odd count → bye/"Selena's day off"); one re-roll; daily winner at day close (higher steps; tie → earlier `target_hit_at`; both null → tie carries); best-of-5 Mon–Fri; **Saturday sudden death** on 5-day tie; skyline normalized to week max, crowns, future outlines, today pulsing; winner banner + badge; Monday rematch prompt.
**Acceptance:** deterministic fixtures → correct score; tiebreak ordering verified; reroll once then 409; heights proportional; reduced-motion skips rise.
**Open question (spec #3):** weekend tiebreaker — implements Saturday sudden death per the spec's own state row; confirm before M6 ships.

### Module 7 — Profile & Badges
Profile (avatar idle sway, stats, badge grid bronze/silver/gold borders); avatar editor reuse; settings (target slider, sync status, disconnect, sign out); stats endpoints; streak badges (3/6/12 consecutive city wins, evaluated at week close).
**Acceptance:** avatar edit propagates app-wide; all-time steps as km/mi DM Mono; disconnect revokes + flips banner; 3-week winning streak → `streak_3`.

### Module 8 — Real sync & cron
Real `fitbitClient`; hourly tick → group-local noon/6pm/midnight; midnight pipeline: **sync all → landmark detection → bingo detection → nemesis day close → notifications**; Monday 00:00 rollover transaction: close week (totals, `target_hit`), award city badge to step leader (quality by unlock count 0–2/3–5/6–7, only if group target hit — group advances regardless), score predictions, finalize nemesis, freeze bingo, evaluate perfect-week/hot-pursuit/streak, create next week (next route_order, wrap), new bingo cards, assign nemeses, open prediction window.
**Acceptance:** simulated full week (injected clock) rolls over atomically — partial failure rolls back; reruns idempotent; backoff verified vs mocked 429 storm; `last_synced_at` accurate; no step values in logs.

### Module 9 — Notifications & Polish
Notifications → toasts (achievement gold / social blue / alert red); week-closure summary card; arrival confetti (biggest moment); skeletons everywhere; error states; responsive QA iOS Safari + Android Chrome; reduced-motion audit; Lighthouse a11y ≥ 95.

---

## 7. Design System Implementation Checklist
- [ ] Copy `packages/design-system` from the bundle; link `styles.css` once in `app/layout.tsx`.
- [ ] Fonts via `next/font/google`: Barlow Condensed 700, DM Sans 400/500, DM Mono (remove CSS @import to avoid double-load).
- [ ] Port components to ESM imports (drop `window.DesignSystem_19034b` shim); add TS types from `*.prompt.md` / `.d.ts`.
- [ ] Icon set 24px / 2px stroke / currentColor; verify names: map, prediction, city, bingo, nemesis, step, workout, sleep, heart, badge, settings, sync, crown, star, lock, check, close, chevronRight, flame, clock, globe, trophy.
- [ ] Motion: spring `cubic-bezier(.34,1.56,.64,1)`, ease-out `(.22,1,.36,1)` as CSS vars; canvas-confetti themed blue/gold/red/cream; everything gated by `prefers-reduced-motion`.
- [ ] Glows reserved for achievement/active; navy shadows; 1px `--hairline` borders.
- [ ] Breakpoints: ≥1024 sidebar, 768–1023 condensed tab bar, <768 tab bar + ≥44px targets + safe-area insets.
- [ ] Voice: uppercase via CSS, DM Mono comma-grouped numbers, no emoji, second-person cheeky.
- [ ] Wire `_adherence.oxlintrc.json` into CI — raw hex/magic numbers outside tokens/ fail the build.
- [ ] Optional: deploy `ui_kits/selenas-chase/index.html` as static `/design` reference route.

---

## 8. Testing Matrix
| Layer | What | Tooling | When |
|---|---|---|---|
| Unit (api) | invite-code gen, prediction window/scoring, nemesis winner + tiebreak, bingo detectors (one test per code), badge quality boundaries (2/3, 5/6), streaks, `steps/target` math | Vitest + pg-mem or test DB | every PR |
| Unit (web) | ProgressStrip positioning, leaderboard sort/delta, countdown thresholds (muted→gold@2d→red@24h), avatar params | Vitest + Testing Library | every PR |
| Integration | group create → week create → fixture syncs → unlock → arrival → rollover (run twice, assert single badge set) | Vitest + Dockerized Postgres, MockFitbitClient, injected clock | every PR |
| E2E | signup → onboard → group → 2nd user joins → fixture steps → unlock toast → fast-forward week → badge | Playwright, mocked Google | nightly + pre-deploy |
| Sync resilience | 429 storm, expired refresh, partial-metric, double-run idempotency | Vitest fault injection | every PR |
| A11y/motion | axe-core all 6 screens; reduced-motion snapshot | Playwright + axe | nightly |
| Visual | tile/badge/skyline states vs design system | Playwright screenshots on /design | on ds changes |

Never call the real Health API in automated tests. One manual pre-launch pass with a real Fitbit account.

---

## 9. Deployment Steps
1. **Provision** — Railway: Postgres + api service (root `apps/api`, start `node dist/index.js`); Vercel for `apps/web`. Domains: `app.…`, `api.…`.
2. **Google Cloud** — OAuth client (web), redirect `https://api.…/api/auth/google/callback`; enable Health/Fitbit surface; request activity/sleep/heart scopes; **submit OAuth verification early** (sensitive scopes, takes weeks).
3. **Secrets** — all §1 vars; `TOKEN_ENC_KEY`/`JWT_SECRET` via `openssl rand -hex 32`.
4. **Migrations** — `node-pg-migrate up` as Railway release command; forward-only.
5. **CI/CD** — GitHub Actions: lint (incl. adherence) + typecheck + tests on PR; main → auto-deploy both; Playwright gate before production promote.
6. **Cron** — node-cron in the api process (hourly tick); `/healthz` + uptime ping.
7. **Monitoring** — Sentry (PII scrubbing); structured logs; `sync_runs` table + `/api/internal/sync/status`; alert on 2 consecutive missed sync windows.
8. **Smoke test** — real Google account + Fitbit device before invite codes go out.

---

## 10. Estimated Effort
| Module | Estimate |
|---|---|
| M0 Foundations | 2–3 days |
| M1 Auth & Onboarding | 4–5 days |
| M2 Map + Leaderboard | 4–5 days |
| M3 City + Landmarks | 3–4 days |
| M4 Prediction | 2–3 days |
| M5 Bingo | 4–5 days |
| M6 Nemesis | 3–4 days |
| M7 Profile & Badges | 2–3 days |
| M8 Real sync + rollover | 4–5 days |
| M9 Polish | 3–4 days |
| Content: ~30 cities × 7 landmarks | 2–3 days (parallelizable) |
| **Total** | **~6–7 weeks** (+ Google OAuth verification lead time, start week 1) |

---

## Flagged decisions (no silent overrides)
1. **REST over GraphQL** — justified §1/§3.
2. **Saturday sudden-death tiebreaker** — from the spec's own Nemesis state table; confirm before M6 ships.
3. **Health API base URL** — re-verify `health.googleapis.com/v4` before M1; `fitbitClient` isolation = one-file change.
4. **Sync stub moved into M2** — M8 scope unchanged (cron + real API + rollover).
5. **Landmark content** — curated text in DB + illustrated static assets ("illustrated, not photographic").
6. **Notifications** — v1 in-app only.
