import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
}

export interface SidebarProps {
  /** Active nav item id. */
  active?: string;
  onNavigate?: (id: string) => void;
  /** Avatar node rendered at the bottom (use <Avatar size={40} />). */
  avatar?: React.ReactNode;
  /** Override the 5 default nav items. */
  items?: NavItem[];
  /** Keep the 200px expanded state pinned (e.g. for previews). */
  forceExpanded?: boolean;
}

/**
 * Desktop sidebar nav. 60px collapsed (icons only), expands to 200px on
 * hover. Five nav items + avatar at bottom, with active & hover states.
 */
export function Sidebar(props: SidebarProps): JSX.Element;
export default Sidebar;
