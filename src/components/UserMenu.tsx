'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'
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
}: UserMenuProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSignOut(): void {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          disabled={isPending}
          aria-label="Open user menu"
        >
          <Avatar>
            {avatarUrl !== null && (
              <AvatarImage src={avatarUrl} alt={fullName ?? email} />
            )}
            <AvatarFallback>{getInitials(fullName, email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-foreground">
            {fullName ?? 'Account'}
          </p>
          <p className="text-muted-foreground truncate text-xs">{email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={isPending}
        >
          <LogOut className="size-4" />
          {isPending ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
