import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ParentDashboard } from '@/features/parent-dashboard/components/ParentDashboard'

export const metadata: Metadata = {
  title: 'Parents Dashboard',
}

// Parents Dashboard™ — wired to the signed-in account's own real
// activity now (see ParentDashboard.tsx's own comment for why there's
// no per-child selection: no parent↔child relationship table exists in
// this schema yet). Auth itself was already real: this route is in
// middleware.ts's PROTECTED_PATHS (redirects a signed-out visitor
// before this page ever renders), and this explicit getUser() check is
// the same defense-in-depth backstop every other authenticated page in
// this app already has (see (dashboard)/layout.tsx and
// (auth)/update-password/page.tsx for the identical pattern) — so this
// page is never reachable signed out, independent of middleware.
export default async function ParentDashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/parent-dashboard')

  return <ParentDashboard userId={user.id} />
}
