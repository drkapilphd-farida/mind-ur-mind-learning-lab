'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { UserMenu } from '@/components/UserMenu'
import { ShellNavLinks } from './ShellNavLinks'
import type { ShellNavItem } from './types'

// Immersive Onboarding Polish™ (Sprint LW-1C.3) — a fixed allow-list of the
// onboarding routes that live under /preview but must render chrome-free
// ("Hide sidebar, dashboard navigation, profile shortcuts, settings,
// subscription, labs, workspace navigation. Only show Logo, Living AI
// Symbol, current step, main content."). Every other /preview/* route
// (dashboard, labs, settings, subscription, etc.) matches none of these
// patterns and keeps this shell exactly as before.
//
// Sprint LW-1E — the Learning Blueprint page
// (/preview/learning-projects/[id], no further segment) was deliberately
// excluded in LW-1C.3 (that brief explicitly locked "Learning Blueprint");
// this sprint's own brief explicitly authorizes and requires Focus Mode on
// this exact page ("Keep Focus Mode active... Show only Living AI Symbol,
// Blueprint, AI Recommendation, Learning Modes"), so it's added here.
//
// Sprint LW-2 — Quantum Speed Reading™ ("This experience runs entirely in
// Focus Mode. Hide... Everything. Only show Reading Experience™").
//
// Quantum Speed Reading™ Production Sprint-3 — the real Reading Workspace
// (`/preview/learning-projects/[id]/read`, distinct from the LW-2 mock
// page above) reuses this exact mechanism rather than building a second
// one. This only controls the *outer* app chrome (sidebar/topbar/footer);
// the Workspace's own in-page Focus Mode toggle is a separate, smaller,
// client-side concern layered on top — see ReadingWorkspace.tsx.
const IMMERSIVE_ROUTE_PATTERNS = [
  /^\/preview\/learning-projects\/new$/,
  /^\/preview\/learning-projects\/[^/]+\/processing$/,
  /^\/preview\/learning-projects\/[^/]+$/,
  /^\/preview\/learning-projects\/[^/]+\/read$/,
  /^\/preview\/learning-projects\/[^/]+\/memory$/,
  /^\/preview\/learning-projects\/[^/]+\/notes$/,
  /^\/preview\/learning-projects\/[^/]+\/workspace$/,
  /^\/preview\/learning-projects\/[^/]+\/mind-map$/,
  /^\/preview\/learning-projects\/[^/]+\/flashcards$/,
  /^\/preview\/learning-projects\/[^/]+\/focus$/,
  /^\/preview\/learning-projects\/[^/]+\/mcqs$/,
  /^\/preview\/learning-projects\/[^/]+\/revision$/,
]

type AppShellProps = {
  brandLabel: string
  brandHref: string
  navItems: readonly ShellNavItem[]
  fullName: string | null
  avatarUrl: string | null
  email: string
  children: React.ReactNode
  // Reserved slot for a future contextual panel (AI Mentor chat, session
  // details, ...) — Sprint 0 renders nothing here; passing `rightPanel`
  // later needs no shell changes, only a prop.
  rightPanel?: React.ReactNode
}

// A reusable app shell (persistent sidebar + topbar + content + optional
// right panel + minimal footer), parameterized by nav items and brand
// instead of hardcoded — the existing `(dashboard)` and `(admin)` route
// groups each already have their own independent, hardcoded shell
// (`AppSidebar`/`Topbar` and `AdminShell` respectively); neither is
// touched here. This is a third, but a *reusable* one: any future shell
// (this one, or a later consolidation of the other two) can compose it
// instead of hand-copying sidebar/topbar markup a fourth time.
export function AppShell({
  brandLabel,
  brandHref,
  navItems,
  fullName,
  avatarUrl,
  email,
  children,
  rightPanel,
}: AppShellProps): React.JSX.Element {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()

  if (IMMERSIVE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return <div className="min-h-dvh bg-background">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar — hidden on mobile, matches AppSidebar's w-60/border-r/bg-card convention */}
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r bg-card/80 md:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-border/60 px-4">
          <Link
            href={brandHref}
            className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
          >
            {brandLabel}
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <ShellNavLinks items={navItems} />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>
            <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
              <SheetHeader className="flex h-14 shrink-0 flex-row items-center space-y-0 border-b px-4 py-0">
                <SheetTitle className="text-sm font-semibold tracking-tight">{brandLabel}</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <ShellNavLinks items={navItems} onSelect={() => setMobileNavOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <UserMenu fullName={fullName} avatarUrl={avatarUrl} email={email} />
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">{children}</div>
          </main>

          {rightPanel !== undefined && (
            <aside className="hidden w-80 shrink-0 overflow-y-auto border-l bg-card/50 p-4 lg:block">
              {rightPanel}
            </aside>
          )}
        </div>

        <footer className="shrink-0 border-t px-6 py-3 text-center text-xs text-muted-foreground">
          Quantum Mind Learning Lab™
        </footer>
      </div>
    </div>
  )
}
