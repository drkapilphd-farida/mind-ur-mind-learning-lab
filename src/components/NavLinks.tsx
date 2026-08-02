'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Eye, Library, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

// "My Library" doesn't navigate to its own page — it opens the Document
// History drawer on the dashboard (see AIDocumentTransformerWidget.tsx's
// `library` search-param effect). The `?library=open` query string is the
// real signal that survives a full navigation from any other dashboard
// page (e.g. from /labs/quantum-speed-reading), not just a same-page
// state toggle.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/labs/quantum-speed-reading', label: 'Quantum Speed Reading', icon: Eye },
  { href: '/dashboard?library=open', label: 'My Library', icon: Library },
  { href: '/progress', label: 'Mind Score™', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

type NavLinksProps = {
  onSelect?: (() => void) | undefined
}

export function NavLinks({ onSelect }: NavLinksProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Main navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
