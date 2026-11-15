"use client";

import Avatar, { HAIR_COLORS, SKIN_TONES } from "@one-step-ahead/design-system/components/game/Avatar";
import { colorwayFromIndex } from "./finale/sprites";
import { useSession } from "./session";

/** The signed-in player's own avatar (falls back to the default figure). */
export function UserAvatar({ size = 40, ring = false }: { size?: number; ring?: boolean | string }) {
  const { user } = useSession();
  return (
    <Avatar
      size={size}
      ring={ring}
      colorway={colorwayFromIndex(user?.avatar_colorway ?? 1)}
      skinTone={SKIN_TONES[((user?.avatar_skin ?? 2) - 1) % SKIN_TONES.length]}
      hairColor={HAIR_COLORS[((user?.avatar_hair ?? 1) - 1) % HAIR_COLORS.length]}
    />
  );
}
