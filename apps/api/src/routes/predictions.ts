import { Router } from "express";
import { submitPredictionSchema } from "@selenas-chase/shared";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";

export const predictionsRouter = Router();
predictionsRouter.use(requireAuth);

function localParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function localDate(now: Date, timeZone: string): string {
  const parts = localParts(now, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function zonedTimeToUtcIso(date: string, hour: number, timeZone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const targetUtc = Date.UTC(year, month - 1, day, hour);
  let guess = new Date(targetUtc);

  for (let i = 0; i < 3; i += 1) {
    const parts = localParts(guess, timeZone);
    const renderedUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess = new Date(guess.getTime() - (renderedUtc - targetUtc));
  }

  return guess.toISOString();
}

async function currentWeekForUser(userId: string) {
  const me = await pool.query(
    `SELECT u.group_id, g.timezone
     FROM users u
     LEFT JOIN groups g ON g.id = u.group_id
     WHERE u.id = $1`,
    [userId],
  );
  if (!me.rowCount) throw errors.unauthenticated();
  const groupId = me.rows[0].group_id as string | null;
  if (!groupId) throw errors.notFound("You're not in a group");

  const week = await pool.query(
    `SELECT w.*, c.name AS city_name
     FROM weeks w
     JOIN cities c ON c.id = w.city_id
     WHERE w.group_id = $1 AND w.status = 'active'
     ORDER BY w.starts_on DESC
     LIMIT 1`,
    [groupId],
  );
  if (!week.rowCount) throw errors.notFound("No active week");

  return {
    groupId,
    timezone: me.rows[0].timezone ?? "America/Chicago",
    week: week.rows[0],
  };
}

function submissionOpen(startsOn: string, timezone: string): boolean {
  return localDate(new Date(), timezone) === startsOn;
}

predictionsRouter.get("/current", async (req, res, next) => {
  try {
    const { groupId, timezone, week } = await currentWeekForUser(req.userId!);
    const revealAt = zonedTimeToUtcIso(week.starts_on, 12, timezone);
    const [members, predictions, total] = await Promise.all([
      pool.query("SELECT id FROM users WHERE group_id = $1", [groupId]),
      pool.query(
        `SELECT p.user_id,
                p.predicted_steps,
                p.submitted_at,
                p.actual_delta,
                p.is_winner,
                u.display_name,
                u.avatar_skin,
                u.avatar_hair,
                u.avatar_colorway
         FROM predictions p
         JOIN users u ON u.id = p.user_id
         WHERE p.week_id = $1
         ORDER BY p.submitted_at ASC`,
        [week.id],
      ),
      pool.query(
        `SELECT COALESCE(SUM(sl.steps), 0)::int AS steps
         FROM step_logs sl
         JOIN users u ON u.id = sl.user_id
         WHERE u.group_id = $1
           AND sl.log_date BETWEEN $2::date AND $3::date`,
        [groupId, week.starts_on, week.ends_on],
      ),
    ]);

    const myPrediction =
      predictions.rows.find((prediction) => prediction.user_id === req.userId) ?? null;
    const allSubmitted = predictions.rowCount === members.rowCount;
    const revealed = allSubmitted || Date.now() >= new Date(revealAt).getTime();
    const state =
      week.status === "closed"
        ? "final"
        : revealed
          ? "revealed"
          : myPrediction
            ? "partial"
            : "pending";

    res.json({
      week: {
        id: week.id,
        starts_on: week.starts_on,
        ends_on: week.ends_on,
        status: week.status,
      },
      city: { name: week.city_name },
      myPrediction,
      others: revealed
        ? predictions.rows.filter((prediction) => prediction.user_id !== req.userId)
        : "hidden",
      allSubmitted,
      liveGroupTotal: total.rows[0].steps,
      revealAt,
      state,
      submissionOpen: submissionOpen(week.starts_on, timezone),
    });
  } catch (e) {
    next(e);
  }
});

// Per-week results for closed weeks + lifetime win count (plan §3).
predictionsRouter.get("/history", async (req, res, next) => {
  try {
    const rows = await pool.query(
      `SELECT w.id AS week_id,
              to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on,
              c.name AS city_name,
              p.predicted_steps,
              w.group_total_steps AS actual_steps,
              p.actual_delta,
              p.is_winner
       FROM predictions p
       JOIN weeks w ON w.id = p.week_id
       JOIN cities c ON c.id = w.city_id
       WHERE p.user_id = $1 AND w.status = 'closed'
       ORDER BY w.starts_on DESC`,
      [req.userId],
    );
    res.json({
      history: rows.rows,
      wins: rows.rows.filter((r) => r.is_winner).length,
    });
  } catch (e) {
    next(e);
  }
});

predictionsRouter.post("/", async (req, res, next) => {
  try {
    const body = submitPredictionSchema.parse(req.body);
    const { timezone, week } = await currentWeekForUser(req.userId!);
    if (!submissionOpen(week.starts_on, timezone)) {
      throw errors.conflict("PREDICTION_CLOSED", "Prediction window is closed");
    }

    try {
      const inserted = await pool.query(
        `INSERT INTO predictions (week_id, user_id, predicted_steps)
         VALUES ($1, $2, $3)
         RETURNING id, week_id, user_id, predicted_steps, submitted_at`,
        [week.id, req.userId, body.predicted_steps],
      );
      res.status(201).json({ prediction: inserted.rows[0] });
    } catch (e: any) {
      if (e.code === "23505") {
        throw errors.conflict("PREDICTION_EXISTS", "You already submitted a prediction");
      }
      throw e;
    }
  } catch (e) {
    next(e);
  }
});
