import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface LandmarkTileProps {
  name?: string;
  /** One-line fun fact shown when unlocked. */
  fact?: string;
  /** 'locked' silhouette, 'unlocked' full color, 'today' pulsing blue. */
  state?: 'locked' | 'unlocked' | 'today';
  /** Illustration base color when unlocked. */
  color?: string;
  icon?: IconName;
  style?: React.CSSProperties;
}

/**
 * City-screen landmark tile. Locked = dark muted silhouette; unlocked =
 * full-color illustration + name + fun fact; today = locked with a
 * glowing blue border pulse.
 */
export function LandmarkTile(props: LandmarkTileProps): JSX.Element;
