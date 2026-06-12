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

// Past-city trophy view (plan §3). Fully revealed, read-only (spec: "Past
// city (badge earned)"). FORBIDDEN until the group has a closed week there —
// the current city stays on /api/cities/current until rollover closes it.
citiesRouter.get("/:id(\\d+)", async (req, res, next) => {
  try {
    const cityId = Number(req.params.id);
    const me = await pool.query(
      `SELECT u.group_id FROM users u WHERE u.id = $1`,
      [req.userId],
    );
    if (!me.rowCount) throw errors.unauthenticated();
    const groupId = me.rows[0].group_id as string | null;
    if (!groupId) throw errors.notFound("You're not in a group");

    const city = await pool.query(
      `SELECT id, name, country, route_order, background_image, lat, lng
       FROM cities WHERE id = $1`,
      [cityId],
    );
    if (!city.rowCount) throw errors.notFound("No such city");

    // Most recent finished visit; route wrap can produce several.
    const week = await pool.query(
      `SELECT id, to_char(starts_on, 'YYYY-MM-DD') AS starts_on,
              to_char(ends_on, 'YYYY-MM-DD') AS ends_on,
              group_target_steps, group_total_steps, target_hit
       FROM weeks
       WHERE group_id = $1 AND city_id = $2 AND status = 'closed'
       ORDER BY starts_on DESC
       LIMIT 1`,
      [groupId, cityId],
    );
    if (!week.rowCount) {
      throw errors.forbidden("Selena hasn't been chased through this city yet");
    }
    const closedWeek = week.rows[0];

    const [landmarks, champion] = await Promise.all([
      pool.query(
        `SELECT l.id, l.day, l.name, l.fun_fact, l.image,
                cu.landmark_id IS NOT NULL AS earned,
                cu.triggering_user
         FROM landmarks l
         LEFT JOIN city_unlocks cu ON cu.landmark_id = l.id AND cu.week_id = $2
         WHERE l.city_id = $1
         ORDER BY l.day`,
        [cityId, closedWeek.id],
      ),
      pool.query(
        `SELECT b.quality, u.id AS user_id, u.display_name,
                u.avatar_skin, u.avatar_hair, u.avatar_colorway
         FROM badges b
         JOIN users u ON u.id = b.user_id
         WHERE b.badge_code = 'city' AND b.week_id = $1
         LIMIT 1`,
        [closedWeek.id],
      ),
    ]);

    res.json({
      city: {
        id: city.rows[0].id,
        name: city.rows[0].name,
        country: city.rows[0].country,
        route_order: city.rows[0].route_order,
        background_image: city.rows[0].background_image,
        lat: Number(city.rows[0].lat),
        lng: Number(city.rows[0].lng),
      },
      week: {
        starts_on: closedWeek.starts_on,
        ends_on: closedWeek.ends_on,
        group_target_steps: closedWeek.group_target_steps,
        group_total_steps: closedWeek.group_total_steps,
        target_hit: closedWeek.target_hit,
      },
      landmarks: landmarks.rows.map((landmark) => ({
        id: landmark.id,
        day: landmark.day,
        name: landmark.name,
        fun_fact: landmark.fun_fact,
        image: landmark.image,
        earned: landmark.earned,
      })),
      unlocked_count: landmarks.rows.filter((landmark) => landmark.earned).length,
      champion: champion.rowCount
        ? {
            user_id: champion.rows[0].user_id,
            display_name: champion.rows[0].display_name,
            avatar_skin: champion.rows[0].avatar_skin,
            avatar_hair: champion.rows[0].avatar_hair,
            avatar_colorway: champion.rows[0].avatar_colorway,
            quality: champion.rows[0].quality,
          }
        : null,
    });
  } catch (e) {
    next(e);
  }
});

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
