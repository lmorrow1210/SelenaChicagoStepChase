-- ============================================================
-- 010 — Sync Detroit landmarks to the approved content pack.
--
-- Migration 009 seeded Detroit (route_order = 2) with a placeholder
-- landmark set (Renaissance Center, Guardian Building, Michigan Central
-- Station, Packard Plant, Belle Isle) that predates the 2026-07-17 owner
-- decision recorded in docs/canon/cities/week-02-detroit.md. The approved
-- five — already shipped in apps/web/lib/demo.ts DETROIT_LANDMARKS — were
-- never applied to production data. This corrects that drift so the live
-- Field Ops scouting board and city trophy page match the shipped canon
-- and demo fixture exactly.
--
-- Forward-safe: UPDATE in place by (city_id, day), same pattern as 009.
-- No schema change, no deletes.
-- ============================================================

UPDATE landmarks l SET name = v.name, fun_fact = v.fun_fact
FROM (VALUES
  (2, 1, 'Michigan Central Station', 'Abandoned for nearly thirty years, it reopened in 2024 after a landmark restoration led by Ford.'),
  (2, 2, 'Detroit Institute of Arts', 'Diego Rivera''s Detroit Industry Murals wrap an entire courtyard with scenes of the auto assembly line.'),
  (2, 3, 'Guardian Building',         'Its Art Deco lobby, tiled in Pewabic pottery, earned it the nickname ''Cathedral of Finance.'''),
  (2, 4, 'Motown Museum',             'The Motown sound was recorded in the converted house that Berry Gordy called Hitsville U.S.A.'),
  (2, 5, 'Renaissance Center',        'The riverfront towers of GM''s headquarters are the tallest in Michigan and define Detroit''s skyline.')
) AS v(route_order, day, name, fun_fact)
JOIN cities c ON c.route_order = v.route_order
WHERE l.city_id = c.id AND l.day = v.day;
