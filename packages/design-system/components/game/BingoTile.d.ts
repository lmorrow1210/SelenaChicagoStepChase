import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface BingoTileProps {
  label?: string;
  icon?: IconName;
  /** Tile state. 'free' is the always-complete Selena center square. */
  state?: 'incomplete' | 'progress' | 'complete' | 'free';
  /** Amber pulse + glow when part of a line one tile from completion. */
  highlight?: boolean;
  /** Assist-covered by a teammate — teal corner badge (the only teal on the board). */
  gifted?: boolean;
  style?: React.CSSProperties;
}

/**
 * Operational-matrix tile for the 5×5 card. Four states: available (raised
 * ink, muted), complete (pressed inset + amber fill + stamped ✓), free
 * (Selena silhouette on amber), gifted (complete face + teal assist badge).
 * 'progress' renders as available with an amber working edge.
 */
export function BingoTile(props: BingoTileProps): JSX.Element;
export default BingoTile;
