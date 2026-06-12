import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { localDateParts } from "../services/week.js";

export const citiesRouter = Router();
citiesRouter.use(requireAuth);

function localDate(now: Date, timezone: string): string {
  const { y, m, d } = localDateParts(now, timezone);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function dayNumber(startsOn: string, date: string): number {
  const start = new Date(`${startsOn}T00:00:00Z`);
  const current = new Date(`${date}T00:00:00Z`);
  return Math.floor((current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

citiesRouter.get("/current", async (req, res, next) => {
  try {
    const me = await pool.query(
      `SELECT u.group_id, g.timezone
       FROM users u
       LEFT JOIN groups g ON g.id = u.group_id
       WHERE u.id = $1`,
      [req.userId],
    );
    if (!me.rowCount) throw errors.unauthenticated();
    const groupId = me.rows[0].group_id as string | null;
    if (!groupId) throw errors.notFound("You're not in a group");

    const timezone = me.rows[0].timezone ?? "America/Chicago";
    const today = localDate(new Date(), timezone);
    const week = await pool.query(
      `SELECT w.id, w.starts_on, w.ends_on, w.status,
              c.id AS city_id, c.name, c.country, c.route_order,
              c.background_image, c.lat, c.lng
       FROM weeks w
       JOIN cities c ON c.id = w.city_id
       WHERE w.group_id = $1 AND w.status = 'active'
       ORDER BY w.starts_on DESC
       LIMIT 1`,
      [groupId],
    );
    if (!week.rowCount) throw errors.notFound("No active week");

    const currentWeek = week.rows[0];
    const todayDay = dayNumber(currentWeek.starts_on, today);
    const [landmarks, workout] = await Promise.all([
      pool.query(
        `SELECT l.id, l.day, l.name, l.fun_fact, l.image,
                COALESCE(cu.unlocked, FALSE) AS unlocked
         FROM landmarks l
         LEFT JOIN city_unlocks cu ON cu.landmark_id = l.id AND cu.week_id = $2
         WHERE l.city_id = $1
         ORDER BY l.day`,
        [currentWeek.city_id, currentWeek.id],
      ),
      pool.query(
        `SELECT u.id AS user_id,
                u.display_name,
                u.avatar_skin,
                u.avatar_hair,
                u.avatar_colorway,
                COALESCE(jsonb_array_length(sl.workouts), 0) > 0 AS worked_out
         FROM users u
         LEFT JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = $2
         WHERE u.group_id = $1
         ORDER BY u.created_at ASC`,
        [groupId, today],
      ),
    ]);

    const workoutMembers = workout.rows.map((member) => ({
      user_id: member.user_id,
      display_name: member.display_name,
      avatar_skin: member.avatar_skin,
      avatar_hair: member.avatar_hair,
      avatar_colorway: member.avatar_colorway,
      worked_out: member.worked_out,
    }));

    res.json({
      city: {
        id: currentWeek.city_id,
        name: currentWeek.name,
        country: currentWeek.country,
        route_order: currentWeek.route_order,
        background_image: currentWeek.background_image,
        lat: Number(currentWeek.lat),
        lng: Number(currentWeek.lng),
      },
      landmarks: landmarks.rows.map((landmark) => ({
        id: landmark.id,
        day: landmark.day,
        name: landmark.name,
        fun_fact: landmark.fun_fact,
        image: landmark.image,
        state: landmark.unlocked
          ? "unlocked"
          : landmark.day === todayDay
            ? "today"
            : "locked",
      })),
      groupWorkout: {
        total_members: workoutMembers.length,
        worked_out_today: workoutMembers.filter((member) => member.worked_out).length,
        members: workoutMembers,
      },
    });
  } catch (e) {
    next(e);
  }
});
