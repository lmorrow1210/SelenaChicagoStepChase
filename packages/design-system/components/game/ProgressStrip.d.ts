import * as React from 'react';
import { ColorwayId } from './Avatar';

export interface StripPlayer {
  id?: string;
  name?: string;
  /** Position 0–100 (steps vs. target). */
  pct: number;
  colorway?: ColorwayId;
  /** Highlights with a gold ring. */
  leader?: boolean;
}

export interface ProgressStripProps {
  /** Left city name. */
  from?: string;
  /** Right city name. */
  to?: string;
  players?: StripPlayer[];
  /** 'default' in progress, 'end' someone at 100%, 'empty' no data. */
  state?: 'default' | 'end' | 'empty';
  /** Smaller avatars + padding for mobile. */
  compact?: boolean;
  style?: React.CSSProperties;
}

/**
 * Straight-line leaderboard: City A → City B with each player's avatar
 * at their proportional position. Avatars hop on sync (spring easing).
 */
export function ProgressStrip(props: ProgressStripProps): JSX.Element;
