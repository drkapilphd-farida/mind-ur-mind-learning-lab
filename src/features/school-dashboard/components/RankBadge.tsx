import { Award, Hash, Medal, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RANK_TIER_LABELS, type LeaderboardRankTier } from '../leaderboard'

type RankBadgeProps = {
  rank: number
  rankTier: LeaderboardRankTier
  className?: string
}

// Shared by the master-admin leaderboard table and the portal's rank
// summary card, so "what Gold/Silver/Bronze look like" only has one
// definition. Colour comes entirely from existing tokens (warning/
// muted/secondary — no raw hex per DESIGN_SYSTEM.md); the icon is what
// actually carries the gold/silver/bronze meaning, colour is secondary
// reinforcement. In the portal's .school-corporate theme these tokens
// read warm and gold-adjacent (cream secondary, amber warning); in the
// neutral admin theme they read as tasteful neutrals — the same
// component, no per-surface branching needed.
const RANK_TIER_STYLES: Record<NonNullable<LeaderboardRankTier>, { icon: typeof Trophy; className: string }> = {
  gold: { icon: Trophy, className: 'bg-warning/10 text-warning' },
  silver: { icon: Medal, className: 'bg-muted text-foreground' },
  bronze: { icon: Award, className: 'bg-secondary text-secondary-foreground' },
}

export function RankBadge({ rank, rankTier, className }: RankBadgeProps): React.JSX.Element {
  if (rankTier === null) {
    return (
      <span className={cn('bg-muted/50 text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums', className)}>
        <Hash className="size-3.5" />#{rank}
      </span>
    )
  }

  const { icon: Icon, className: tierClassName } = RANK_TIER_STYLES[rankTier]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', tierClassName, className)}>
      <Icon className="size-3.5" />
      {RANK_TIER_LABELS[rankTier]} · #{rank}
    </span>
  )
}
