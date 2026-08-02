'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'

const HUB_HREF = '/labs/quantum-speed-reading'

const NAV_LINKS = [
  { href: '/labs/quantum-speed-reading/coach', label: 'Dashboard' },
  { href: '/labs/quantum-speed-reading/intelligence', label: 'Reading DNA' },
  { href: '/labs/quantum-speed-reading/intelligence/history', label: 'History' },
  { href: '/labs/quantum-speed-reading/intelligence/achievements', label: 'Achievements' },
  { href: '/labs/quantum-speed-reading/reports', label: 'Reports' },
  { href: '/labs/quantum-speed-reading/journey/analytics', label: 'Analytics' },
  { href: '/labs/quantum-speed-reading/journey/certificate', label: 'Certificate' },
  { href: '/settings', label: 'Settings' },
] as const

type LabNavHeaderProps = {
  currentSection: string
}

// Sprint-6 — the shared nav shell for browsing surfaces only (hub, dashboard,
// intelligence/*, reports/*). Deliberately never rendered on immersive
// full-screen exercise/reading/quiz screens, which already have their own
// self-contained exit controls and shouldn't gain persistent chrome.
export function LabNavHeader({ currentSection }: LabNavHeaderProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav aria-label="Reading Intelligence Lab" className="border-b bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link
          href={HUB_HREF}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          <LivingBrainLogo size={20} decorative={false} animated={false} />
          Reading Intelligence Lab™
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="sr-only">Current section:</span>
          <span aria-current="page" className="text-xs font-medium text-foreground">
            {currentSection}
          </span>

          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground underline underline-offset-4',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
