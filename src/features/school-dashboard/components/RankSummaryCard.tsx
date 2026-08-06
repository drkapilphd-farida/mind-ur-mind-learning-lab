import { Sparkles, Users } from 'lucide-react'
import { RankBadge } from './RankBadge'
import { TENANT_COPY } from '../tenantCopy'
import { SCHOOL_TIER_LABELS, type SchoolTier, type SchoolType } from '../types'
import type { TenantRankSummary } from '../queries/getTenantRank'

type RankSummaryCardProps = {
  rank: TenantRankSummary
  tier: SchoolTier
  type: SchoolType
}

const RANK_TIER_MESSAGES: Record<'gold' | 'silver' | 'bronze' | 'unranked', string> = {
  gold: "You're the #1 performer — keep it up to defend the top spot!",
  silver: "So close to the top. A few more active students could take you to #1.",
  bronze: "You're on the podium. Keep growing to climb even higher.",
  unranked: 'Grow active students and AI-powered lessons to climb the leaderboard.',
}

// The gamification widget for /school-admin and /partner-admin —
// motivational rank summary meant to drive renewals/engagement, not an
// analytics view. Deliberately doesn't show what any other tenant's
// score is (getTenantRank.ts never exposes that) — only "you're #N of
// M," which is enough to motivate without turning this into a
// competitor-scouting tool.
export function RankSummaryCard({ rank, tier, type }: RankSummaryCardProps): React.JSX.Element {
  const copy = TENANT_COPY[type]
  const message = RANK_TIER_MESSAGES[rank.rankTier ?? 'unranked']

  return (
    <div className="bg-gradient-to-br from-card to-muted/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{copy.rankLabel}</p>
          <div className="mt-2">
            <RankBadge rank={rank.rank} rankTier={rank.rankTier} className="text-sm" />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            of {rank.totalActiveTenants} active {copy.entityLabelLower}
            {rank.totalActiveTenants !== 1 ? 's' : ''} {type === 'school' ? 'nationally' : 'in the network'}
          </p>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs font-medium">
              <Users className="size-3.5" />
              Active Students
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{rank.studentCount}</p>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs font-medium">
              <Sparkles className="size-3.5" />
              AI Usage (mo.)
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{rank.aiUsageThisMonth}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-medium">{SCHOOL_TIER_LABELS[tier]}</span>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  )
}
