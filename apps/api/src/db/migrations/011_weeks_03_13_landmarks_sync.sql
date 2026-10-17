-- ============================================================
-- 011 — Sync Weeks 03-13 landmarks to the approved content packs.
--
-- Migration 009 seeded Pittsburgh through San Francisco before the final
-- city packs were approved. This updates the existing five landmark rows
-- per city so live Field Ops data matches docs/canon/cities/week-03 through
-- week-13 exactly.
--
-- Forward-safe: UPDATE in place by (city_id, day), same pattern as 009/010.
-- No schema change, no deletes.
-- ============================================================

UPDATE landmarks l SET name = v.name, fun_fact = v.fun_fact
FROM (VALUES
  ( 3, 1, 'Duquesne Incline',                    'Opened in 1877, the funicular still carries riders up Mount Washington in its original wooden cable cars for one of the country''s best skyline views.'),
  ( 3, 2, 'Cathedral of Learning',               'At 42 stories, this Gothic tower at the University of Pittsburgh is the tallest educational building in the Western Hemisphere.'),
  ( 3, 3, 'Point State Park',                    'It marks the spot where the Allegheny and Monongahela rivers join to form the Ohio — the origin of Pittsburgh''s "Three Rivers" name.'),
  ( 3, 4, 'The Andy Warhol Museum',              'The largest U.S. museum devoted to a single artist holds thousands of Warhol works across seven floors.'),
  ( 3, 5, 'PNC Park',                            'Fans reach the riverfront ballpark by walking the Roberto Clemente Bridge, which closes to cars on game days.'),
  ( 4, 1, 'Lincoln Memorial',                    'The marble statue of Lincoln sits inside a Greek-temple design ringed by 36 columns — one for each state at the time of his death.'),
  ( 4, 2, 'Washington Monument',                 'At just over 555 feet it was the tallest structure in the world when finished in 1884; a color change in the marble marks where construction paused for two decades.'),
  ( 4, 3, 'U.S. Capitol',                        'The cast-iron dome weighs nearly nine million pounds and is topped by the 19-foot Statue of Freedom.'),
  ( 4, 4, 'The White House',                     'The residence has 132 rooms and has housed every U.S. president except George Washington, who chose the site but never lived there.'),
  ( 4, 5, 'The National Archives',               'It displays the original Declaration of Independence, Constitution, and Bill of Rights, sealed in protective cases.'),
  ( 5, 1, 'Independence Hall',                   'Both the Declaration of Independence and the U.S. Constitution were debated and signed in this brick assembly room.'),
  ( 5, 2, 'The Liberty Bell',                    'Its inscription reads "Proclaim Liberty Throughout All the Land"; a crack has kept the bell silent since the 19th century.'),
  ( 5, 3, 'Philadelphia Museum of Art',          'Its east steps became famous as the "Rocky Steps," and a bronze statue of the boxer stands at their base.'),
  ( 5, 4, 'Reading Terminal Market',             'One of the country''s oldest continuously operating public markets, it has fed the city under one roof since 1893.'),
  ( 5, 5, 'Eastern State Penitentiary',          'Its wagon-wheel design of solitary cells influenced prisons worldwide before it closed and became a preserved ruin.'),
  ( 6, 1, 'Statue of Liberty',                   'A gift from France dedicated in 1886, the copper statue slowly turned green as its surface weathered over decades.'),
  ( 6, 2, 'Empire State Building',               'Built in just 410 days during the Depression, its 102 stories held the title of world''s tallest building for nearly forty years.'),
  ( 6, 3, 'Central Park',                        'The 843-acre park is entirely landscaped — nearly every lake, hill, and meadow in it was designed and built by hand.'),
  ( 6, 4, 'Times Square',                        'Named for The New York Times, which moved there in 1904; the first New Year''s Eve ball dropped there in 1907.'),
  ( 6, 5, 'Brooklyn Bridge',                     'When it opened in 1883 it was the longest suspension bridge in the world, and the first built of steel wire.'),
  ( 7, 1, 'Fenway Park',                         'Opened in 1912, it is the oldest ballpark still in use in the major leagues, home of the 37-foot "Green Monster" wall.'),
  ( 7, 2, 'Faneuil Hall',                        'Called the "Cradle of Liberty," this colonial marketplace and meeting hall has hosted public debate since 1743.'),
  ( 7, 3, 'USS Constitution',                    'Nicknamed "Old Ironsides," it is the world''s oldest commissioned warship still afloat, launched in 1797.'),
  ( 7, 4, 'Old North Church',                    'Two lanterns hung in its steeple in 1775 signaled that the British were coming by sea — the city''s most famous midnight message.'),
  ( 7, 5, 'Boston Common',                       'Established in 1634, it is the oldest public park in the United States.'),
  ( 8, 1, 'Forsyth Park',                        'Its two-tiered cast-iron fountain, installed in 1858, is one of the most photographed spots in the American South.'),
  ( 8, 2, 'Bonaventure Cemetery',                'The riverside cemetery''s oak-shaded statuary drew fame from the book and film "Midnight in the Garden of Good and Evil."'),
  ( 8, 3, 'River Street',                        'Paved with ballast stones from old sailing ships, the riverfront street runs below the bluff on Savannah''s original cotton wharves.'),
  ( 8, 4, 'Cathedral Basilica of St. John the Baptist', 'Its twin spires rise about 214 feet above the historic district, and its interior murals date to the early 1900s.'),
  ( 8, 5, 'Chippewa Square',                     'One of Savannah''s original squares, it stood in for the bus-stop bench scenes in the film "Forrest Gump."'),
  ( 9, 1, 'St. Louis Cathedral',                 'Facing Jackson Square, it is the oldest continuously operating cathedral in the United States, rebuilt in its current form in 1850.'),
  ( 9, 2, 'Bourbon Street',                      'The French Quarter''s best-known street was laid out in 1721 and named for France''s ruling royal family, not the whiskey.'),
  ( 9, 3, 'Café du Monde',                       'Open since 1862, the original French Market stand serves chicory coffee and beignets around the clock.'),
  ( 9, 4, 'Preservation Hall',                   'The bare French Quarter hall has presented traditional New Orleans jazz nightly since 1961 — no drinks, no amplification.'),
  ( 9, 5, 'St. Charles Streetcar',               'The oldest continuously operating streetcar line in the world has run along St. Charles Avenue since 1835.'),
  (10, 1, 'Texas State Capitol',                 'Built in 1888 of Texas pink granite, it stands taller than the U.S. Capitol in Washington.'),
  (10, 2, 'Congress Avenue Bridge',              'It shelters the largest urban bat colony in North America — about 1.5 million bats stream out at dusk on summer evenings.'),
  (10, 3, 'Barton Springs Pool',                 'The three-acre spring-fed pool stays around 68–70 degrees year-round, cooled by underground springs.'),
  (10, 4, 'The University of Texas Tower',       'The 307-foot campus tower is lit burnt orange to mark major university victories.'),
  (10, 5, 'Zilker Park',                         'The 350-acre park hosts the Austin City Limits festival and holds the springs that feed Barton Creek.'),
  (11, 1, 'The Palace of the Governors',         'Built around 1610, it is the oldest continuously occupied public building in the United States.'),
  (11, 2, 'Loretto Chapel',                      'Its spiral "miraculous staircase" makes two full turns with no visible central support and no nails.'),
  (11, 3, 'Cathedral Basilica of St. Francis of Assisi', 'Completed in 1886, the honey-colored stone cathedral stands out from Santa Fe''s low adobe skyline.'),
  (11, 4, 'Santa Fe Plaza',                      'The central plaza marked the end of the old Santa Fe Trail and has been the heart of the city since the early 1600s.'),
  (11, 5, 'Georgia O''Keeffe Museum',            'It holds the world''s largest collection of the artist''s work, drawn to the New Mexico desert she painted for decades.'),
  (12, 1, 'The Hollywood Sign',                  'Erected in 1923, it originally read "HOLLYWOODLAND" and advertised a real-estate development before becoming the city''s icon.'),
  (12, 2, 'Griffith Observatory',                'Perched on Mount Hollywood, its free public telescopes have drawn visitors to the night sky since 1935.'),
  (12, 3, 'Santa Monica Pier',                   'The pier marks the western end of Route 66 and has carried its amusement park over the Pacific since 1909.'),
  (12, 4, 'TCL Chinese Theatre',                 'Its forecourt has held the handprints and footprints of film stars set in concrete since 1927.'),
  (12, 5, 'The Getty Center',                    'The hilltop museum is clad in 16,000 tons of travertine stone and reached by its own cable-drawn tram.'),
  (13, 1, 'Golden Gate Bridge',                  'Its "International Orange" color was chosen to keep the bridge visible in the Bay''s heavy fog; repainting it is a never-ending job.'),
  (13, 2, 'Alcatraz Island',                     'The former island prison, once considered inescapable, is now a national park reached only by ferry.'),
  (13, 3, 'Fisherman''s Wharf',                  'The waterfront district is known for its sea lions, sourdough, and Dungeness crab stands along Pier 39.'),
  (13, 4, 'Lombard Street',                      'One block is famous as the "crookedest street," with eight sharp switchbacks built to tame a steep hill.'),
  (13, 5, 'San Francisco Cable Cars',            'The city''s cable cars are the last manually operated cable car system in the world — a moving national landmark.')
) AS v(route_order, day, name, fun_fact)
JOIN cities c ON c.route_order = v.route_order
WHERE l.city_id = c.id AND l.day = v.day;
