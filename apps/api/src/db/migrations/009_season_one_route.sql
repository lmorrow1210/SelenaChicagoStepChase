-- ============================================================
-- 009 — Season One locked route (spec §7):
-- Chicago → Detroit → Pittsburgh → Washington, D.C. →
-- Philadelphia → New York City → Boston → Savannah →
-- New Orleans → Austin → Santa Fe → Los Angeles → San Francisco
--
-- Forward-safe strategy: never DELETE (weeks/badges/city_unlocks/
-- intel_cards hold FKs into cities and landmarks). Cities 2 and 3
-- (legacy New York / Reykjavik) are renamed IN PLACE to Detroit and
-- Pittsburgh and their landmarks rewritten by day; the remaining ten
-- cities are inserted fresh. Rollback: rename cities 2/3 back and
-- delete cities with route_order > 3 (safe until weeks reference them).
-- ============================================================

UPDATE cities SET name = 'Detroit', country = 'USA', lat = 42.33140, lng = -83.04580
WHERE route_order = 2;
UPDATE cities SET name = 'Pittsburgh', country = 'USA', lat = 40.44060, lng = -79.99590
WHERE route_order = 3;

UPDATE landmarks l SET name = v.name, fun_fact = v.fun_fact
FROM (VALUES
  (2, 1, 'The Renaissance Center',   'Its central tower was the tallest hotel in the Western Hemisphere when it opened in 1977.'),
  (2, 2, 'The Guardian Building',    'An Art Deco "cathedral of finance" tiled in custom-fired orange brick.'),
  (2, 3, 'Michigan Central Station', 'Abandoned for thirty years, reborn as a technology campus in 2024.'),
  (2, 4, 'The Packard Plant',        'Its reinforced-concrete construction was revolutionary for a factory in 1903.'),
  (2, 5, 'Belle Isle',               'A 982-acre island park laid out by the designer of Central Park.'),
  (3, 1, 'Duquesne Incline',         'Its wooden cable cars have climbed Mount Washington since 1877.'),
  (3, 2, 'Roberto Clemente Bridge',  'One of the "Three Sisters" — matching self-anchored suspension bridges built as triplets.'),
  (3, 3, 'Cathedral of Learning',    'A 42-story Gothic tower — the tallest educational building in the Western Hemisphere.'),
  (3, 4, 'Point State Park',         'Where the Allegheny and Monongahela meet to form the Ohio River.'),
  (3, 5, 'Randyland',                'A hand-painted house museum locals call the most colorful corner of Pennsylvania.')
) AS v(route_order, day, name, fun_fact)
JOIN cities c ON c.route_order = v.route_order
WHERE l.city_id = c.id AND l.day = v.day;

INSERT INTO cities (route_order, name, country, lat, lng) VALUES
  (4,  'Washington, D.C.', 'USA', 38.90720, -77.03690),
  (5,  'Philadelphia',     'USA', 39.95260, -75.16520),
  (6,  'New York City',    'USA', 40.71280, -74.00600),
  (7,  'Boston',           'USA', 42.36010, -71.05890),
  (8,  'Savannah',         'USA', 32.08090, -81.09120),
  (9,  'New Orleans',      'USA', 29.95110, -90.07150),
  (10, 'Austin',           'USA', 30.26720, -97.74310),
  (11, 'Santa Fe',         'USA', 35.68700, -105.93780),
  (12, 'Los Angeles',      'USA', 34.05220, -118.24370),
  (13, 'San Francisco',    'USA', 37.77490, -122.41940);

INSERT INTO landmarks (city_id, day, name, fun_fact)
SELECT c.id, v.day, v.name, v.fun_fact
FROM (VALUES
  (4,  1, 'The Capitol Dome',          'The cast-iron dome expands and contracts up to four inches with the weather.'),
  (4,  2, 'Lincoln Memorial',          'Sculptor legend says one marble hand signs Lincoln''s own initials.'),
  (4,  3, 'The Washington Monument',   'Its stone changes color a third of the way up — construction paused for 23 years.'),
  (4,  4, 'Smithsonian Castle',        'James Smithson, its founding donor, never once set foot in America.'),
  (4,  5, 'Georgetown Canal',          'Mules towed cargo boats along this channel for nearly a century.'),
  (5,  1, 'Liberty Bell',              'No one knows for certain when the famous crack first appeared.'),
  (5,  2, 'Independence Hall',         'The Declaration and the Constitution were signed in the same room.'),
  (5,  3, 'Philadelphia City Hall',    'The tallest habitable building in the world when it was finished in 1894.'),
  (5,  4, 'The Rocky Steps',           'The Art Museum''s 72 steps get sprinted by thousands of visitors a day.'),
  (5,  5, 'Elfreth''s Alley',          'The oldest continuously inhabited residential street in America.'),
  (6,  1, 'Statue of Liberty',         'Her full name is "Liberty Enlightening the World."'),
  (6,  2, 'Times Square',              'Roughly 330,000 people pass through on a typical day.'),
  (6,  3, 'Central Park',              'It''s bigger than the country of Monaco.'),
  (6,  4, 'Brooklyn Bridge',           'P.T. Barnum marched 21 elephants across it to prove it was safe.'),
  (6,  5, 'Grand Central Terminal',    'The ceiling''s zodiac mural is painted backwards.'),
  (7,  1, 'Fenway Park',               'The oldest active ballpark in Major League Baseball, opened in 1912.'),
  (7,  2, 'The Old North Church',      'Two lanterns in its steeple launched Paul Revere''s midnight ride.'),
  (7,  3, 'Boston Common',             'America''s oldest public park — cows grazed it until 1830.'),
  (7,  4, 'The Freedom Trail',         'A 2.5-mile red brick line connects sixteen revolutionary sites.'),
  (7,  5, 'The Mapparium',             'A three-story stained-glass globe you cross on a glass bridge.'),
  (8,  1, 'Forsyth Park Fountain',     'Ordered from a catalog in 1858 — its twins stand in Peru and France.'),
  (8,  2, 'The Historic Squares',      'Twenty-two of the original town squares survive from the 1733 city plan.'),
  (8,  3, 'River Street',              'Its cobblestones arrived as ballast in the holds of sailing ships.'),
  (8,  4, 'Bonaventure Cemetery',      'A Victorian garden cemetery made world-famous by a book cover.'),
  (8,  5, 'The Waving Girl',           'Florence Martus greeted every ship entering the port for 44 years.'),
  (9,  1, 'Jackson Square',            'Street artists have hung their work on its iron fence for generations.'),
  (9,  2, 'St. Louis Cathedral',       'The oldest continuously active Catholic cathedral in the United States.'),
  (9,  3, 'The French Market',         'A trading site since before the city had a name.'),
  (9,  4, 'Preservation Hall',        'No microphones and no drinks — just acoustic jazz since 1961.'),
  (9,  5, 'The St. Charles Streetcar', 'The oldest continuously operating streetcar line in the world.'),
  (10, 1, 'The Texas State Capitol',   'Deliberately built taller than the U.S. Capitol.'),
  (10, 2, 'Congress Avenue Bridge',    'Up to 1.5 million bats emerge from beneath it on summer evenings.'),
  (10, 3, 'Barton Springs Pool',       'A three-acre spring-fed pool that stays 68–70 degrees year round.'),
  (10, 4, 'The Driskill Hotel',        'A cattle baron spent his entire fortune building it in 1886.'),
  (10, 5, 'Mount Bonnell',             'Locals have climbed its 106 steps for sunset views since the 1850s.'),
  (11, 1, 'Palace of the Governors',   'The oldest continuously occupied public building in the United States.'),
  (11, 2, 'Loretto Chapel',            'Its spiral staircase makes two full turns with no central support.'),
  (11, 3, 'Canyon Road',               'A half-mile street holding more than a hundred art galleries.'),
  (11, 4, 'San Miguel Chapel',         'Often called the oldest church structure in the continental U.S.'),
  (11, 5, 'The Plaza Obelisk',         'The city plaza marks the end of the Santa Fe Trail.'),
  (12, 1, 'Griffith Observatory',      'Free to the public since 1935, by order of its donor''s will.'),
  (12, 2, 'The Hollywood Sign',        'Originally read HOLLYWOODLAND — a real-estate ad meant to last 18 months.'),
  (12, 3, 'Union Station',             'The last of America''s grand railway stations, opened in 1939.'),
  (12, 4, 'The Bradbury Building',     'Its ironwork atrium was inspired by a science-fiction novel.'),
  (12, 5, 'Angels Flight',             'A 298-foot funicular billed as the shortest railway in the world.'),
  (13, 1, 'Golden Gate Bridge',        'Its color, "International Orange," was chosen to stay visible in fog.'),
  (13, 2, 'Alcatraz',                  'The island''s gardens survive from seeds planted by inmates and guards.'),
  (13, 3, 'The Cable Cars',            'The only moving National Historic Landmark in the United States.'),
  (13, 4, 'Coit Tower',                'Built with a firefighting patron''s bequest to beautify the city.'),
  (13, 5, 'The Wave Organ',            'A shoreline sculpture that plays music through the tide.')
) AS v(route_order, day, name, fun_fact)
JOIN cities c ON c.route_order = v.route_order;
