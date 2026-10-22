-- ============================================================
-- 012 — Season finale send-off ritual.
--
-- The Week 13 send-off (animated pixel finale) records "seen" per
-- (week, user) through the existing week_ritual_views table, the same way
-- the briefing and case-closed report do. That table's CHECK only allowed
-- four ritual ids, so widen it to include 'season_finale'.
--
-- Forward-safe: drops and re-adds one CHECK constraint with a superset of
-- values; no rows change, nothing is deleted.
-- ============================================================

ALTER TABLE week_ritual_views
  DROP CONSTRAINT week_ritual_views_ritual_id_check;

ALTER TABLE week_ritual_views
  ADD CONSTRAINT week_ritual_views_ritual_id_check
  CHECK (ritual_id IN ('monday_briefing','midweek_update','final_push','case_closed','season_finale'));
