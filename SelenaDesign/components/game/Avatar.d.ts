import * as React from 'react';

export type ColorwayId = 'chicago' | 'midnight' | 'emerald' | 'crimson' | 'desert' | 'violet';

export interface AvatarProps {
  /** Pixel diameter. Use 24 (leaderboard), 40 (strip), 120 (profile). */
  size?: number;
  /** Preset coat+boots combo. */
  colorway?: ColorwayId;
  /** Skin tone hex (one of 6). */
  skinTone?: string;
  /** Hair color hex (one of 5). */
  hairColor?: string;
  /** Ring outline: a color string, or true for --blue. */
  ring?: boolean | string;
  /** Node overlaid top-right (e.g. a crown for the leader). */
  badge?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * The mini trench-coat figure. Parameterized by skin tone (6), hair
 * color (5), and colorway (6 preset coat/boots combos).
 * @startingPoint section="Game" subtitle="Trench-coat avatar — 6 colorways, 3 sizes" viewport="700x180"
 */
export function Avatar(props: AvatarProps): JSX.Element;

export const COLORWAYS: Record<ColorwayId, { label: string; coat: string; boots: string }>;
export const SKIN_TONES: string[];
export const HAIR_COLORS: string[];
