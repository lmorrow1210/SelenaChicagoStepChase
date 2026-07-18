-- ============================================================
-- 008 — Week 1 narrative layer (Season One reference week)
-- · weeks: authoritative final chase result columns (target_hit
--   stays for backward compatibility)
-- · week_ritual_views: per-user briefing/midweek/final-push/
--   case-closed view state
-- · group_evidence_unlocks: Season Evidence, separate from the
--   Field Ops intel_cards recon economy
-- · Week 1 Chicago Field Ops challenge definitions (reusable
--   detectors; honor tiles stay low stakes)
-- · New beat definitions with required_confidence gating
-- Rollback notes: new columns are nullable and ignored by old
-- code; new tables are isolated; definition inserts are inert
-- until the Week 1 board/config references them.
-- ============================================================

ALTER TABLE weeks
  ADD COLUMN season_id TEXT,
  ADD COLUMN season_week_number INTEGER,
  ADD COLUMN base_progress NUMERIC(7,4),
  ADD COLUMN final_progress NUMERIC(7,4),
  ADD COLUMN remaining_lead INTEGER,
  ADD COLUMN bonus_breakdown JSONB,
  ADD COLUMN data_confidence TEXT
    CHECK (data_confidence IN ('verified','estimated','incomplete','recalculating')),
  ADD COLUMN final_outcome TEXT
    CHECK (final_outcome IN ('trail_lost','pursuit_maintained','close_encounter','interception')),
  ADD COLUMN finalized_at TIMESTAMPTZ;

CREATE TABLE week_ritual_views (
  id BIGSERIAL PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ritual_id TEXT NOT NULL
    CHECK (ritual_id IN ('monday_briefing','midweek_update','final_push','case_closed')),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (week_id, user_id, ritual_id)
);

CREATE TABLE group_evidence_unlocks (
  id BIGSERIAL PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL,
  season_week_number INTEGER NOT NULL,
  evidence_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('standard','intercept')),
  outcome TEXT NOT NULL
    CHECK (outcome IN ('trail_lost','pursuit_maintained','close_encounter','interception')),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, season_id, evidence_id)
);
CREATE INDEX group_evidence_unlocks_group_idx
  ON group_evidence_unlocks (group_id, season_id, season_week_number);

-- ---- Week 1 Chicago Field Ops definitions ----
-- Reusable detectors only. Honor tiles are self-reported and low stakes.
INSERT INTO bingo_challenge_definitions (code, category, label, icon, detector, source) VALUES
  ('steps_1k_day',            'steps',  'First Footfall: 1,000 steps in a day',        'step',  '{"metric":"steps","window":"day","op":">=","value":1000}', 'auto'),
  ('steps_5k_day',            'steps',  'On the Move: 5,000 steps in a day',           'step',  '{"metric":"steps","window":"day","op":">=","value":5000}', 'auto'),
  ('target_50pct_day',        'steps',  'Closing Distance: 50% of daily target',       'flame', '{"metric":"percent_target_in_day","pct":0.5}', 'auto'),
  ('target_100pct_day',       'steps',  'Full Shift: 100% of daily target',            'flame', '{"metric":"percent_target_in_day","pct":1}', 'auto'),
  ('steps_2k_two_days',       'steps',  'Keep the Trail: 2,000 steps two days running','step',  '{"metric":"consecutive_days","days":2,"min_steps":2000}', 'auto'),
  ('steps_any_three_days',    'steps',  'Three-Day Tail: steps three days running',    'step',  '{"metric":"consecutive_days","days":3,"min_steps":1}', 'auto'),
  ('weekly_steps_15k',        'steps',  'City Sweep: 15,000 steps this week',          'globe', '{"metric":"weekly_steps","op":">=","value":15000}', 'auto'),
  ('steps_1k_noon',           'steps',  'Morning Surveillance: 1,000 before noon',     'clock', '{"metric":"steps_before","hour":12,"value":1000}', 'auto'),
  ('steps_1k_after_6',        'steps',  'After-Hours Watch: 1,000 after 6pm',          'clock', '{"metric":"steps_after","hour":18,"value":1000}', 'auto'),
  ('split_shift_1k',          'steps',  'Split Shift: 1,000 morning + 1,000 evening',  'clock', '{"metric":"split_shift","morning_hour":12,"evening_hour":18,"value":1000}', 'auto'),
  ('active_500_five_days',    'steps',  'Steady Signal: 500 steps on five days',       'step',  '{"metric":"active_days","days":5,"min_steps":500}', 'auto'),
  ('active_nonzero_seven_days','steps', 'No Cold Trail: steps every day this week',    'step',  '{"metric":"active_days","days":7,"min_steps":1}', 'auto'),
  ('assist_sent',             'social', 'Send Backup: gift a tile assist',             'nemesis','{"metric":"assist_sent","op":">=","value":1}', 'auto'),
  ('assist_received',         'social', 'Accept Backup: receive a tile assist',        'nemesis','{"metric":"assist_received","op":">=","value":1}', 'auto'),
  ('unit_mobilized_50pct',    'social', 'Unit Mobilized: 3 operatives hit 50% today',  'globe', '{"metric":"group_daily_target_ratio","min_members":3,"pct":0.5}', 'auto'),
  ('full_team_report_sync',   'social', 'Full Team Report: everyone syncs in 24h',     'globe', '{"metric":"group_sync_freshness","within_hours":24}', 'auto'),
  ('take_long_way',           'steps',  'Take the Long Way: add movement to a trip',   'star',  '{"metric":"honor"}', 'honor'),
  ('eyes_up',                 'wildcard','Eyes Up: notice a new detail around you',    'star',  '{"metric":"honor"}', 'honor'),
  ('walk_with_someone',       'social', 'Walk With Someone: friend, family, or pet',   'nemesis','{"metric":"honor"}', 'honor'),
  ('choose_longer_route',     'steps',  'Choose the Longer Route when safe',           'star',  '{"metric":"honor"}', 'honor');

-- ---- Week 1 Beat Engine additions ----
-- required_confidence in the trigger gates Selena performance commentary
-- behind verified data; trust beats carry no requirement.
INSERT INTO beat_definitions (slug, trigger, scope, variants, cooldown_days, priority) VALUES
  (
    'group_data_incomplete',
    '{"phase":"day","metric":"group_data_incomplete"}',
    'group',
    '["Field reports incomplete. Pursuit analysis suspended until trackers respond."]',
    2,
    95
  ),
  (
    'result_recalculating',
    '{"phase":"day","metric":"result_recalculating"}',
    'group',
    '["Late field reports arrived. The {city} case result is being reconciled."]',
    1,
    94
  ),
  (
    'first_field_ops_line',
    '{"phase":"day","metric":"first_field_ops_line"}',
    'group',
    '["{first_line_payoff}"]',
    7,
    85
  ),
  (
    'platform_sweep_started',
    '{"phase":"day","metric":"platform_sweep_started"}',
    'group',
    '["{operation_label} is live. Every operative who files 2,000 verified steps covers an exit."]',
    7,
    75
  ),
  (
    'platform_sweep_completed',
    '{"phase":"day","metric":"platform_sweep_completed"}',
    'group',
    '["{operation_label} complete. Every exit covered. The full bonus is secured."]',
    7,
    74
  ),
  (
    'team_ahead_of_pace',
    '{"phase":"day","metric":"team_ahead_of_pace","ratio":1.15,"required_confidence":["verified"]}',
    'group',
    '["The trail is warm. The unit is closing faster than the Bureau projected."]',
    3,
    45
  ),
  (
    'team_behind_pace',
    '{"phase":"day","metric":"team_behind_pace","ratio":0.7,"required_confidence":["verified"]}',
    'group',
    '["The lead is widening. The unit is currently below interception pace."]',
    3,
    35
  ),
  (
    'group_comeback',
    '{"phase":"day","metric":"group_comeback","multiplier":1.5,"required_confidence":["verified"]}',
    'group',
    '["THE TRAIL IS WARM AGAIN. The unit closed serious ground in the last day. Selena changed course."]',
    3,
    55
  );

-- Existing Selena performance commentary now requires verified data.
UPDATE beat_definitions
SET trigger = trigger || '{"required_confidence":["verified"]}'::jsonb
WHERE slug IN ('weak_day', 'target_blowout', 'near_miss_week');
