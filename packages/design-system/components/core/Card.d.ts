import * as React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  /** 'default' (--card) or 'elevated' (lighter surface for modals/overlays). */
  variant?: 'default' | 'elevated';
  /** Adds an accent glow for achievement moments. */
  glow?: 'blue' | 'gold' | 'red';
  padding?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Surface container: default card or elevated modal/overlay surface. */
export function Card(props: CardProps): JSX.Element;
export default Card;
