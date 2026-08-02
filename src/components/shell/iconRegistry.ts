import { CreditCard, LayoutDashboard, LifeBuoy, Settings, Sparkles, User, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// The only place shell nav icon *components* are resolved — imported
// exclusively by client components (ShellNavLinks.tsx). Nav item data
// modules (e.g. app/preview/navConfig.ts, a plain object imported by a
// Server Component layout) reference icons by name only — see
// components/shell/types.ts for why.
export const SHELL_ICONS = {
  LayoutDashboard,
  Sparkles,
  Layers,
  User,
  Settings,
  CreditCard,
  LifeBuoy,
} as const satisfies Record<string, LucideIcon>

export type ShellIconName = keyof typeof SHELL_ICONS
