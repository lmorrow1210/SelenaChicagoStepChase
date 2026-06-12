import { z } from "zod";

// ---- shared constants ----
export const GROUP_MAX_MEMBERS = 8;
export const INVITE_CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const FREE_SPACE_INDEX = 12;

// ---- user ----
export const avatarConfigSchema = z.object({
  avatar_skin: z.number().int().min(1).max(6),
  avatar_hair: z.number().int().min(1).max(8),
  avatar_colorway: z.number().int().min(1).max(6),
});

export const updateMeSchema = z
  .object({
    display_name: z.string().min(1).max(40),
    weekly_step_target: z.number().int().min(35000).max(140000),
  })
  .merge(avatarConfigSchema)
  .partial();

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
  }),
  z.object({ free: z.literal(true), state: z.literal("complete") }),
]);
export const bingoTilesSchema = z.array(bingoTileSchema).length(25);

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
