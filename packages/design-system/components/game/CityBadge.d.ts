import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface CityBadgeProps {
  name?: string;
  /** Border quality tier. */
  quality?: 'bronze' | 'silver' | 'gold';
  /** Greyscale locked (future city) state; hides the name. */
  locked?: boolean;
  /** Diameter: 48 (collection grid) or 80 (featured). */
  size?: number;
  icon?: IconName;
  style?: React.CSSProperties;
}

/**
 * Circular collectible city badge with a bronze/silver/gold border ring
 * and a locked greyscale state for future cities.
 */
export function CityBadge(props: CityBadgeProps): JSX.Element;
export default CityBadge;

/** The per-city landmark silhouette component for a name, or null if none. */
export function getCityIcon(
  name?: string,
): ((props: { color: string }) => JSX.Element) | null;
