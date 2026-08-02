import type { ShellNavItem } from '@/components/shell/types'

// AI Learning Studio™'s nav — every href is a real segment under
// `/preview` today (see the sprint's routing note: this namespace is
// staging only, not a permanent brand). Promoting to root paths later is
// a folder move (`src/app/preview/dashboard` → `src/app/dashboard`, ...)
// plus updating this one file — no shell/component changes required.
//
// `icon` is a string key (see components/shell/iconRegistry.ts), not an
// imported component — this module is imported by the Server Component
// layout (`app/preview/layout.tsx`) and passed as a prop into the
// 'use client' AppShell, and an actual icon component reference can't
// cross that boundary as a prop (React Server Components: "Functions
// cannot be passed directly to Client Components").
export const PREVIEW_NAV_ITEMS: readonly ShellNavItem[] = [
  { href: '/preview/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/preview/learning-studio', label: 'AI Learning Studio', icon: 'Sparkles' },
  { href: '/preview/workspace', label: 'Workspace', icon: 'Layers' },
  { href: '/preview/profile', label: 'Profile', icon: 'User' },
  { href: '/preview/settings', label: 'Settings', icon: 'Settings' },
  { href: '/preview/subscription', label: 'Subscription', icon: 'CreditCard' },
  { href: '/preview/support', label: 'Support', icon: 'LifeBuoy' },
] as const
