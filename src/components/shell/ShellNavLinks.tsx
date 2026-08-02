'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SHELL_ICONS } from './iconRegistry'
import type { ShellNavItem } from './types'

type ShellNavLinksProps = {
  items: readonly ShellNavItem[]
  onSelect?: (() => void) | undefined
}

// A parameterized version of the existing `NavLinks` pattern (same
// markup/behavior, byte-for-byte) — the existing `(dashboard)` and
// `(admin)` shells each hardcode their own nav item list inline; this one
// takes `items` as a prop so any future shell (this one included) reuses
// one implementation instead of a third hand-copied nav component.
export function ShellNavLinks({ items, onSelect }: ShellNavLinksProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Main navigation">
      {items.map(({ href, label, icon }) => {
        const Icon = SHELL_ICONS[icon]
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
