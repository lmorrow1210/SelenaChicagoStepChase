import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface BingoTileProps {
  label?: string;
  icon?: IconName;
  /** Tile state. 'free' is the always-complete Selena center square. */
  state?: 'incomplete' | 'progress' | 'complete' | 'free';
  /** Pulse + glow when part of an animated winning line. */
  highlight?: boolean;
  style?: React.CSSProperties;
}

/**
 * Square tile for the 5×5 bingo card. incomplete (dark outline, muted),
 * progress (blue glow outline), complete (blue 20% fill + check),
 * free (Selena/star center, always complete).
 */
export function BingoTile(props: BingoTileProps): JSX.Element;
export default BingoTile;
