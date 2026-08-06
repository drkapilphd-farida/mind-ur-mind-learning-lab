import type { Metadata } from 'next'
import { getLeaderboardRows } from '@/features/school-dashboard/queries/getLeaderboardRows'
import { LeaderboardTable } from '@/features/school-dashboard/components/LeaderboardTable'

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
