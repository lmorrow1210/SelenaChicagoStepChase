import * as React from 'react';

export interface MapPinProps {
  /** 'current' phosphor pulse, 'next' red when Selena, 'visited' checked, 'upcoming' ghost. */
  variant?: 'current' | 'next' | 'visited' | 'upcoming';
  /** Optional city name pill under the pin. */
  label?: string;
  /** City name used to pick the landmark silhouette (falls back to a glyph). */
  cityName?: string;
  /** Show Selena's figure icon instead of the city glyph. */
  selena?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/**
 * World-map city marker. Current city glows phosphor with an active pulse;
 * the next city / Selena's position is a dimmer red accent.
 */
export function MapPin(props: MapPinProps): JSX.Element;
export default MapPin;
