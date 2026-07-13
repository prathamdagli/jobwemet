import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Gauge,
  Route,
  GraduationCap,
  UserRound,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

/**
 * Single source of truth for the dashboard navigation.
 * The sidebar renders every item from this list; pages reuse the labels.
 */
export const dashboardNav: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Resume', to: '/resume', icon: FileText },
  { label: 'Career Matches', to: '/jobs', icon: Briefcase },
  { label: 'Skill Gap', to: '/skill-gap', icon: BarChart3 },
  { label: 'AI Skill Analysis', to: '/skills', icon: Gauge },
  { label: 'Learning Roadmap', to: '/roadmap', icon: Route },
  { label: 'Courses', to: '/courses', icon: GraduationCap },
  { label: 'Profile', to: '/profile', icon: UserRound },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export const logoutNavItem = { label: 'Logout', icon: LogOut }
