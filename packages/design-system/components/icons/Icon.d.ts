import * as React from 'react';

export type IconName =
  | 'map' | 'prediction' | 'city' | 'bingo' | 'nemesis'
  | 'step' | 'workout' | 'sleep' | 'heart' | 'badge'
  | 'settings' | 'sync' | 'crown' | 'star'
  | 'lock' | 'check' | 'close' | 'chevronRight'
  | 'flame' | 'clock' | 'globe' | 'trophy';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Which icon to render. */
  name: IconName;
  /** Pixel size (width & height). Default 24. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
  /** Stroke color. Defaults to currentColor. */
  color?: string;
}

/**
 * Selena's Chase icon set — 24px grid, 2px stroke, rounded caps.
 * Color via currentColor: --cream default, --blue active.
 */
export function Icon(props: IconProps): JSX.Element;

export const ICON_NAMES: IconName[];
export default Icon;
