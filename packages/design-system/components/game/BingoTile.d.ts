import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface BingoTileProps {
  label?: string;
  icon?: IconName;
  /** Tile state. 'free' is the always-complete Selena center square. */
  state?: 'incomplete' | 'progress' | 'complete' | 'free';
  /** Phosphor pulse + glow when part of a line one tile from completion. */
  highlight?: boolean;
  /** Assist-covered by a teammate — phosphor-hot corner badge. */
  gifted?: boolean;
  style?: React.CSSProperties;
}

/**
 * Operational-matrix tile for the 5×5 card. Four states: available (raised
 * screen, muted), complete (solid phosphor key + stamped ✓), free
 * (Selena silhouette on phosphor-hot), gifted (complete face + assist badge).
 * 'progress' renders as available with a phosphor working edge.
 */
export function BingoTile(props: BingoTileProps): JSX.Element;
export default BingoTile;
