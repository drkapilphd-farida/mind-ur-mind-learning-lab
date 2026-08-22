'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NavLinks } from '@/components/NavLinks'
import { MobileSignOutButton } from '@/components/MobileSignOutButton'

const HUB_HREF = '/labs/quantum-speed-reading'

// Domain Split™ — this header renders on both domains (habit-only
// /journey/* pages and app-only coach/intelligence/reports/etc. pages
// alike), so its own sub-nav row must never mix the two: a journey page
// showing a link to "Reading DNA" (app-only, redirected away by
// src/middleware.ts's DOMAIN_ROUTES) would be a dead link — technically
// blocked, but a visibly broken nav.
const HABIT_LAB_SUB_NAV = [
  { href: '/labs/quantum-speed-reading/journey/analytics', label: 'Analytics' },
  { href: '/labs/quantum-speed-reading/journey/certificate', label: 'Certificate' },
] as const

const QSR_LAB_SUB_NAV = [
  { href: '/labs/quantum-speed-reading/coach', label: 'Dashboard' },
  { href: '/labs/quantum-speed-reading/intelligence', label: 'Reading DNA' },
  { href: '/labs/quantum-speed-reading/intelligence/history', label: 'History' },
  { href: '/labs/quantum-speed-reading/intelligence/achievements', label: 'Achievements' },
  { href: '/labs/quantum-speed-reading/reports', label: 'Reports' },
] as const

const SHARED_LAB_SUB_NAV = [{ href: '/settings', label: 'Settings' }] as const

type LabNavHeaderProps = {
  currentSection: string
}

// Sprint-6 — the shared nav shell for browsing surfaces only (hub, dashboard,
// intelligence/*, reports/*). Deliberately never rendered on immersive
// full-screen exercise/reading/quiz screens, which already have their own
// self-contained exit controls and shouldn't gain persistent chrome.
//
// `sticky top-0` (not the app's other header, Topbar.tsx's flex+overflow
// layout trick) — these lab pages scroll as a normal document, with no
// wrapping flex/overflow-y-auto shell to keep a header pinned for free,
// so this needs its own "never scrolls away" mechanism. Sticky over a
// true `fixed` position deliberately: it keeps its layout space until it
// starts pinning, so no compensating top-padding hack is needed anywhere
// else on the page.
//
// Global Nav Drawer™ — this lab has its own richer sub-navigation (the
// navLinks row below), but that's DIFFERENT from the app's global
// sections (My Library, 30-Day Masterclass, Settings...) and reads as an
// unreadable wrapped wall of tiny links on a phone screen. The hamburger
// here opens the exact same global NavLinks + Sign Out every other
// authenticated page's Topbar exposes, so a mobile learner deep in the
// Reading Intelligence Lab is never stranded without a way back to the
// rest of the app (or out of their account) — the desktop-only navLinks
// row stays as this lab's own secondary sub-nav, unchanged, at sm+.
export function LabNavHeader({ currentSection }: LabNavHeaderProps): React.JSX.Element {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // Mirrors src/middleware.ts's own DOMAIN_ROUTES classification for this
  // lab: only /journey/* is habit-domain, everything else under
  // /labs/quantum-speed-reading is app-domain. Inferred locally (this
  // component only ever renders under that one lab) rather than threaded
  // as a prop through 27 call sites.
  const appDomain = pathname.startsWith('/labs/quantum-speed-reading/journey') ? 'habit' : 'app'
  const navLinks = [...(appDomain === 'habit' ? HABIT_LAB_SUB_NAV : QSR_LAB_SUB_NAV), ...SHARED_LAB_SUB_NAV]

  return (
    <nav aria-label="Reading Intelligence Lab" className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <Button variant="ghost" size="icon" className="-ml-2 sm:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>

            <SheetContent side="left" className="w-60 gap-0 p-0" showCloseButton={false}>
              <SheetHeader className="flex h-14 shrink-0 flex-row items-center gap-2 border-b px-4 py-0 space-y-0">
                <LivingBrainLogo size={22} decorative={false} animated={false} />
                <SheetTitle className="text-sm font-semibold tracking-tight">Quantum Mind</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                <NavLinks onSelect={() => setOpen(false)} appDomain={appDomain} />
              </div>
              <SheetFooter className="border-t border-border/60 p-2">
                <MobileSignOutButton />
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Link
            href={HUB_HREF}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
          >
            <LivingBrainLogo size={20} decorative={false} animated={false} />
            <span className="hidden sm:inline">Reading Intelligence Lab™</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="sr-only">Current section:</span>
          <span aria-current="page" className="text-xs font-medium text-foreground">
            {currentSection}
          </span>

          <div className="hidden flex-wrap items-center gap-x-5 gap-y-1 sm:flex">
            {navLinks.map((link) => {
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
      </div>
    </nav>
  )
}
