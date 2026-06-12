import * as React from 'react';

export interface SkeletonProps {
  /** Loading layout preset. */
  preset?: 'leaderboard' | 'landmark' | 'bingo' | 'block';
  /** Rows for the leaderboard preset. Default 4. */
  rows?: number;
  style?: React.CSSProperties;
}

/**
 * Pulsing skeleton screens for leaderboard list, landmark grid,
 * and bingo card. Animates --skeleton against the card surface.
 */
export function Skeleton(props: SkeletonProps): JSX.Element;
