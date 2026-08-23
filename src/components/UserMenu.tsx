'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, CreditCard, LifeBuoy, LogOut, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/features/auth/actions/signOut'

type UserMenuProps = {
  fullName: string | null
  avatarUrl: string | null
  email: string
  // Global Account Dropdown™ — 'compact' is the original icon-only
  // trigger (Topbar, mobile-only now that desktop has the sidebar-bottom
  // row). 'row' is the fuller avatar + name + chevron trigger used at
  // the bottom of AppSidebar; it opens upward (`side="top"`) since the
  // sidebar has no room below it.
  variant?: 'compact' | 'row'
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0] ?? '')
      .join('')
      .toUpperCase()
  }
  return email[0]?.toUpperCase() ?? '?'
}

export function UserMenu({
  fullName,
  avatarUrl,
  email,
  variant = 'compact',
}: UserMenuProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSignOut(): void {
    startTransition(async () => {
      await signOut()
    })
  }

  const avatar = (
    <Avatar>
      {avatarUrl !== null && <AvatarImage src={avatarUrl} alt={fullName ?? email} />}
      <AvatarFallback>{getInitials(fullName, email)}</AvatarFallback>
    </Avatar>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'row' ? (
          <Button
            variant="ghost"
            disabled={isPending}
            aria-label="Open account menu"
            className="h-auto w-full justify-start gap-2.5 rounded-lg px-2.5 py-2"
          >
            {avatar}
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-foreground">{fullName ?? 'Account'}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" disabled={isPending} aria-label="Open account menu">
            {avatar}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side={variant === 'row' ? 'top' : 'bottom'} className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-foreground">{fullName ?? 'Account'}</p>
          <p className="text-muted-foreground truncate text-xs">{email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="size-4" />
          Profile & Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/preview/subscription')}>
          <CreditCard className="size-4" />
          Subscription
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/preview/support')}>
          <LifeBuoy className="size-4" />
          Support
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={handleSignOut} disabled={isPending}>
          <LogOut className="size-4" />
          {isPending ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
