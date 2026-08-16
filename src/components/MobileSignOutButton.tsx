'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { signOut } from '@/features/auth/actions/signOut'

// Reachable Sign Out™ — shared by every mobile nav drawer in the app
// (Topbar.tsx's main drawer, LabNavHeader.tsx's Reading Intelligence Lab
// drawer) so Sign Out is never a click away from wherever a mobile user
// actually is, rather than only reachable from the small avatar dropdown
// (UserMenu.tsx) in whichever header happens to render one. All three
// stay wired to the exact same signOut() server action.
export function MobileSignOutButton(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  function handleSignOut(): void {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-60"
    >
      <LogOut className="size-4 shrink-0" aria-hidden="true" />
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
