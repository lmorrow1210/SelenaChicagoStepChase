# Selena's Chase — Implementation Plan v1.0

Phased execution roadmap for CodEx. Source of truth: `selenas-chase-spec.md` (product) and `selenas-chase-design-system-prompt.md` + design-system bundle (`styles.css`, `_ds_bundle.js`, `components/`) for all visual decisions. Nothing below overrides the spec; the two places where this plan proposes a change are explicitly flagged with **⚠ PROPOSED CHANGE**.

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

- **Next.js (App Router)** — spec-mandated. Server components for static-ish screens (City content, badge grids), client components for live game UI. Built-in font loading for the three Google families. Deploys to Vercel with zero config.
- **Separate Express API** rather than Next API routes — the game needs long-lived cron jobs (3× daily sync, Monday rollover at each group's local midnight) and a single place for game-logic invariants. Vercel serverless functions are a poor home for scheduled, stateful jobs; Railway runs a persistent Node process.
- **PostgreSQL** — spec-mandated, and correct: the game is heavily relational (users↔groups↔weeks↔logs), needs transactions for week rollover (badge awards + city advance must be atomic), and benefits from constraints (one prediction per player per week is a unique index, not application code).
- **REST, not GraphQL** — chosen deliberately (§3). The client's data needs are screen-shaped and predictable; there are no deep, variable nested queries that would justify GraphQL's complexity. REST + a small number of composed "screen payload" endpoints keeps the backend simple for CodEx to build and test.
- **State management: TanStack Query + Context** — server state (steps, leaderboard, bingo card) lives in TanStack Query caches keyed by endpoint; identity (current user, current group, current week) lives in one `SessionContext`. No Redux — the spec asks for minimal.

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
│       │   ├── index.ts            # app bootstrap, CORS, helmet, cookie parser
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
| `HEALTH_API_BASE` | api | `https://health.googleapis.com/v4` (per spec — verify exact base at integration time, §5) |
| `JWT_SECRET` | api | Signs session JWTs (httpOnly cookie) |
| `TOKEN_ENC_KEY` | api | 32-byte key, AES-256-GCM encryption of stored OAuth refresh tokens |
| `WEB_ORIGIN` | api | CORS allowlist — the Vercel URL |
| `NEXT_PUBLIC_API_URL` | web | Base URL of the Express API |
| `CRON_TZ_STRATEGY` | api | `per-group` (see jobs, §6 Module 8) |
| `SENTRY_DSN` | both | Error tracking (optional, §9) |

`.env.local` for dev (both apps), Railway/Vercel dashboard vars for production. Never commit secrets; `.env.example` documents every key.

### Security

- **OAuth tokens encrypted at rest** — refresh tokens stored AES-256-GCM in `users.fitbit_refresh_token_enc`; access tokens kept in memory/short-lived cache only.
- **Session** — httpOnly, `Secure`, `SameSite=Lax` cookie carrying a signed JWT (`user_id`, 7-day expiry, rotated on use). No tokens in localStorage.
- **CORS** — API allows only `WEB_ORIGIN`, credentials enabled.
- **PII discipline** — per spec: never log raw step data or tokens; structured logger redacts `steps`, `token`, `email` fields. Third-party services receive no PII (Sentry scrubbing on).
- **Input validation** — every route body/query validated with zod schemas from `packages/shared` before touching the DB.
- **Rate limiting** — `express-rate-limit` on auth routes and prediction submit.

---

## 2. Database Schema

Copy-paste-ready SQL. Run as migration `001_init.sql`, then `002_seed_cities.sql`.

```sql
-- ============================================================
-- 001_init.sql — Selena's Chase schema (PostgreSQL 16)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ---------- Reference data ----------

CREATE TABLE cities (
  id              SERIAL PRIMARY KEY,
  route_order     INTEGER NOT NULL UNIQUE,          -- fixed global route position
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  background_image TEXT,                            -- illustrated art URL
  lat             NUMERIC(8,5) NOT NULL,
  lng             NUMERIC(8,5) NOT NULL
);

CREATE TABLE landmarks (
  id          SERIAL PRIMARY KEY,
  city_id     INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  day         SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 7),  -- 1 = most iconic, 7 = hidden gem
  name        TEXT NOT NULL,
  fun_fact    TEXT NOT NULL,
  image       TEXT,
  UNIQUE (city_id, day)
);

CREATE TABLE badge_definitions (
  code        TEXT PRIMARY KEY,        -- 'city', 'prediction_win', 'nemesis_victor',
                                       -- 'bingo', 'blackout', 'hot_pursuit',
                                       -- 'perfect_week', 'streak_3', 'streak_6', 'streak_12'
  label       TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE bingo_challenge_definitions (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,      -- e.g. 'steps_10k_day'
  category    TEXT NOT NULL CHECK (category IN
                ('steps','workout','sleep','heart','social','wildcard')),
  label       TEXT NOT NULL,             -- short tile label
  icon        TEXT NOT NULL,             -- design-system Icon name
  detector    JSONB NOT NULL             -- machine-readable rule, e.g.
                                         -- {"metric":"steps","window":"day","op":">=","value":10000}
);

-- ---------- Core entities ----------

CREATE TABLE groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  invite_code  CHAR(6) NOT NULL UNIQUE,           -- A–Z, 0–9, unambiguous set
  admin_id     UUID,                              -- FK added after users exists
  timezone     TEXT NOT NULL DEFAULT 'America/Chicago',  -- governs week boundaries
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_sub      TEXT NOT NULL UNIQUE,           -- Google account id
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  group_id        UUID REFERENCES groups(id) ON DELETE SET NULL,  -- one group per account (v1)
  weekly_step_target INTEGER NOT NULL DEFAULT 70000
                  CHECK (weekly_step_target BETWEEN 35000 AND 140000),
  -- avatar config
  avatar_skin     SMALLINT NOT NULL DEFAULT 1 CHECK (avatar_skin BETWEEN 1 AND 6),
  avatar_hair     SMALLINT NOT NULL DEFAULT 1 CHECK (avatar_hair BETWEEN 1 AND 8),
  avatar_colorway SMALLINT NOT NULL DEFAULT 1 CHECK (avatar_colorway BETWEEN 1 AND 6),
  -- fitness connection
  fitbit_connected           BOOLEAN NOT NULL DEFAULT FALSE,
  fitbit_refresh_token_enc   BYTEA,               -- AES-256-GCM ciphertext
  fitbit_scopes              TEXT[],
  last_synced_at             TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE groups
  ADD CONSTRAINT groups_admin_fk FOREIGN KEY (admin_id)
  REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX users_group_idx ON users(group_id);

CREATE TABLE weeks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  city_id       INTEGER NOT NULL REFERENCES cities(id),
  starts_on     DATE NOT NULL,                 -- Monday (group's local tz)
  ends_on       DATE NOT NULL,                 -- Sunday
  group_target_steps INTEGER NOT NULL,         -- Σ member targets at week start
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','closed')),
  group_total_steps  INTEGER,                  -- filled at close
  target_hit    BOOLEAN,                       -- filled at close (badge eligibility)
  UNIQUE (group_id, starts_on)
);

CREATE INDEX weeks_active_idx ON weeks(group_id) WHERE status = 'active';

CREATE TABLE step_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL,
  steps       INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
  -- extra synced metrics consumed by bingo / city-depth detection
  workouts            JSONB NOT NULL DEFAULT '[]',  -- [{type,start,duration_min,zone_min}]
  sleep_minutes       INTEGER,
  bedtime             TIMESTAMPTZ,
  active_zone_minutes INTEGER,
  hr_zones            JSONB,                        -- {"fat_burn":22,"cardio":9,"peak":0}
  target_hit_at       TIMESTAMPTZ,                  -- first sync where daily target reached (nemesis tiebreak)
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

CREATE INDEX step_logs_date_idx ON step_logs(log_date);

CREATE TABLE predictions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id       UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predicted_steps INTEGER NOT NULL CHECK (predicted_steps > 0),
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  actual_delta  INTEGER,                       -- |predicted − actual|, filled at close
  is_winner     BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (week_id, user_id)                    -- one prediction per player per week
);

CREATE TABLE nemesis_matchups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id     UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  player_a    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_b    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rerolled    BOOLEAN NOT NULL DEFAULT FALSE,  -- one re-roll allowed
  daily_results JSONB NOT NULL DEFAULT '[]',   -- [{date, a_steps, b_steps, winner:'a'|'b'|'tie'}]
  score_a     SMALLINT NOT NULL DEFAULT 0,
  score_b     SMALLINT NOT NULL DEFAULT 0,
  winner_id   UUID REFERENCES users(id),       -- set when decided
  tiebreaker_date DATE,                        -- Saturday sudden-death if used
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','tiebreak','complete')),
  CHECK (player_a <> player_b),
  UNIQUE (week_id, player_a),
  UNIQUE (week_id, player_b)
);

CREATE TABLE bingo_cards (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id   UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- 25 tiles, row-major; index 12 is FREE SPACE
  tiles     JSONB NOT NULL,
            -- [{challenge_id, state:'incomplete'|'in_progress'|'complete',
            --   completed_at}, ... 25 entries; index 12 = {free:true,state:'complete'}]
  bingo_lines INTEGER NOT NULL DEFAULT 0,
  blackout  BOOLEAN NOT NULL DEFAULT FALSE,
  frozen    BOOLEAN NOT NULL DEFAULT FALSE,    -- true after Sunday close
  UNIQUE (week_id, user_id)
);

CREATE TABLE city_unlocks (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id   UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  landmark_id INTEGER NOT NULL REFERENCES landmarks(id),
  unlock_date DATE NOT NULL,                   -- the day this landmark was up for grabs
  unlocked  BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  triggering_user UUID REFERENCES users(id),   -- last player whose workout completed the set
  UNIQUE (week_id, landmark_id)
);

CREATE TABLE badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL REFERENCES badge_definitions(code),
  week_id   UUID REFERENCES weeks(id) ON DELETE SET NULL,
  city_id   INTEGER REFERENCES cities(id),     -- for city badges
  quality   TEXT CHECK (quality IN ('bronze','silver','gold')),  -- city badges only
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_code, week_id)        -- no dupes within a week
);

CREATE INDEX badges_user_idx ON badges(user_id);

CREATE TABLE notifications (
  id        BIGSERIAL PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind      TEXT NOT NULL CHECK (kind IN ('achievement','social','alert')),
  message   TEXT NOT NULL,
  read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_unread_idx ON notifications(user_id) WHERE NOT read;
```

```sql
-- ============================================================
-- 002_seed_cities.sql — route + 3 example cities × 7 landmarks
-- (remaining ~30 cities follow the same pattern; content task)
-- ============================================================

INSERT INTO cities (route_order, name, country, lat, lng) VALUES
  (1,  'Chicago',  'USA',     41.87810, -87.62980),
  (2,  'New York', 'USA',     40.71280, -74.00600),
  (3,  'Reykjavik','Iceland', 64.14660, -21.94260);
-- … continue route per spec: London, Paris, Berlin, Rome, Istanbul, Cairo,
-- Nairobi, Cape Town, Dubai, Mumbai, Bangkok, Tokyo, Seoul, Sydney, Lima,
-- Buenos Aires, São Paulo, Havana, Mexico City, Los Angeles → loop.

INSERT INTO landmarks (city_id, day, name, fun_fact) VALUES
  -- Chicago (day 1 most iconic → day 7 hidden gem)
  (1, 1, 'Cloud Gate (The Bean)',  'Its 168 steel plates were welded so smoothly the seams are invisible.'),
  (1, 2, 'Willis Tower Skydeck',   'On a clear day you can see four states from the 103rd floor.'),
  (1, 3, 'Navy Pier',              'Built in 1916, it once housed a jail for draft dodgers.'),
  (1, 4, 'Wrigley Field',          'Its ivy-covered outfield walls were planted in 1937.'),
  (1, 5, 'The Art Institute Lions','The two bronze lions get Bears helmets when the team makes the playoffs.'),
  (1, 6, 'Chicago Riverwalk',      'The river''s flow was reversed in 1900 — an engineering first.'),
  (1, 7, 'The Couch Place Alley',  'A theater-district alley locals call the city''s most haunted spot.'),
  -- New York
  (2, 1, 'Statue of Liberty',      'Her full name is "Liberty Enlightening the World."'),
  (2, 2, 'Times Square',           'Roughly 330,000 people pass through on a typical day.'),
  (2, 3, 'Central Park',           'It''s bigger than the country of Monaco.'),
  (2, 4, 'Brooklyn Bridge',        'P.T. Barnum marched 21 elephants across it to prove it was safe.'),
  (2, 5, 'Grand Central Terminal', 'The ceiling''s zodiac mural is painted backwards.'),
  (2, 6, 'The High Line',          'A freight rail line reborn as a 1.45-mile elevated park.'),
  (2, 7, 'The Whispering Gallery', 'Stand in opposite corners and whisper — Grand Central''s acoustic secret.'),
  -- Reykjavik
  (3, 1, 'Hallgrímskirkja',        'Its design echoes Iceland''s basalt lava columns.'),
  (3, 2, 'Harpa Concert Hall',     'Its glass facade mimics the country''s honeycomb basalt.'),
  (3, 3, 'Sun Voyager',            'Not a Viking ship — it''s a dreamboat ode to the sun.'),
  (3, 4, 'Perlan',                 'Built on six hot-water storage tanks that heat the city.'),
  (3, 5, 'Tjörnin Pond',           'Locals call it "the biggest bread soup in the world" for all the duck feeding.'),
  (3, 6, 'Laugavegur Street',      'The name means "wash road" — it led to the old hot springs.'),
  (3, 7, 'Grótta Lighthouse',      'A tidal island where locals quietly watch the northern lights.');

INSERT INTO badge_definitions (code, label, description) VALUES
  ('city',           'City Badge',      'Most steps in the group for the week'),
  ('prediction_win', 'Prediction Win',  'Closest group step prediction'),
  ('nemesis_victor', 'Nemesis Victor',  'Won the best-of-5 matchup'),
  ('bingo',          'Bingo',           'Completed a bingo line'),
  ('blackout',       'Blackout',        'Completed all 25 squares'),
  ('hot_pursuit',    'Hot Pursuit',     'Whole group logged a workout the same day'),
  ('perfect_week',   'Perfect Week',    'Hit personal step target every day'),
  ('streak_3',       '3-Win Streak',    'Won the city badge 3 weeks in a row'),
  ('streak_6',       '6-Win Streak',    'Won the city badge 6 weeks in a row'),
  ('streak_12',      '12-Win Streak',   'Won the city badge 12 weeks in a row');

-- Bingo challenge pool (subset; detector JSON drives auto-completion)
INSERT INTO bingo_challenge_definitions (code, category, label, icon, detector) VALUES
  ('steps_10k_day',     'steps',   '10,000 steps in a day',        'step',
   '{"metric":"steps","window":"day","op":">=","value":10000}'),
  ('steps_7k_noon',     'steps',   '7,000 steps before noon',      'step',
   '{"metric":"steps_before","hour":12,"op":">=","value":7000}'),
  ('target_5_streak',   'steps',   'Daily target 5 days straight', 'flame',
   '{"metric":"daily_target_streak","op":">=","value":5}'),
  ('group_200k',        'steps',   'Group hits 200,000 steps',     'globe',
   '{"metric":"group_week_steps","op":">=","value":200000}'),
  ('workout_today',     'workout', 'Log any workout today',        'workout',
   '{"metric":"workouts","window":"day","op":">=","value":1}'),
  ('workouts_3_week',   'workout', '3 workouts this week',         'workout',
   '{"metric":"workouts","window":"week","op":">=","value":3}'),
  ('azm_30',            'workout', '30+ active zone minutes',      'heart',
   '{"metric":"active_zone_minutes","window":"day","op":">=","value":30}'),
  ('workout_before_8',  'workout', 'Workout before 8am',           'clock',
   '{"metric":"workout_before","hour":8,"op":">=","value":1}'),
  ('sleep_7h',          'sleep',   '7+ hours of sleep',            'sleep',
   '{"metric":"sleep_minutes","window":"day","op":">=","value":420}'),
  ('bed_before_11_x2',  'sleep',   'In bed before 11pm ×2 nights', 'sleep',
   '{"metric":"bedtime_before","hour":23,"nights":2}'),
  ('sleep_8h_weekend',  'sleep',   '8+ hours on a weekend night',  'sleep',
   '{"metric":"sleep_minutes","window":"weekend_day","op":">=","value":480}'),
  ('cardio_zone',       'heart',   'Hit cardio zone in a workout', 'heart',
   '{"metric":"hr_zone_minutes","zone":"cardio","op":">=","value":1}'),
  ('fat_burn_20',       'heart',   '20 min in fat burn zone',      'heart',
   '{"metric":"hr_zone_minutes","zone":"fat_burn","op":">=","value":20}'),
  ('beat_nemesis_day',  'social',  'Beat your nemesis today',      'nemesis',
   '{"metric":"nemesis_day_win","op":">=","value":1}'),
  ('day_leader',        'social',  '#1 on the board for a day',    'trophy',
   '{"metric":"daily_rank","op":"==","value":1}'),
  ('hot_pursuit_day',   'social',  'Group-wide workout day',       'flame',
   '{"metric":"hot_pursuit","op":">=","value":1}'),
  ('rest_day',          'wildcard','Full rest day, steps still hit','star',
   '{"metric":"rest_day_with_target"}'),
  ('monday_target',     'wildcard','Hit step target on a Monday',  'star',
   '{"metric":"target_on_weekday","weekday":1}');
```

**Notes for CodEx**

- `bingo_cards.tiles` is denormalized JSONB on purpose: a card is always read and written whole, the 25-tile shape never joins against anything, and freezing is a single flag.
- `nemesis_matchups.daily_results` likewise — five rows of paired data always rendered together.
- Week boundaries use the **group's timezone** (`groups.timezone`); `starts_on`/`ends_on` are dates in that tz. The Monday rollover job computes per-group local midnight.
- Migrations: use `node-pg-migrate`. Number sequentially; never edit a shipped migration.

---
## 3. API Specification

REST. All routes under `/api`, JSON in/out, auth via session cookie unless marked public. Errors use a uniform envelope: `{ "error": { "code": "GROUP_FULL", "message": "…" } }` with appropriate HTTP status. Common error codes: `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `VALIDATION` 422, `CONFLICT` 409, `RATE_LIMITED` 429.

### Auth

| Method/Path | Auth | Description |
|---|---|---|
| `GET /api/auth/google` | public | Redirect to Google OAuth consent (login scopes + Health scopes in one flow) |
| `GET /api/auth/google/callback` | public | Exchange code; upsert user; encrypt + store refresh token; set session cookie; redirect to web (`/onboarding` if new, `/map` if returning) |
| `POST /api/auth/logout` | ✓ | Clear session cookie |
| `GET /api/auth/session` | ✓ | `{ user, group, activeWeek }` — boot payload for `SessionContext` |
| `DELETE /api/auth/fitbit` | ✓ | Revoke + delete stored tokens, set `fitbit_connected=false` |

### User

| Method/Path | Auth | Body → Response |
|---|---|---|
| `GET /api/users/me` | ✓ | full profile incl. avatar config, target, sync status |
| `PATCH /api/users/me` | ✓ | `{ display_name?, weekly_step_target?, avatar_skin?, avatar_hair?, avatar_colorway? }` (zod-validated ranges) |
| `GET /api/users/:id/stats` | ✓ same-group | `{ citiesEarned, winStreak, allTimeSteps, predictionWins }` |
| `GET /api/users/:id/badges` | ✓ same-group | badge list with definition + quality + city |

### Group

| Method/Path | Auth | Notes |
|---|---|---|
| `POST /api/groups` | ✓ | `{ name }` → creates group, generates unique 6-char invite code (charset `ABCDEFGHJKMNPQRSTUVWXYZ23456789`), sets caller as admin, joins caller. 409 if caller already in a group. |
| `POST /api/groups/join` | ✓ | `{ invite_code }` → 404 unknown code, 409 `GROUP_FULL` (max 8) or already-in-group |
| `GET /api/groups/me` | ✓ | group + member list (avatars, names) |
| `PATCH /api/groups/me` | admin | `{ name? }` |
| `DELETE /api/groups/me/members/:userId` | admin | remove player; reassigns their nemesis pairing if mid-week (re-pair or bye) |
| `POST /api/groups/me/leave` | ✓ | leave; if admin leaves, oldest member promoted |

### Week / Map screen

| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/weeks/current` | ✓ | Composed Map payload: `{ week, city, nextCity, selenaLeadSteps, route: [visited cities], progressStrip: [{user, steps, target, pct}], leaderboard: [{rank, user, steps, deltaVsLastWeek}], countdown, lastSyncedAt, state }` where `state ∈ 'in_progress'|'arrival'|'closing_soon'|'no_group'` |
| `GET /api/weeks/history` | ✓ | past weeks: city, badge result, totals |

`selenaLeadSteps` = `group_target_steps − group steps so far` floored at a taunt-minimum (config, e.g. 5,000) so Selena is always "ahead."

### Sync

| Method/Path | Auth | Notes |
|---|---|---|
| `POST /api/sync/run` | ✓ | Manual "sync now" for the caller (rate-limited 1/10 min). Same code path as the cron job. |
| `POST /api/internal/sync/group/:groupId` | internal token | Invoked by cron runner; not exposed via CORS |

### Prediction

| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/predictions/current` | ✓ | `{ myPrediction?, others: hidden|revealed, liveGroupTotal, revealAt, state }` — others hidden until all submitted OR Monday noon |
| `POST /api/predictions` | ✓ | `{ predicted_steps }` → 409 if already submitted or window closed (after Monday 11:59pm) |
| `GET /api/predictions/history` | ✓ | per-week results, win count |

### Nemesis

| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/nemesis/current` | ✓ | `{ matchup?, days: [{date, mySteps, theirSteps, winner}], score, state }` |
| `POST /api/nemesis/reroll` | ✓ | 409 if already rerolled or after Monday |
| `POST /api/nemesis/assign` | ✓ | for the "Get your nemesis" empty state (auto-assign) |

### Bingo

| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/bingo/current` | ✓ | my card (25 tiles with challenge labels/icons/states), bingo count, blackout flag |
| `GET /api/bingo/friends` | ✓ | `[ {user, bingoLines} ]` for the friend progress row |

No write endpoints — tiles are server-detected only (spec: no manual input).

### City

| Method/Path | Auth | Notes |
|---|---|---|
| `GET /api/cities/current` | ✓ | city meta + 7 landmark slots: locked/unlocked/today states, today's group workout status (`[{user, workedOutToday}]`, "3 of 5" counts) |
| `GET /api/cities/:id` | ✓ | past city trophy view (fully revealed if badge week) or `FORBIDDEN` for future cities |

### Badges

| `GET /api/badges/definitions` — public reference list. User badge reads live under `/api/users/:id/badges`.

### OpenAPI

Author `apps/api/openapi.yaml` (OpenAPI 3.0) mirroring the tables above; generate the typed client for `apps/web/lib/api.ts` with `openapi-typescript`. The table above is normative for behavior; the YAML is normative for shapes.

---

## 4. Frontend Component Architecture

### Design-system layer (already exists — consume, don't rebuild)

From `packages/design-system` (`window.DesignSystem_19034b` in artifact mode; direct imports in the app): `Icon`, `Button`, `Card`, `StatCard`, `Badge`, `CountdownPill`, `Input`, `Slider`, `Toast`, `EmptyState`, `Skeleton`, `Sidebar`, `TabBar`, `Avatar`, `ProgressStrip`, `CityBadge`, `LandmarkTile`, `BingoTile`, `SkyscraperPair`, `PredictionCard`, `MapPin`, `WorldMap`. The app composes these; new code adds **screen containers and data wiring only**. Any net-new component must use tokens from `styles.css` — no magic numbers.

### Shell

```
<RootLayout>                       fonts (Barlow Condensed, DM Sans, DM Mono), styles.css
└── <Providers>                    QueryClientProvider + SessionProvider + ToastProvider
    └── <AppShell>                 ds: Sidebar (≥1024px) ⇄ TabBar (<1024px), avatar→/profile
        └── {screen}
```

- `SessionContext` — `{ user, group, activeWeek, refresh() }` from `GET /api/auth/session`. Identity only.
- All game data: TanStack Query hooks (`useMapData`, `useBingoCard`, …), `staleTime` 60s, refetch on window focus. Steps only change on sync, so polling is unnecessary; a `lastSyncedAt` pill communicates freshness.
- Local `useState` for all pure-UI state (input values, open modals, animation triggers).

### Screen trees (ds: = design-system component)

```
MapScreen
├── MapHero
│   ├── ds:WorldMap (route, visited cities, pins)
│   │   ├── ds:MapPin variant=current   → onClick: router.push('/city')
│   │   └── ds:MapPin variant=selena    → onClick: SelenaTooltip
│   ├── SelenaTooltip          {leadSteps: number}
│   └── ds:CountdownPill       (visible when state='closing_soon')
├── ds:ProgressStrip           {players: [{avatarConfig, pct, name, steps}]}
│   └── ds:Avatar size=40 (one per player, positioned by pct)
├── WeeklyLeaderboard
│   └── LeaderboardRow ×N      {rank, avatarConfig, name, steps, delta, isMe}
│       └── ds:Avatar size=24
├── ArrivalCelebration         (state='arrival': confetti + "You've arrived in {city}!")
└── ds:EmptyState              (state='no_group': create/join CTA)

PredictionScreen
├── GlobeBackground            (illustrated bright globe, slow parallax)
├── ds:PredictionCard
│   ├── LiveGroupTotal         (DM Mono, live from query)
│   ├── ds:Input variant=numeric  (pre-submit)
│   ├── ds:Button "Lock it in"
│   └── PredictionResults      (revealed | waiting count | final ranked list)
└── ds:CountdownPill

CityScreen
├── CityHeader                 {name, country} (Barlow display)
├── LandmarkGrid               (3-2-2 layout)
│   └── ds:LandmarkTile ×7     {state: locked|unlocked|today, landmark}
├── GroupWorkoutStatus
│   ├── ds:Avatar size=24 ×N   (+ check overlay if workedOutToday)
│   └── ProgressLabel          "3 of 5 worked out today — 1 more to unlock!"
└── UnlockToastTrigger         (fires ds:Toast achievement on new unlock)

BingoScreen
├── BingoGrid (5×5)
│   └── ds:BingoTile ×25       {state, icon, label, isFree}
├── BingoLineOverlay           (sweep animation across completed lines)
├── BingoStatus                "1 Bingo — keep going!" + blackout progress
└── FriendProgressRow
    └── ds:Avatar size=24 + bingo count ×N

NemesisScreen
├── ScoreBar                   {me, nemesis, scoreA, scoreB} (avatars both sides)
├── Skyline
│   └── ds:SkyscraperPair ×5   {day, mySteps, theirSteps, state: done|today|future}
├── TodayContextStrip          {mySteps, theirSteps, pctToTarget ×2}
├── ds:EmptyState              ("Get your nemesis" + assign button)
└── WinnerBanner               (week complete: crown animation, rematch prompt)

ProfileScreen
├── AvatarShowcase             ds:Avatar size=120 (idle sway loop)
├── StatsRow                   ds:StatCard ×3 (cities | streak | all-time steps as km/mi)
├── BadgeCollection
│   └── ds:CityBadge / ds:Badge ×N  {quality border}
├── AvatarEditor (modal)       3-step: skin → hair → colorway, live preview
└── SettingsPanel              ds:Slider (target), sync status, disconnect, sign out

Onboarding (route group, 5 steps)
Login → ConnectFitbit → TargetSlider → AvatarEditor → CreateOrJoinGroup → /map
```

Every list/grid has a `ds:Skeleton` loading variant and `ds:EmptyState` per the design brief. Props interfaces live in `packages/shared/types.ts` and mirror API response schemas — no ad-hoc shapes.

---

## 5. Google Health API Integration (Fitbit data)

> **⚠ Verify at integration time:** the spec names `health.googleapis.com/v4`. Google's Fitbit data surface has been in migration; before Module 1, confirm the current endpoint base, scope strings, and quota tiers in Google's official docs and adjust `HEALTH_API_BASE` + the scope list accordingly. Everything else in this section is endpoint-agnostic by design (the `fitbitClient` service is the single touchpoint).

### OAuth 2.0 flow (combined login + health consent)

1. `GET /api/auth/google` builds the consent URL: response_type `code`, `access_type=offline`, `prompt=consent` (forces refresh token on first grant), scopes = `openid email profile` + health scopes for **activity (steps, workouts), sleep, heart rate**.
2. Callback exchanges the code server-side, verifies the `id_token`, upserts the user by `google_sub`.
3. Refresh token → AES-256-GCM encrypt with `TOKEN_ENC_KEY` → `users.fitbit_refresh_token_enc`. Access token cached in-process (LRU, expiry-aware) — never persisted.
4. Set session cookie, redirect.

If a user declines health scopes but completes login, `fitbit_connected=false` and the app shows a reconnect banner; steps render as 0 with a "connect Fitbit" CTA.

### Sync pull (per user, per run)

```
syncUser(user):
  token   = refreshAccessToken(user)            # 401 → refresh → retry once
  date    = today in group tz (also re-pull yesterday on the noon run
            to catch late device syncs)
  steps   = GET {BASE}/users/me/steps?date=…
  acts    = GET {BASE}/users/me/activities?date=…
  azm     = GET {BASE}/users/me/active-zone-minutes?date=…
  sleep   = GET {BASE}/users/me/sleep?date=…
  hr      = GET {BASE}/users/me/heart-rate?date=…   (zones summary)
  UPSERT step_logs (user_id, log_date) — set steps, workouts, sleep, azm, hr_zones
  if steps ≥ dailyTarget and target_hit_at IS NULL → set target_hit_at = now()
```

### Schedule

3× daily per spec — **noon, 6pm, midnight in the group's timezone**. The cron runner ticks hourly; on each tick it selects groups whose local time matches a sync hour and enqueues `syncGroup(groupId)`. Midnight run doubles as day-close: after syncing, it runs unlock/bingo/nemesis detection for the just-ended day (§6 Module 8).

### Error handling

- **Rate limits (429):** exponential backoff with jitter (1s → 32s, 5 tries); per-user failures don't abort the group batch.
- **Token refresh failure (invalid_grant):** mark `fitbit_connected=false`, queue an alert notification ("Sync failed — reconnect Fitbit"), skip user until reconnected.
- **Partial sync:** each metric pull is independent; store what succeeded, log (redacted) what failed, retry missing metrics next run. `last_synced_at` updates only if the steps pull succeeded.
- **Idempotency:** UPSERT on `(user_id, log_date)` means re-running a sync is always safe.

### Caching & testing

- No extra caching layer: `step_logs` *is* the cache; the app never reads the Health API at request time. Freshness = `last_synced_at`, surfaced on the Map screen.
- `services/fitbitClient.ts` is the only module that talks to Google. Tests inject a `MockFitbitClient` with fixture days (normal day, zero-activity day, big workout day, missing-sleep day, 429 storm). Integration testing pre-launch uses one real sandbox/test Fitbit account per the launch checklist.

---
## 6. Feature Modules — build order, acceptance criteria, dependencies

Modules are sequential; each ends in a demoable deliverable. Module 8 (sync) is listed eighth per the brief, but a **stub sync** (manual `POST /api/sync/run` against the mock client) ships inside Module 2 so Modules 2–7 can be developed against realistic data flow; Module 8 then replaces the stub's trigger with cron + real API.

### Module 0 — Foundations (prerequisite, ~small)
Monorepo scaffold, Express bootstrap, Postgres + migrations 001/002, design-system package wired into Next.js (fonts, `styles.css`, tokens), CI (lint, typecheck, test). **Done when:** `npm run dev` boots web+api, seeded DB, blank AppShell renders with Sidebar/TabBar swap at 1024px.

### Module 1 — Auth & Onboarding
Build: Google OAuth routes, token encryption, session cookie, onboarding flow (Connect Fitbit → target slider 35k–140k default 70k → 3-step avatar editor with live preview → create/join group with invite code), group CRUD endpoints.
Depends on: M0.
**Acceptance:** new user completes all 5 onboarding steps and lands on Map; second user joins via 6-char code; 9th member is rejected with `GROUP_FULL`; declining health scopes still creates an account with reconnect banner; refresh token verified encrypted in DB (not plaintext).

### Module 2 — Map Screen + Leaderboard (+ sync stub)
Build: `GET /api/weeks/current` composed payload; first-week creation on group formation (city = route_order 1, `group_target_steps` = Σ targets); WorldMap composition with route + pins + Selena tooltip; ProgressStrip wiring (`pct = steps/target`, clamp 100%); leaderboard with delta vs last week; countdown + arrival + no-group states; mock-client sync stub.
Depends on: M1.
**Acceptance:** with fixture step data, avatars sit at correct strip positions; leaderboard sorted desc with my row highlighted; tapping current pin routes to /city; tapping Selena shows "Selena is N steps ahead"; "no group" overlay when groupless; `lastSyncedAt` pill renders.

### Module 3 — City Screen + Landmarks
Build: `GET /api/cities/current`; daily unlock detection (`everyone in group has ≥1 workout entry for date D → unlock landmark day(D)`), `city_unlocks` writes with `triggering_user`; LandmarkGrid 3-2-2 with locked silhouette / unlocked color+fact / today glowing-border states; unlock animation (silhouette → color bloom, 500ms spring per motion spec); group workout status row; achievement toast; past-city trophy view; future-city forbidden.
Depends on: M2 (week context, sync stub).
**Acceptance:** when the last member's workout syncs, the day's landmark flips with bounce + toast "[Player] logged a workout — [Landmark] unlocked!"; one inactive member at day close keeps it locked permanently; day 1 maps to landmark day 1 … day 7 to day 7; reduced-motion users get a no-bounce crossfade.

### Module 4 — Prediction Screen
Build: prediction endpoints with one-per-week unique constraint and Monday-midnight submission window; reveal logic (all-in OR Monday noon); bright illustrated globe background; numeric DM Mono input + "Lock it in"; waiting / revealed / final-result states; week-close scoring (`actual_delta`, winner = min delta, ties → earliest `submitted_at`).
Depends on: M2.
**Acceptance:** second submit returns 409; predictions hidden until reveal condition; after week close the ranked result shows actual total, each delta, and the winner flagged.

### Module 5 — Bingo Screen
Build: Monday card generation (24 random distinct challenges from the pool + free space at index 12, category-balanced sampling); detector engine that evaluates `bingo_challenge_definitions.detector` JSON against `step_logs` (+ group/nemesis context) each sync; line detection (5 rows + 5 cols + 2 diagonals), blackout detection; BingoGrid with all four tile states; line sweep animation (400ms, gold flash); friend progress row; card freeze on Sunday close; bingo/blackout badge awards.
Depends on: M3 (workout data shape), M6 detectors `beat_nemesis_day` stubbed until M6 lands (tile simply stays incomplete).
**Acceptance:** fixture day with 10,400 steps auto-completes `steps_10k_day`; completing a full row increments `bingo_lines` and fires the sweep; 25/25 sets blackout + awards badge; no write endpoint exists; frozen card rejects further detection.

### Module 6 — Nemesis Screen
Build: Monday random pairing within group (odd member count → one player gets a bye/"Selena's day off" empty state); one re-roll; daily winner computation at day close (higher steps; tie → earlier `target_hit_at`; both null → tie carries); best-of-5 Mon–Fri; Saturday sudden-death on 5-day tie (see open question below); SkyscraperPair skyline with heights normalized to the max across both players' week, gold crown on taller, future-day outlines, today pulsing; winner banner + Nemesis Victor badge; rematch prompt Monday.
Depends on: M2.
**Acceptance:** deterministic fixtures produce correct 5-day score; tiebreak ordering verified; reroll allowed once then 409; building heights proportional and crowned correctly; reduced-motion skips the rise animation.
**Open question carried from spec (#3):** weekend tiebreaker — this plan implements **Saturday sudden death** (the spec's own "Tie after 5 days" state row says exactly this), and treats "or straight to Monday" as rejected. Flagging per the no-silent-decisions rule.

### Module 7 — Profile & Badge System
Build: profile screen (120px avatar idle sway, stats row, badge grid with bronze/silver/gold borders, special badges); avatar editor reuse from onboarding; settings (target slider, sync status, disconnect Fitbit → `DELETE /api/auth/fitbit`, sign out); stats endpoints; streak badge computation (3/6/12 consecutive city-badge wins, evaluated at week close).
Depends on: M2–M6 (badges exist to display).
**Acceptance:** editing avatar updates every Avatar render app-wide on next fetch; all-time steps formatted as km/mi in DM Mono; disconnect revokes and flips the sync banner; a 3-week fixture winning streak yields `streak_3`.

### Module 8 — Data Sync & Cron Jobs (real)
Build: real `fitbitClient` against the verified Health API base; hourly cron tick → group-local noon/6pm/midnight runs; midnight pipeline order: **sync all members → landmark unlock detection → bingo detection → nemesis day close → notifications**; Monday 00:00 rollover transaction: close week (totals, `target_hit`), award city badge to step leader (quality by unlock count 0–2/3–5/6–7, only if group target hit — per resolved spec decision the group advances regardless), score predictions, finalize nemesis, freeze bingo cards, evaluate perfect-week/hot-pursuit/streak badges, create next week (next `route_order`, wrap at route end), generate new bingo cards, assign nemeses, open prediction window.
Depends on: M2–M7.
**Acceptance:** a simulated full week (clock-injected tests) rolls over atomically — partial failure rolls back; reruns are idempotent; backoff verified against a mocked 429 storm; `last_synced_at` accurate; no step values appear in logs.

### Module 9 — Notifications & Polish
Build: notifications table → toast surfacing (achievement gold / social blue / alert red borders per design system); week-closure summary card; arrival confetti as the app's biggest moment; loading skeletons everywhere; error states (sync failed, Fitbit disconnected mid-week, member removed); responsive QA pass on iOS Safari + Android Chrome; `prefers-reduced-motion` audit; Lighthouse a11y ≥ 95.
Depends on: all.
**Acceptance:** launch checklist (§10 of the brief) fully green.

---

## 7. Design System Implementation Checklist

The system **already exists** in the project bundle — this is integration work, not creation.

- [ ] Copy `packages/design-system` from the bundle: `styles.css` entry + `tokens/` (colors, typography, spacing, effects, base) — link once in `app/layout.tsx`.
- [ ] Fonts via `next/font/google`: Barlow Condensed 700, DM Sans 400/500, DM Mono — matching the `@import` in `styles.css` (prefer next/font, remove the CSS import to avoid double-load).
- [ ] Port React components to direct ESM imports (drop the `window.DesignSystem_19034b` artifact shim); add TS types from each `*.prompt.md`.
- [ ] Icon set: `components/icons/Icon.jsx` — 24px / 2px stroke / `currentColor`; verify all names used by screens exist (`map, prediction, city, bingo, nemesis, step, workout, sleep, heart, badge, settings, sync, crown, star, lock, check, close, chevronRight, flame, clock, globe, trophy`).
- [ ] Motion utilities: spring `cubic-bezier(.34,1.56,.64,1)` and ease-out `(.22,1,.36,1)` exposed as CSS vars; confetti util (canvas-confetti, themed to blue/gold/red/cream); every animation gated by `prefers-reduced-motion` (springs → ease-out, loops stop).
- [ ] Glows `--glow-blue/gold/red` reserved for achievement/active states only; navy-tinted shadows; 1px `--hairline` card borders.
- [ ] Breakpoints: ≥1024 sidebar, 768–1023 tab bar condensed, <768 tab bar + ≥44px touch targets + safe-area insets.
- [ ] Content voice rules from the README enforced in copy: uppercase via CSS not source text, DM Mono comma-grouped numbers, no emoji, second-person cheeky tone.
- [ ] Lint guard: the project ships `_adherence_oxlintrc.json` — wire it into CI so raw hex values / magic numbers outside `tokens/` fail the build.
- [ ] Optional: deploy the bundle's `ui_kits/selenas-chase/index.html` as a static `/design` route for reference (the brief's "component gallery, optional but recommended").

---

## 8. Testing Matrix

| Layer | What | Tooling | When |
|---|---|---|---|
| Unit (api) | invite-code gen, prediction window/scoring, nemesis daily winner + tiebreak, bingo detector engine (one test per challenge code), badge quality (bronze/silver/gold boundaries 2/3 and 5/6), streak detection, position math `steps/target` | Vitest + pg-mem or test DB | every PR |
| Unit (web) | ProgressStrip positioning, leaderboard sort/delta, countdown color thresholds (muted→gold@2d→red@24h), avatar param rendering | Vitest + Testing Library | every PR |
| Integration | group create → week create → fixture syncs → unlock → arrival → rollover transaction (atomicity + idempotency: run rollover twice, assert single badge set) | Vitest against Dockerized Postgres, `MockFitbitClient`, injected clock | every PR |
| E2E | signup → onboard → create group → second user joins → fixture steps → landmark unlock toast → fast-forward week → badge in profile | Playwright, seeded test env, mocked Google OAuth + Health | nightly + pre-deploy |
| Sync resilience | 429 storm, expired refresh token, partial-metric failure, double-run idempotency | Vitest, mock client fault injection | every PR |
| A11y / motion | axe-core on all 6 screens; `prefers-reduced-motion` snapshot (no transform animations present) | Playwright + axe | nightly |
| Visual | tile/badge/skyline states vs design system | Playwright screenshots on the `/design` gallery | on ds changes |

Never call the real Health API in any automated test (spec guardrail). One manual pre-launch pass with a real Fitbit account covers the checklist item.

---

## 9. Deployment Steps

1. **Provision** — Railway project: Postgres plugin + `api` service (root `apps/api`, start `node dist/index.js`); Vercel project for `apps/web` (monorepo root dir setting). Custom domains: `app.…` (Vercel), `api.…` (Railway).
2. **Google Cloud** — create OAuth client (web), authorized redirect = `https://api.…/api/auth/google/callback`; enable the Health/Fitbit API surface; request the activity/sleep/heart scopes; submit OAuth verification (health scopes are sensitive — start this **early**, it can take weeks).
3. **Secrets** — set all §1 env vars in Railway/Vercel dashboards; generate `TOKEN_ENC_KEY` (`openssl rand -hex 32`) and `JWT_SECRET`.
4. **Migrations** — `node-pg-migrate up` runs as Railway release command on every deploy; migrations are forward-only, numbered, reviewed.
5. **CI/CD** — GitHub Actions: lint (incl. adherence config) + typecheck + unit/integration on PR; merge to `main` → Vercel auto-deploy + Railway auto-deploy; Playwright suite against a preview env gate before production promote.
6. **Cron** — node-cron inside the api process (hourly tick, §5). Railway keeps the process warm; add a `/healthz` endpoint + uptime ping.
7. **Monitoring** — Sentry (web+api, PII scrubbing on); structured JSON logs on Railway; sync-job dashboard = a `sync_runs` log table + simple `/api/internal/sync/status`; alert if any group misses 2 consecutive sync windows.
8. **Smoke test** — production checklist run with a real Google account + Fitbit device before invite codes go out.

---

## 10. Estimated Effort

Assumes one engineer (or CodEx-driven equivalent) familiar with the stack; design system already built.

| Module | Estimate |
|---|---|
| M0 Foundations | 2–3 days |
| M1 Auth & Onboarding | 4–5 days (OAuth + encryption + 5-step flow) |
| M2 Map + Leaderboard (+ sync stub) | 4–5 days |
| M3 City + Landmarks | 3–4 days |
| M4 Prediction | 2–3 days |
| M5 Bingo (detector engine is the bulk) | 4–5 days |
| M6 Nemesis | 3–4 days |
| M7 Profile & Badges | 2–3 days |
| M8 Real sync + rollover pipeline | 4–5 days |
| M9 Notifications & polish | 3–4 days |
| Content: remaining ~30 cities × 7 landmarks | 2–3 days (writing task, parallelizable) |
| **Total** | **~6–7 weeks** (plus Google OAuth verification lead time, started in week 1) |

---

## Flagged decisions (no silent overrides)

1. **REST over GraphQL** — justified §1/§3; spec allowed either.
2. **Saturday sudden-death tiebreaker** — adopted from the spec's own Nemesis state table; spec open question #3 considered resolved by this plan. Confirm before M6 ships.
3. **Health API base URL** — spec's `health.googleapis.com/v4` must be re-verified against current Google docs before M1; the `fitbitClient` isolation makes this a one-file change.
4. **Sync stub moved into M2** — the brief lists sync as Module 8; this plan front-loads a mock-backed stub so Modules 2–7 develop against real data flow. M8's scope (cron + real API + rollover) is unchanged.
5. **Landmark content sourcing (open question #4)** — this plan assumes curated text in the DB (seeded) + illustrated images delivered as static assets, matching the design system's "illustrated, not photographic" constraint.
6. **Notifications (open question #5)** — v1 in-app only, per Module 9.
