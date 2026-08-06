'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Building2, Handshake, LayoutDashboard, ListOrdered, Menu, FlaskConical, Trophy, MessageSquareHeart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, exact: false },
  { href: '/admin/schools', label: 'Schools', icon: Building2, exact: false },
  { href: '/admin/partners', label: 'Partners', icon: Handshake, exact: false },
  { href: '/admin/partner-resources', label: 'Partner Resources', icon: BookOpen, exact: false },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy, exact: false },
  { href: '/admin/quality-control', label: 'Quality Control', icon: MessageSquareHeart, exact: false },
  // Dev/Test Mode™ — the route itself 404s in production (see
  // (admin)/admin/dev-tools/page.tsx), but this nav entry is additionally
  // hidden client-side there too, so it never even appears as a dead link.
  ...(process.env.NODE_ENV !== 'production'
    ? [{ href: '/admin/dev-tools', label: 'Dev Tools', icon: FlaskConical, exact: false }] as const
    : []),
] as const

function AdminNavLinks({
  pathname,
  onSelect,
}: {
  pathname: string
  onSelect?: (() => void) | undefined
}): React.JSX.Element {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            {...(onSelect !== undefined ? { onClick: onSelect } : {})}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="bg-card hidden w-56 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold">Admin Panel</span>
        </div>
        <AdminNavLinks pathname={pathname} />
        <div className="border-t p-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors"
          >
            <ListOrdered className="size-3.5" />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex flex-1 flex-col">
        <header className="bg-background flex h-14 shrink-0 items-center gap-3 border-b px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold">Admin Panel</span>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            className="flex w-56 flex-col gap-0 p-0"
            showCloseButton={false}
          >
            <div className="flex h-14 shrink-0 items-center border-b px-4">
              <SheetTitle className="text-sm font-semibold">Admin Panel</SheetTitle>
            </div>
            <AdminNavLinks pathname={pathname} onSelect={() => setOpen(false)} />
            <div className="border-t p-4">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors"
                onClick={() => setOpen(false)}
              >
                <ListOrdered className="size-3.5" />
                Back to app
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
