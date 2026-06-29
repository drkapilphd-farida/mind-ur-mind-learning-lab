'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, Eye, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'My Courses', icon: BookOpen },
  { href: '/labs/quantum-speed-reading', label: 'Quantum Speed Reading', icon: Eye },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

type NavLinksProps = {
  onSelect?: (() => void) | undefined
}

export function NavLinks({ onSelect }: NavLinksProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            {...(onSelect !== undefined ? { onClick: onSelect } : {})}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
