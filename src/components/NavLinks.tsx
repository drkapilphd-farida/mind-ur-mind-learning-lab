'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, LayoutDashboard, Radio, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppDomain } from '@/lib/domains/appDomain'

type NavItem = { href: string; label: string; icon: LucideIcon }

// Domain Split™ — habit.mindurmind.org.in shows ONLY the 21-Day Habit
// Builder (its journey + own streak tracker) and Settings; every other
// item below is app.mindurmind.org.in-only. "Dashboard" is the one item
// both domains share — it's the same URL path on both, the page itself
// (see (dashboard)/dashboard/page.tsx) renders different content per
// domain. Cross-domain routes are also actively redirected at the
// middleware level (src/middleware.ts's DOMAIN_ROUTES) — this split
// keeps the nav honest with that enforcement, it isn't the enforcement
// itself.
const SHARED_LEADING_NAV_ITEMS = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] as const

// journey/analytics already existed (built for the dashboard-page journey
// card's own "view analytics" link) but had no nav entry anywhere — the
// habit domain's real "streak tracker" surface.
const HABIT_NAV_ITEMS = [{ href: '/labs/quantum-speed-reading/journey/analytics', label: 'Streak & Progress', icon: BarChart3 }] as const

// Two-Pillar Simplification™ — the app domain now stands on exactly two
// pillars, not three. "Advanced Drills" (the standalone drill catalog:
// Coach dashboard, Reading DNA hub, Reports, Right Brain/Reading/
// Visualization/Intuition hubs) is retired — its training content lives
// only inside the 30-Day Masterclass's own daily missions now, never as
// a separate browsable catalog. Parents Dashboard stays reachable as a
// tab inside Pillar 1 (/masterclasses), not a separate top-level item.
const QSR_NAV_ITEMS = [
  { href: '/masterclasses', label: '30-Day Masterclass', icon: Radio },
  { href: '/document-studio', label: 'Document Studio', icon: BookOpen },
] as const

function navItemsFor(appDomain: AppDomain): readonly NavItem[] {
  return [...SHARED_LEADING_NAV_ITEMS, ...(appDomain === 'habit' ? HABIT_NAV_ITEMS : QSR_NAV_ITEMS)]
}

type NavLinksProps = {
  onSelect?: (() => void) | undefined
  appDomain: AppDomain
}

export function NavLinks({ onSelect, appDomain }: NavLinksProps): React.JSX.Element {
  const pathname = usePathname()
  const navItems = navItemsFor(appDomain)

  return (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Main navigation">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            {...(onSelect !== undefined ? { onClick: onSelect } : {})}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isActive
                ? 'bg-foreground/[0.07] text-foreground'
                : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'size-4 shrink-0 transition-colors duration-150',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
