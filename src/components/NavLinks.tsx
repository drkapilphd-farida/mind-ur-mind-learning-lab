'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, GraduationCap, Layers, Library, LayoutDashboard, Settings, Users, type LucideIcon } from 'lucide-react'
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

// "My Library" doesn't navigate to its own page — it opens the Document
// History drawer on the dashboard (see AIDocumentTransformerWidget.tsx's
// `library` search-param effect). The `?library=open` query string is the
// real signal that survives a full navigation from any other dashboard
// page (e.g. from /labs/quantum-speed-reading/thirty-day-curriculum), not
// just a same-page state toggle.
//
// Real Navigation Integration™ (Phase 2) — "Study Projects" is this
// dashboard's first real link into the Learning Projects engine
// (src/app/preview/learning-projects/*): a fully built, previously
// nav-less system (6-stage reading flow, MCQs, Research/Revision/Focus/
// Memory/Smart Notes modes, the new Mode A/Mode B fork). Its own routes
// still live under the `/preview` URL prefix — that engine's own
// navConfig.ts already documents promoting them to root paths as a later,
// separate, low-risk folder move, not a same-day change bundled with
// finally making it discoverable. Points at its real project list
// (/preview/dashboard), not straight to "new" — a returning user should
// land on their own past projects, not be forced into another upload.
const QSR_NAV_ITEMS = [
  { href: '/labs/quantum-speed-reading/thirty-day-curriculum', label: '30-Day Masterclass', icon: GraduationCap },
  { href: '/dashboard?library=open', label: 'My Library', icon: Library },
  { href: '/preview/dashboard', label: 'Study Projects', icon: Layers },
  { href: '/progress', label: 'Mind Score™', icon: BarChart3 },
  { href: '/parent-dashboard', label: 'Parents Dashboard', icon: Users },
] as const

const SHARED_TRAILING_NAV_ITEMS = [{ href: '/settings', label: 'Settings', icon: Settings }] as const

function navItemsFor(appDomain: AppDomain): readonly NavItem[] {
  return [...SHARED_LEADING_NAV_ITEMS, ...(appDomain === 'habit' ? HABIT_NAV_ITEMS : QSR_NAV_ITEMS), ...SHARED_TRAILING_NAV_ITEMS]
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
