import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ParentDashboard } from '@/features/parent-dashboard/components/ParentDashboard'

export const metadata: Metadata = {
  title: 'Parents Dashboard',
}

// Parents Dashboard™ — the child/weekly-stats data is still mock (see
// src/features/parent-dashboard/mockData.ts: there is no parent account
// role or parent-child relationship table in this app yet — that's a
// separate, larger project). Auth itself, though, is real: this route
// is in middleware.ts's PROTECTED_PATHS (redirects a signed-out visitor
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

  return <ParentDashboard />
}
