import { z } from "zod";

// ---- shared constants ----
export const GROUP_MAX_MEMBERS = 8;
export const INVITE_CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const FREE_SPACE_INDEX = 12;

// ---- Season One narrative state ----
export const WEEKLY_OUTCOMES = [
  "trail_lost",
  "pursuit_maintained",
  "close_encounter",
  "interception",
] as const;
export const weeklyOutcomeSchema = z.enum(WEEKLY_OUTCOMES);

export const WEEK_PHASES = [
  "briefing",
  "active",
  "midweek_update",
  "final_push",
  "sudden_death",
  "case_closing",
  "case_closed",
] as const;
export const weekPhaseSchema = z.enum(WEEK_PHASES);

export const DATA_CONFIDENCE_VALUES = [
  "verified",
  "estimated",
  "incomplete",
  "recalculating",
] as const;
export const dataConfidenceSchema = z.enum(DATA_CONFIDENCE_VALUES);

export const RITUAL_IDS = [
  "monday_briefing",
  "midweek_update",
  "final_push",
  "case_closed",
] as const;
export const ritualIdSchema = z.enum(RITUAL_IDS);
export const ritualViewSchema = z.object({
  week_id: z.string().uuid(),
  ritual_id: ritualIdSchema,
});

export const PRIMARY_ACTION_IDS = [
  "fix_sync",
  "view_briefing",
  "view_case_result",
  "sudden_death",
  "special_operation",
  "submit_prediction",
  "field_ops_near_reward",
  "nemesis_close",
  "daily_target",
  "continue_pursuit",
] as const;
export const primaryActionIdSchema = z.enum(PRIMARY_ACTION_IDS);

// ---- user ----
export const avatarConfigSchema = z.object({
  avatar_skin: z.number().int().min(1).max(6),
  avatar_hair: z.number().int().min(1).max(8),
  avatar_colorway: z.number().int().min(1).max(6),
});

// M10 objective categories (bingo_challenge_definitions.category values)
export const OBJECTIVE_CATEGORIES = [
  "steps", "workout", "sleep", "heart", "social", "wildcard",
  "strength", "cardio", "recovery", "hydration",
] as const;
export const objectiveCategorySchema = z.enum(OBJECTIVE_CATEGORIES);

export const updateMeSchema = z
  .object({
    display_name: z.string().min(1).max(40),
    weekly_step_target: z.number().int().min(35000).max(140000),
    // M10 accessibility: category → false hides it from the weekly card
    objective_prefs: z.record(objectiveCategorySchema, z.boolean()),
  })
  .merge(avatarConfigSchema)
  .partial();

// M10 group-admin category toggles
export const updateGroupCategoriesSchema = z.object({
  disabled_categories: z.array(objectiveCategorySchema).max(8),
});

// ---- group ----
export const createGroupSchema = z.object({
  name: z.string().min(1).max(40),
});

export const joinGroupSchema = z.object({
  invite_code: z
    .string()
    .length(6)
    .regex(new RegExp(`^[${INVITE_CODE_CHARSET}]{6}$`)),
});

// ---- prediction ----
export const submitPredictionSchema = z.object({
  predicted_steps: z.number().int().positive(),
});

// ---- bingo tile shape (denormalized JSONB in bingo_cards.tiles) ----
export const bingoTileSchema = z.union([
  z.object({
    challenge_id: z.number().int(),
    state: z.enum(["incomplete", "in_progress", "complete"]),
    completed_at: z.string().datetime().nullable().optional(),
    // M10 provenance: self-reported honor completion (optional note),
    // or covered by a teammate's Gift-a-Tile assist.
    honor: z.boolean().optional(),
    honor_note: z.string().max(280).nullable().optional(),
    gifted_by: z.string().uuid().nullable().optional(),
  }),
  z.object({ free: z.literal(true), state: z.literal("complete") }),
]);
export const bingoTilesSchema = z.array(bingoTileSchema).length(25);

// ---- M10 Field Ops request bodies ----
export const honorCompleteSchema = z.object({
  challenge_id: z.number().int(),
  note: z.string().max(280).optional(),
});
export const giftTileSchema = z.object({
  to_user_id: z.string().uuid(),
  challenge_id: z.number().int(),
});

// ---- nemesis daily result (JSONB in nemesis_matchups.daily_results) ----
export const nemesisDayResultSchema = z.object({
  date: z.string(),
  a_steps: z.number().int().nonnegative(),
  b_steps: z.number().int().nonnegative(),
  winner: z.enum(["a", "b", "tie"]),
});

// ---- API error envelope ----
export const errorEnvelopeSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export type UpdateMe = z.infer<typeof updateMeSchema>;
export type BingoTile = z.infer<typeof bingoTileSchema>;
export type NemesisDayResult = z.infer<typeof nemesisDayResultSchema>;
export type WeeklyOutcome = z.infer<typeof weeklyOutcomeSchema>;
export type WeekPhase = z.infer<typeof weekPhaseSchema>;
export type DataConfidence = z.infer<typeof dataConfidenceSchema>;
export type PrimaryActionId = z.infer<typeof primaryActionIdSchema>;
export type RitualId = z.infer<typeof ritualIdSchema>;
