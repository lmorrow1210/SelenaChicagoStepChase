-- ============================================================
-- 002_seed_cities.sql — route + 3 example cities × 7 landmarks
-- (remaining ~30 cities follow the same pattern; content task)
-- Route continues per spec: London, Paris, Berlin, Rome, Istanbul,
-- Cairo, Nairobi, Cape Town, Dubai, Mumbai, Bangkok, Tokyo, Seoul,
-- Sydney, Lima, Buenos Aires, São Paulo, Havana, Mexico City,
-- Los Angeles → loop.
-- ============================================================
INSERT INTO cities (route_order, name, country, lat, lng) VALUES
  (1,  'Chicago',  'USA',     41.87810, -87.62980),
  (2,  'New York', 'USA',     40.71280, -74.00600),
  (3,  'Reykjavik','Iceland', 64.14660, -21.94260);

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
