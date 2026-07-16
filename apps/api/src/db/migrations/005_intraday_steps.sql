-- M11: intraday context for bingo auto-detectors (steps_before / steps_after).
-- Hour-bucketed steps for the local day: a JSONB array of 24 integers,
-- index = local hour. NULL = the health client had no intraday data for the
-- day, in which case intraday detectors simply stay incomplete (never
-- false-fire).
ALTER TABLE step_logs ADD COLUMN steps_by_hour JSONB;
