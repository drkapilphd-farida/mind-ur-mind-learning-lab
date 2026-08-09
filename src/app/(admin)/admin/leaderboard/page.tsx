import type { Metadata } from 'next'
import { getLeaderboardRows } from '@/features/school-dashboard/queries/getLeaderboardRows'
import { LeaderboardTable } from '@/features/school-dashboard/components/LeaderboardTable'

// Load-bearing, unlike most `force-dynamic` additions in this app: the
// parent (admin)/layout.tsx already reads cookies() (auto-opting the
// route into dynamic rendering), but getLeaderboardRows() calls
// createServiceClient() directly — it never touches cookies()/headers(),
// so it gives Next.js no dynamic-API signal of its own. During `next
// build`'s static-generation attempt, this page's data fetch can start
// executing before the layout's own dynamic bailout is caught, hitting
// createServiceClient()'s missing-service-role-key throw in an
// environment where that build-time env var isn't set. Forcing dynamic
// here skips the static-generation attempt for this route entirely, so
// the page only ever runs per-request (where the real env is present).
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = { title: 'Leaderboard — Admin' }

export default async function AdminLeaderboardPage(): Promise<React.JSX.Element> {
  const [schoolRows, partnerRows] = await Promise.all([getLeaderboardRows('school'), getLeaderboardRows('franchise_partner')])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Top-performing schools and franchise partners, ranked by active students and AI usage this month.
        </p>
      </div>

      <LeaderboardTable schoolRows={schoolRows} partnerRows={partnerRows} />
    </div>
  )
}
