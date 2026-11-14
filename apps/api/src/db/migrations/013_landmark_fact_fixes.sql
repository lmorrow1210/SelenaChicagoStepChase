-- ============================================================
-- 013 — Landmark fun-fact accuracy fixes.
--
-- Two fun facts seeded by 011 overstated what is known:
--   * Santa Monica Pier (Week 12, day 3): the pier opened in 1909; its
--     amusement pier arrived in 1916. "Carried its amusement park since
--     1909" was wrong, so the line now says only what 1909 supports.
--   * Zilker Park (Week 10, day 5): Barton Springs flows INTO Barton Creek;
--     the springs do not "feed" the creek from inside the park in the way
--     the old line implied. Reworded to match the geography.
--
-- Forward-safe: UPDATE in place by (route_order, day). Never edit 011.
-- Re-running this file changes nothing. No schema change, no deletes.
-- ============================================================

UPDATE landmarks l SET fun_fact = v.fun_fact
FROM (VALUES
  (10, 5, 'The 350-acre park hosts the Austin City Limits festival and surrounds Barton Springs, whose waters flow on into Barton Creek.'),
  (12, 3, 'The pier marks the western end of Route 66 and has stood over the Pacific since 1909.')
) AS v(route_order, day, fun_fact)
JOIN cities c ON c.route_order = v.route_order
WHERE l.city_id = c.id AND l.day = v.day;
