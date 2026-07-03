-- ============================================================
-- 004 — M10 "Field Ops" (addendum)
-- · Each city has exactly 5 recon landmarks (was 7)
-- · Objective pool grows to 50+ with fine variants, new
--   categories, and honor-system (self-reported) sources
-- · Scout-token economy artifacts: intel_cards (personal wallet),
--   tile_gifts (2 assists/week). Team landmark unlocks reuse
--   city_unlocks (unlock_date paces, triggering_user = scouted by).
-- · Accessibility: per-user objective prefs + per-group disabled
--   categories feed weekly card substitutions.
-- ============================================================

-- ---- 5 recon landmarks per city ----
DELETE FROM landmarks WHERE day > 5;

-- ---- Objective pool: new categories + source flag ----
ALTER TABLE bingo_challenge_definitions
  DROP CONSTRAINT bingo_challenge_definitions_category_check;
ALTER TABLE bingo_challenge_definitions
  ADD CONSTRAINT bingo_challenge_definitions_category_check CHECK (category IN
    ('steps','workout','sleep','heart','social','wildcard',
     'strength','cardio','recovery','hydration'));
ALTER TABLE bingo_challenge_definitions
  ADD COLUMN source TEXT NOT NULL DEFAULT 'auto'
    CHECK (source IN ('auto','honor'));

-- ---- Accessibility knobs ----
ALTER TABLE users
  ADD COLUMN objective_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE groups
  ADD COLUMN disabled_categories JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ---- Intel Wallet: personal case-file collection ----
CREATE TABLE intel_cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  landmark_id INTEGER NOT NULL REFERENCES landmarks(id),
  city_id     INTEGER NOT NULL REFERENCES cities(id),
  week_id     UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  -- 'scouted' on first earn; 'confirmed' holo variant on a revisit week
  variant     TEXT NOT NULL DEFAULT 'scouted'
                CHECK (variant IN ('scouted','confirmed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, landmark_id, week_id)
);
CREATE INDEX intel_cards_user_idx ON intel_cards (user_id, created_at DESC);

-- ---- Gift-a-Tile: cover a completed tile for a teammate ----
CREATE TABLE tile_gifts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id      UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  from_user    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES bingo_challenge_definitions(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- a tile can only be covered once per recipient per week
  UNIQUE (week_id, to_user, challenge_id)
);
CREATE INDEX tile_gifts_from_idx ON tile_gifts (week_id, from_user);

-- ---- Pool expansion: fine variants + honor objectives (26 new; pool = 52) ----
INSERT INTO bingo_challenge_definitions (code, category, label, icon, detector, source) VALUES
  -- steps fine variants (auto)
  ('steps_5k_noon',     'steps',     '5,000 steps before noon',       'step',    '{"metric":"steps_before","hour":12,"value":5000}', 'auto'),
  ('steps_6k_noon',     'steps',     '6,000 steps before noon',       'step',    '{"metric":"steps_before","hour":12,"value":6000}', 'auto'),
  ('steps_5k_10am',     'steps',     '5,000 steps before 10am',       'step',    '{"metric":"steps_before","hour":10,"value":5000}', 'auto'),
  ('steps_8k_day',      'steps',     '8,000 steps in a day',          'step',    '{"metric":"steps","window":"day","op":">=","value":8000}', 'auto'),
  ('steps_12k_day',     'steps',     '12,000 steps in a day',         'step',    '{"metric":"steps","window":"day","op":">=","value":12000}', 'auto'),
  ('steps_18k_day',     'steps',     '18,000 steps in a day',         'step',    '{"metric":"steps","window":"day","op":">=","value":18000}', 'auto'),
  ('steps_evening_4k',  'steps',     '4,000 steps after 6pm',         'step',    '{"metric":"steps_after","hour":18,"value":4000}', 'auto'),
  -- workout streak variants (auto)
  ('workouts_2_row',    'workout',   'Workouts 2 days in a row',      'workout', '{"metric":"workout_day_streak","op":">=","value":2}', 'auto'),
  ('workouts_3_row',    'workout',   'Workouts 3 days in a row',      'workout', '{"metric":"workout_day_streak","op":">=","value":3}', 'auto'),
  ('workout_45min',     'workout',   'A 45-minute workout',           'workout', '{"metric":"workout_duration","op":">=","value":45}', 'auto'),
  -- strength (honor system)
  ('strength_session',  'strength',  'A strength session',            'workout', '{"metric":"honor"}', 'honor'),
  ('strength_2_week',   'strength',  '2 strength sessions this week', 'workout', '{"metric":"honor"}', 'honor'),
  ('core_15',           'strength',  '15 minutes of core work',       'workout', '{"metric":"honor"}', 'honor'),
  -- cardio (mixed)
  ('cardio_30',         'cardio',    '30 minutes in cardio zone',     'heart',   '{"metric":"hr_zone_minutes","zone":"cardio","op":">=","value":30}', 'auto'),
  ('cardio_class',      'cardio',    'A cardio class (any kind)',     'flame',   '{"metric":"honor"}', 'honor'),
  ('swim_session',      'cardio',    'A swim session',                'globe',   '{"metric":"honor"}', 'honor'),
  ('bike_ride',         'cardio',    'A bike ride',                   'flame',   '{"metric":"honor"}', 'honor'),
  ('pilates_yoga',      'cardio',    'Pilates or yoga class',         'star',    '{"metric":"honor"}', 'honor'),
  -- recovery (mixed)
  ('stretch_15',        'recovery',  '15 minutes of stretching',      'clock',   '{"metric":"honor"}', 'honor'),
  ('sleep_7h_x3',       'recovery',  '7+ hours of sleep ×3 nights',   'sleep',   '{"metric":"sleep_nights","hours":7,"op":">=","value":3}', 'auto'),
  ('screens_off_10',    'recovery',  'Screens off by 10pm',           'sleep',   '{"metric":"honor"}', 'honor'),
  -- hydration (honor)
  ('hydration_day',     'hydration', 'Hit your water goal today',     'globe',   '{"metric":"honor"}', 'honor'),
  ('hydration_x3',      'hydration', 'Water goal ×3 days',            'globe',   '{"metric":"honor"}', 'honor'),
  -- social (mixed)
  ('group_walk',        'social',    'Walk with a teammate',          'nemesis', '{"metric":"honor"}', 'honor'),
  ('walk_buddy',        'social',    'Bring a friend on a walk',      'nemesis', '{"metric":"honor"}', 'honor'),
  ('team_150k',         'social',    'Group hits 150,000 steps',      'globe',   '{"metric":"group_week_steps","op":">=","value":150000}', 'auto');
