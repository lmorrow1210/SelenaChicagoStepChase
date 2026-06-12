import * as React from 'react';
import { ColorwayId } from './Avatar';

export interface TowerData {
  label?: string;
  steps: number;
  colorway?: ColorwayId;
}

export interface SkyscraperPairProps {
  /** Left tower (blue). */
  you?: TowerData;
  /** Right tower (red). */
  nemesis?: TowerData;
  /** Force an outcome; otherwise derived from steps. */
  outcome?: 'you' | 'nemesis' | 'tie' | 'progress';
  /** Normalize heights to this value (e.g. group week max) instead of the pair max. */
  max?: number;
  /** Bounce the buildings up on mount (spring overshoot). */
  animate?: boolean;
  style?: React.CSSProperties;
}

/**
 * Nemesis duel: two buildings whose height is normalized step count.
 * Left = you (blue), right = nemesis (red). Taller gets a gold crown.
 */
export function SkyscraperPair(props: SkyscraperPairProps): JSX.Element;
export default SkyscraperPair;
