import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { computeDailyStreak, computeMissedDaysSinceLastPractice } from '@/lib/exercises/practiceHistory'
import { AppSidebar } from '@/components/AppSidebar'
import { Topbar } from '@/components/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profile, labSessions] = await Promise.all([
    getCurrentUserProfile(user.id),
    getPracticeSessions('quantum-speed-reading'),
  ])

  // Brand Logo Warmth™ — the persistent sidebar logo's streak-based tint
  // (see AppSidebar.tsx) needs a real missed-days figure on every
  // dashboard-group page, not just /dashboard — same streak data that
  // page already computes for itself, fetched here once for the shared
  // chrome instead of duplicating the query per-page.
  const labStreak = computeDailyStreak(labSessions)
  const missedDays = computeMissedDaysSinceLastPractice(labStreak)

  return (
    <div className="bg-muted/30 flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <AppSidebar missedDays={missedDays} />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          fullName={profile?.fullName ?? null}
          avatarUrl={profile?.avatarUrl ?? null}
          email={user.email ?? ''}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
