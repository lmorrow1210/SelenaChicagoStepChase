import * as React from 'react';
import { NavItem } from './Sidebar';

export interface TabBarProps {
  /** Active nav item id. */
  active?: string;
  onNavigate?: (id: string) => void;
  /** Override the 5 default nav items. */
  items?: NavItem[];
  style?: React.CSSProperties;
}

/**
 * Mobile bottom tab bar. Five icons with labels, active state (blue +
 * top indicator), and safe-area inset handling. Touch targets ≥44px.
 */
export function TabBar(props: TabBarProps): JSX.Element;
