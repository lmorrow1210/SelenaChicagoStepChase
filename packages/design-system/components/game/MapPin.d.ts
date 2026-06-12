import * as React from 'react';

export interface MapPinProps {
  /** 'current' glowing blue pulse, 'next' red (Selena ahead), 'visited' dim. */
  variant?: 'current' | 'next' | 'visited';
  /** Optional city name pill under the pin. */
  label?: string;
  /** Show Selena's figure icon instead of the city glyph. */
  selena?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/**
 * World-map city marker. Current city glows blue with an active pulse;
 * the next city / Selena's position is a dimmer red accent.
 */
export function MapPin(props: MapPinProps): JSX.Element;
export default MapPin;
