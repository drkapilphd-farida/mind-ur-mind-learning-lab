'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from './GoogleIcon'

type GoogleSignInButtonProps = {
  // Same "where to land afterward" convention LoginForm/SignUpForm/
  // GatewayAuthModal already use — threaded through /auth/callback's own
  // `next` query param (see src/app/auth/callback/route.ts), which
  // already handles the OAuth code exchange generically for every auth
  // method (magic link, password reset, and now Google), no changes
  // needed there.
  next?: string | undefined
}

// One-Click Google Sign-In™ — signInWithOAuth must run client-side (it
// navigates the whole browser tab to Google's consent screen, not
// something a Server Action can do). Supabase's Google provider maps
// `picture`/`name` from Google's own profile into `avatar_url`/
// `full_name` on the new auth.users row, and the existing
// `handle_new_user` Postgres trigger (supabase/migrations) already
// creates the `profiles` row from those exact fields for any provider —
// so a first-time Google sign-in needs no extra explicit profile-init
// step here.
export function GoogleSignInButton({ next }: GoogleSignInButtonProps): React.JSX.Element {
  const [isPending, setIsPending] = useState(false)

  async function handleClick(): Promise<void> {
    setIsPending(true)
    const supabase = createClient()
    const redirectNext = next ?? '/dashboard'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectNext)}`,
      },
    })

    // A successful call navigates the tab away to Google immediately —
    // this only ever returns while still on this page when it failed
    // (e.g. the provider isn't configured yet), so there's no success
    // path to handle here.
    if (error) {
      toast.error(error.message)
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      loading={isPending}
      onClick={() => void handleClick()}
    >
      {!isPending && <GoogleIcon className="size-4" />}
      Continue with Google
    </Button>
  )
}
