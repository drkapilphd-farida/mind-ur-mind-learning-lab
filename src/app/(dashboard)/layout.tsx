import { redirect } from 'next/navigation'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { computeDailyStreak, computeStreakWarmthIntensity, computeTodaysProgress } from '@/lib/exercises/practiceHistory'
import { getTenantBrandingForUser } from '@/features/school-dashboard/queries/getTenantBrandingForUser'
import { AppSidebar } from '@/components/AppSidebar'
import { Topbar } from '@/components/Topbar'

// Design Tokens™ — Plus Jakarta Sans (primary) with Inter (fallback),
// scoped to the dashboard route group only via CSS variables, not a
// global font swap. `.glass-premium`'s own CSS (globals.css) reads these
// vars — the same "scoped exception" convention already established for
// its color tokens, so every other route keeps the app's default Geist
// font untouched.
const plusJakartaSans = Plus_Jakarta_Sans({ variable: '--font-plus-jakarta', subsets: ['latin'] })
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

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

  const [profile, labSessions, tenantBranding] = await Promise.all([
    getCurrentUserProfile(user.id),
    getPracticeSessions('quantum-speed-reading'),
    getTenantBrandingForUser(user.id),
  ])

  // Brand Logo Warmth™ — the header logo's streak-based tint needs a real
  // intensity figure on every dashboard-group page, not just /dashboard —
  // same streak data that page already computes for itself, fetched here
  // once for the shared chrome instead of duplicating the query per-page.
  // Computed once and passed to BOTH AppSidebar (desktop) and Topbar
  // (mobile) — Topbar used to render with no missedDays prop at all, so
  // the warmth effect was inert for every mobile user regardless of
  // actual streak state.
  const labStreak = computeDailyStreak(labSessions)
  const todaysProgress = computeTodaysProgress(labSessions)
  const warmthIntensity = computeStreakWarmthIntensity(labStreak, todaysProgress)

  return (
    <div className={`bg-muted/30 flex h-screen overflow-hidden ${plusJakartaSans.variable} ${inter.variable}`}>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <AppSidebar warmthIntensity={warmthIntensity} brandName={tenantBranding?.name ?? null} brandLogoUrl={tenantBranding?.logoUrl ?? null} />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          fullName={profile?.fullName ?? null}
          avatarUrl={profile?.avatarUrl ?? null}
          email={user.email ?? ''}
          warmthIntensity={warmthIntensity}
          brandName={tenantBranding?.name ?? null}
          brandLogoUrl={tenantBranding?.logoUrl ?? null}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
