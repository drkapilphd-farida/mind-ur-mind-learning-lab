// Single source of truth for the leaderboard's scoring formula and rank
// tiers — shared by the master-admin leaderboard query and the portal's
// own rank-summary query, so the two never compute a different score for
// the same tenant. Active students matter more than AI usage (they're
// the real business-size signal; AI usage is an engagement signal on
// top of that), hence the 10:1 weighting.
export const LEADERBOARD_STUDENT_WEIGHT = 10
export const LEADERBOARD_AI_USAGE_WEIGHT = 1

export function computeLeaderboardScore(activeStudentCount: number, aiUsageThisMonth: number): number {
  return activeStudentCount * LEADERBOARD_STUDENT_WEIGHT + aiUsageThisMonth * LEADERBOARD_AI_USAGE_WEIGHT
}

export type LeaderboardRankTier = 'gold' | 'silver' | 'bronze' | null

export function deriveRankTier(rank: number): LeaderboardRankTier {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return null
}

export const RANK_TIER_LABELS: Record<NonNullable<LeaderboardRankTier>, string> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
}
