import type { SessionUser } from "../session";
import { colorwayFromIndex, type AvatarChoice } from "./sprites";

/** The finale belongs to the last city of the loop. */
export const FINALE_WEEK_NUMBER = 13;

export interface FinaleCaseSlice {
  weekNumber: number;
  /** True once this viewer has seen (or skipped) the send-off. */
  finaleViewed?: boolean;
}

/**
 * Auto-open rule: the first time the viewer reaches the Week 13 case-closed
 * moment — i.e. the previous case is Week 13 and they haven't seen the
 * send-off. Seen state is the server's `season_finale` ritual view, so it
 * follows the player across devices; replay is always available from Evidence.
 */
export function shouldAutoOpenFinale(previousCase: FinaleCaseSlice | null | undefined): boolean {
  return Boolean(
    previousCase
      && previousCase.weekNumber === FINALE_WEEK_NUMBER
      && !previousCase.finaleViewed,
  );
}

export function avatarChoiceFromUser(
  user: Pick<SessionUser, "avatar_skin" | "avatar_hair" | "avatar_colorway"> | null | undefined,
): AvatarChoice {
  return {
    skin: user?.avatar_skin ?? 1,
    hair: user?.avatar_hair ?? 1,
    colorway: user?.avatar_colorway ?? 1,
  };
}

/** Every distinct avatar the onboarding picker can produce (5 x 5 x 6). */
export function allAvatarChoices(): AvatarChoice[] {
  const out: AvatarChoice[] = [];
  for (let skin = 1; skin <= 5; skin++)
    for (let hair = 1; hair <= 5; hair++)
      for (let colorway = 1; colorway <= 6; colorway++) out.push({ skin, hair, colorway });
  return out;
}

export { colorwayFromIndex };
