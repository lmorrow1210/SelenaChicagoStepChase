import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";

export const weeksRouter = Router();
weeksRouter.use(requireAuth);

const SELENA_MIN_LEAD_STEPS = 5000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

interface CityRow {
  id: number;
  name: string;
  country: string;
  route_order: number;
  lat: string | number;
  lng: string | number;
}

interface WeekRow {
  id: string;
  starts_on: string;
  ends_on: string;
  group_target_steps: number;
  status: "active" | "closed";
  city_id: number;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function localDateTimeParts(now: Date, timeZone: string) {
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

function zonedMidnightToUtcIso(date: string, timeZone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const targetUtc = Date.UTC(year, month - 1, day);
  let guess = new Date(targetUtc);

  for (let i = 0; i < 3; i += 1) {
    const parts = localDateTimeParts(guess, timeZone);
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

function cityPayload(city: CityRow | null) {
  if (!city) return null;
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    route_order: city.route_order,
    lat: Number(city.lat),
    lng: Number(city.lng),
  };
}

function weekPayload(week: WeekRow) {
  return {
    id: week.id,
    starts_on: week.starts_on,
    ends_on: week.ends_on,
    group_target_steps: week.group_target_steps,
    status: week.status,
  };
}

weeksRouter.get("/current", async (req, res, next) => {
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
    if (!groupId) {
      res.json({
        week: null,
        city: null,
        nextCity: null,
        selenaLeadSteps: SELENA_MIN_LEAD_STEPS,
        route: [],
        progressStrip: [],
        leaderboard: [],
        countdown: null,
        lastSyncedAt: null,
        state: "no_group",
      });
      return;
    }

    const timezone = me.rows[0].timezone ?? "America/Chicago";
    const activeWeek = await pool.query(
      `SELECT *
       FROM weeks
       WHERE group_id = $1 AND status = 'active'
       ORDER BY starts_on DESC
       LIMIT 1`,
      [groupId],
    );
    const weekResult = activeWeek.rowCount
      ? activeWeek
      : await pool.query(
          `SELECT *
           FROM weeks
           WHERE group_id = $1
           ORDER BY starts_on DESC
           LIMIT 1`,
          [groupId],
        );

    if (!weekResult.rowCount) {
      res.json({
        week: null,
        city: null,
        nextCity: null,
        selenaLeadSteps: SELENA_MIN_LEAD_STEPS,
        route: [],
        progressStrip: [],
        leaderboard: [],
        countdown: null,
        lastSyncedAt: null,
        state: "no_group",
      });
      return;
    }

    const week = weekResult.rows[0] as WeekRow;
    const [cities, members, lastSync] = await Promise.all([
      pool.query<CityRow>(
        `SELECT id, name, country, route_order, lat, lng
         FROM cities
         ORDER BY route_order`,
      ),
      pool.query(
        `SELECT u.id AS user_id,
                u.display_name,
                u.avatar_skin,
                u.avatar_hair,
                u.avatar_colorway,
                u.weekly_step_target AS target,
                COALESCE(cur.steps, 0)::int AS steps,
                COALESCE(prev.steps, 0)::int AS previous_steps
         FROM users u
         LEFT JOIN (
           SELECT user_id, SUM(steps)::int AS steps
           FROM step_logs
           WHERE log_date BETWEEN $2::date AND $3::date
           GROUP BY user_id
         ) cur ON cur.user_id = u.id
         LEFT JOIN (
           SELECT user_id, SUM(steps)::int AS steps
           FROM step_logs
           WHERE log_date BETWEEN ($2::date - INTERVAL '7 days')::date
                             AND ($2::date - INTERVAL '1 day')::date
           GROUP BY user_id
         ) prev ON prev.user_id = u.id
         WHERE u.group_id = $1
         ORDER BY COALESCE(cur.steps, 0) DESC, u.created_at ASC`,
        [groupId, week.starts_on, week.ends_on],
      ),
      pool.query("SELECT MAX(last_synced_at) AS last_synced_at FROM users WHERE group_id = $1", [
        groupId,
      ]),
    ]);

    const currentCity = cities.rows.find((city) => city.id === week.city_id) ?? null;
    const nextCity =
      cities.rows.find((city) => city.route_order === (currentCity?.route_order ?? 0) + 1) ??
      null;
    const groupSteps = members.rows.reduce((sum, member) => sum + Number(member.steps), 0);
    const countdown = zonedMidnightToUtcIso(addDays(week.ends_on, 1), timezone);
    const msUntilEnd = new Date(countdown).getTime() - Date.now();
    const state =
      week.status === "closed" && msUntilEnd <= 0 && Math.abs(msUntilEnd) <= ONE_HOUR_MS
        ? "arrival"
        : week.status === "active" && msUntilEnd > 0 && msUntilEnd < ONE_DAY_MS
          ? "closing_soon"
          : "in_progress";

    const progressStrip = members.rows.map((member) => {
      const steps = Number(member.steps);
      const target = Number(member.target);
      return {
        user_id: member.user_id,
        display_name: member.display_name,
        avatar_skin: member.avatar_skin,
        avatar_hair: member.avatar_hair,
        avatar_colorway: member.avatar_colorway,
        steps,
        target,
        pct: target > 0 ? Math.min(100, Math.round((steps / target) * 100)) : 0,
      };
    });

    const leaderboard = members.rows.map((member, index) => ({
      rank: index + 1,
      user_id: member.user_id,
      display_name: member.display_name,
      avatar_skin: member.avatar_skin,
      avatar_hair: member.avatar_hair,
      avatar_colorway: member.avatar_colorway,
      steps: Number(member.steps),
      deltaVsLastWeek: Number(member.steps) - Number(member.previous_steps),
    }));

    res.json({
      week: weekPayload(week),
      city: cityPayload(currentCity),
      nextCity: cityPayload(nextCity),
      selenaLeadSteps: Math.max(week.group_target_steps - groupSteps, SELENA_MIN_LEAD_STEPS),
      route: cities.rows.map((city) => ({
        city_id: city.id,
        name: city.name,
        visited: currentCity ? city.route_order < currentCity.route_order : false,
      })),
      progressStrip,
      leaderboard,
      countdown,
      lastSyncedAt: lastSync.rows[0]?.last_synced_at?.toISOString?.() ?? null,
      state,
    });
  } catch (e) {
    next(e);
  }
});
