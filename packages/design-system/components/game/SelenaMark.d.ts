import * as React from 'react';

export interface SelenaMarkProps {
  /** Rendered square size in px. */
  size?: number;
  /** Single-color (currentColor) variant for stamps/redactions. */
  mono?: boolean;
  style?: React.CSSProperties;
}

/**
 * Selena Chicago's compact silhouette glyph — sky-blue fedora with red
 * band over a bone Star-Stitch trench. The only place the Chicago-flag
 * palette appears. Use sparingly (§11).
 */
export function SelenaMark(props: SelenaMarkProps): JSX.Element;
export default SelenaMark;
