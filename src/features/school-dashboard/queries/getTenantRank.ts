import { getLeaderboardRows } from './getLeaderboardRows'
import type { LeaderboardRankTier } from '../leaderboard'
import type { SchoolType } from '../types'

export type TenantRankSummary = {
  rank: number
  totalActiveTenants: number
  score: number
  studentCount: number
  aiUsageThisMonth: number
  rankTier: LeaderboardRankTier
}

// Portal-facing (school-admin / partner-admin) — computes the FULL
// type-scoped leaderboard server-side via the service-role client, then
// narrows the result down to only the calling tenant's own summary
// before returning. This function must only ever be called from a
// Server Component/Action for the signed-in tenant's own school.id —
// it never exposes other tenants' rows, names, or scores to the caller,
// even though it internally reads across the whole tenant type.
//
// Returns null for a tenant that isn't in the ranked set at all (i.e.
// not 'active' status — a suspended/archived tenant has no standing to
// show), so the portal can simply hide the rank card rather than
// rendering a broken/zeroed-out one.
export async function getTenantRank(schoolId: string, type: SchoolType): Promise<TenantRankSummary | null> {
  const rows = await getLeaderboardRows(type)
  const own = rows.find((row) => row.schoolId === schoolId)

  if (own === undefined) {
    return null
  }

  return {
    rank: own.rank,
    totalActiveTenants: rows.length,
    score: own.score,
    studentCount: own.studentCount,
    aiUsageThisMonth: own.aiUsageThisMonth,
    rankTier: own.rankTier,
  }
}
