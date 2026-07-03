import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface BingoTileProps {
  label?: string;
  icon?: IconName;
  /** Tile state. 'free' is the always-complete Selena center square. */
  state?: 'incomplete' | 'progress' | 'complete' | 'free';
  /** Amber pulse + glow when part of a line one tile from completion. */
  highlight?: boolean;
  /** Vector category cast on the idle face. */
  tint?: 'step' | 'routine' | 'biometric';
  style?: React.CSSProperties;
}

/**
 * Operational-matrix tile for the 5×5 card. incomplete (raised ink, muted),
 * progress (amber edge), complete (pressed inset + amber fill + stamped ✓),
 * free (Selena silhouette on amber, always complete).
 */
export function BingoTile(props: BingoTileProps): JSX.Element;
export default BingoTile;
