-- N1: deterministic narrative beats.
-- Beats are in-fiction messages triggered by real game events. They are
-- written to beat_events for history/idempotency and delivered through the
-- existing notifications feed as kind='beat'.

ALTER TABLE notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_kind_check
  CHECK (kind IN ('achievement', 'social', 'alert', 'beat'));

CREATE TABLE beat_definitions (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  trigger JSONB NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('user', 'group')),
  variants JSONB NOT NULL,
  cooldown_days INT NOT NULL DEFAULT 7,
  priority INT NOT NULL DEFAULT 0
);

CREATE TABLE beat_events (
  id BIGSERIAL PRIMARY KEY,
  beat_id INT NOT NULL REFERENCES beat_definitions(id),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE SET NULL,
  fired_on DATE NOT NULL,
  rendered TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (beat_id, group_id, user_id, fired_on)
);
CREATE INDEX beat_events_group_idx ON beat_events(group_id, fired_on DESC);
CREATE INDEX beat_events_user_idx ON beat_events(user_id, fired_on DESC) WHERE user_id IS NOT NULL;

INSERT INTO beat_definitions (slug, trigger, scope, variants, cooldown_days, priority) VALUES
  (
    'sunday_nemesis_reveal',
    '{"phase":"reveal","metric":"sunday_nemesis_reveal"}',
    'user',
    '["I picked {nemesis} for you. Try to keep up. —S.C."]',
    7,
    100
  ),
  (
    'near_miss_week',
    '{"phase":"week","metric":"near_miss_week","pct":0.05}',
    'group',
    '["You were {gap} steps from cornering her in {city}. She knows it."]',
    14,
    90
  ),
  (
    'sudden_death_eve',
    '{"phase":"day","metric":"sudden_death_eve"}',
    'user',
    '["Five days. Dead even. Saturday decides it. Sleep — or don''t."]',
    7,
    80
  ),
  (
    'nemesis_flip',
    '{"phase":"day","metric":"nemesis_flip"}',
    'user',
    '["You took the day back. {nemesis} is rereading the case file."]',
    7,
    70
  ),
  (
    'hot_pursuit_streak',
    '{"phase":"day","metric":"hot_pursuit_streak","days":2}',
    'group',
    '["Every operative in motion. She''s checking over her shoulder."]',
    7,
    60
  ),
  (
    'target_blowout',
    '{"phase":"day","metric":"target_blowout","multiplier":1.5}',
    'user',
    '["Subject moving fast. She''s noticed. Field reports say she skipped dinner."]',
    7,
    50
  ),
  (
    'streak_broken',
    '{"phase":"day","metric":"streak_broken","min_streak":3}',
    'user',
    '["The trail went cold on day {n}. She left a matchbook. It''s mocking."]',
    7,
    40
  ),
  (
    'weak_day',
    '{"phase":"day","metric":"weak_day","ratio":0.6}',
    'group',
    '["Quiet day out there. She made {miles} miles on you. —S.C."]',
    7,
    30
  );
