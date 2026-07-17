-- A1: Sunday nemesis reveal.
-- Weeks can now be prepared before they become active so Sunday can reveal
-- next week's nemesis pairings without closing the current week's scoring.

ALTER TABLE weeks DROP CONSTRAINT weeks_status_check;
ALTER TABLE weeks
  ADD CONSTRAINT weeks_status_check CHECK (status IN ('scheduled', 'active', 'closed'));

DROP INDEX IF EXISTS weeks_active_idx;
CREATE UNIQUE INDEX weeks_active_idx ON weeks(group_id) WHERE status = 'active';
CREATE UNIQUE INDEX weeks_scheduled_idx ON weeks(group_id) WHERE status = 'scheduled';
