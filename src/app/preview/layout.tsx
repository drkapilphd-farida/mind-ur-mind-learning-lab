import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { AppShell } from '@/components/shell/AppShell'
import { PREVIEW_NAV_ITEMS } from './navConfig'

// AI Learning Studio™'s shell — same protected-layout pattern as
// `(dashboard)/layout.tsx` (auth check → redirect → fetch profile →
// render shell), reusing the existing Supabase auth end to end rather
// than standing up a parallel one. `/preview` is registered in
// `PROTECTED_PATHS` (src/middleware.ts); an unauthenticated visit
// redirects to the existing `/login?next=...`, which already honors
// arbitrary `next` targets (see `signIn.ts`) — no auth changes needed.
export default async function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/preview/dashboard')

  const profile = await getCurrentUserProfile(user.id)

  return (
    <AppShell
      brandLabel="Mind Ur Mind Learning Lab™"
      brandHref="/preview/dashboard"
      navItems={PREVIEW_NAV_ITEMS}
      fullName={profile?.fullName ?? null}
      avatarUrl={profile?.avatarUrl ?? null}
      email={user.email ?? ''}
    >
      {children}
    </AppShell>
  )
}
