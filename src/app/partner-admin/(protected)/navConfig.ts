import type { ShellNavItem } from '@/components/shell/types'

export const PARTNER_ADMIN_NAV_ITEMS: readonly ShellNavItem[] = [
  { href: '/partner-admin', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/partner-admin/resources', label: 'Partner Resources', icon: 'BookOpen' },
  { href: '/partner-admin/billing', label: 'Billing', icon: 'CreditCard' },
  { href: '/partner-admin/settings', label: 'Branding', icon: 'Settings' },
]
