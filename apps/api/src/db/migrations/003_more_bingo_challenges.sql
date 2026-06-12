-- ============================================================
-- 003_more_bingo_challenges.sql
-- generateCard needs 24 distinct challenges per card (plan M5);
-- 002 seeded only 18. Add 8 more so the pool is 26 (and stays
-- roughly category-balanced: 5/5/4/4/4/4).
-- All detectors use metrics evaluateDetector already supports.
-- ============================================================

INSERT INTO bingo_challenge_definitions (code, category, label, icon, detector) VALUES
  ('steps_15k_day',   'steps',   '15,000 steps in a day',         'step',
   '{"metric":"steps","window":"day","op":">=","value":15000}'),
  ('azm_60',          'workout', '60+ active zone minutes',       'heart',
   '{"metric":"active_zone_minutes","window":"day","op":">=","value":60}'),
  ('sleep_9h',        'sleep',   '9+ hours of sleep',             'sleep',
   '{"metric":"sleep_minutes","window":"day","op":">=","value":540}'),
  ('peak_zone',       'heart',   'Hit the peak heart zone',       'heart',
   '{"metric":"hr_zone_minutes","zone":"peak","op":">=","value":1}'),
  ('fat_burn_40',     'heart',   '40 min in fat burn zone',       'heart',
   '{"metric":"hr_zone_minutes","zone":"fat_burn","op":">=","value":40}'),
  ('podium_day',      'social',  'Top 2 on the board for a day',  'trophy',
   '{"metric":"daily_rank","op":"<=","value":2}'),
  ('saturday_target', 'wildcard','Hit step target on a Saturday', 'star',
   '{"metric":"target_on_weekday","weekday":6}'),
  ('sunday_target',   'wildcard','Hit step target on a Sunday',   'star',
   '{"metric":"target_on_weekday","weekday":7}');
