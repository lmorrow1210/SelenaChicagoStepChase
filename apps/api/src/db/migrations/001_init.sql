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
  code        TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE bingo_challenge_definitions (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL CHECK (category IN
                ('steps','workout','sleep','heart','social','wildcard')),
  label       TEXT NOT NULL,
  icon        TEXT NOT NULL,
  detector    JSONB NOT NULL
);

-- ---------- Core entities ----------
CREATE TABLE groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  invite_code  CHAR(6) NOT NULL UNIQUE,
  admin_id     UUID,                              -- FK added after users exists
  timezone     TEXT NOT NULL DEFAULT 'America/Chicago',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_sub      TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  group_id        UUID REFERENCES groups(id) ON DELETE SET NULL,
  weekly_step_target INTEGER NOT NULL DEFAULT 70000
                  CHECK (weekly_step_target BETWEEN 35000 AND 140000),
  avatar_skin     SMALLINT NOT NULL DEFAULT 1 CHECK (avatar_skin BETWEEN 1 AND 6),
  avatar_hair     SMALLINT NOT NULL DEFAULT 1 CHECK (avatar_hair BETWEEN 1 AND 8),
  avatar_colorway SMALLINT NOT NULL DEFAULT 1 CHECK (avatar_colorway BETWEEN 1 AND 6),
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
  group_target_steps INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','closed')),
  group_total_steps  INTEGER,
  target_hit    BOOLEAN,
  UNIQUE (group_id, starts_on)
);
CREATE INDEX weeks_active_idx ON weeks(group_id) WHERE status = 'active';

CREATE TABLE step_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL,
  steps       INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
  workouts            JSONB NOT NULL DEFAULT '[]',
  sleep_minutes       INTEGER,
  bedtime             TIMESTAMPTZ,
  active_zone_minutes INTEGER,
  hr_zones            JSONB,
  target_hit_at       TIMESTAMPTZ,             -- first sync where daily target reached (nemesis tiebreak)
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
  actual_delta  INTEGER,
  is_winner     BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (week_id, user_id)
);

CREATE TABLE nemesis_matchups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id     UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  player_a    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_b    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rerolled    BOOLEAN NOT NULL DEFAULT FALSE,
  daily_results JSONB NOT NULL DEFAULT '[]',
  score_a     SMALLINT NOT NULL DEFAULT 0,
  score_b     SMALLINT NOT NULL DEFAULT 0,
  winner_id   UUID REFERENCES users(id),
  tiebreaker_date DATE,
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
  tiles     JSONB NOT NULL,   -- 25 tiles row-major; index 12 = free space
  bingo_lines INTEGER NOT NULL DEFAULT 0,
  blackout  BOOLEAN NOT NULL DEFAULT FALSE,
  frozen    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (week_id, user_id)
);

CREATE TABLE city_unlocks (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id   UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  landmark_id INTEGER NOT NULL REFERENCES landmarks(id),
  unlock_date DATE NOT NULL,
  unlocked  BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  triggering_user UUID REFERENCES users(id),
  UNIQUE (week_id, landmark_id)
);

CREATE TABLE badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL REFERENCES badge_definitions(code),
  week_id   UUID REFERENCES weeks(id) ON DELETE SET NULL,
  city_id   INTEGER REFERENCES cities(id),
  quality   TEXT CHECK (quality IN ('bronze','silver','gold')),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_code, week_id)
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
