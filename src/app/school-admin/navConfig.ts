import type { ShellNavItem } from '@/components/shell/types'

// Classes/students/import/leaderboard land in later phases (see the
// School Dashboard plan) — kept as a plain data array so each phase only
// ever adds an object here, never touches layout.tsx or the shell itself.
export const SCHOOL_ADMIN_NAV_ITEMS: readonly ShellNavItem[] = [
  { href: '/school-admin', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/school-admin/settings', label: 'Branding', icon: 'Settings' },
]
