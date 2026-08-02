'use client'

import Link from 'next/link'
import { Sparkles, Flame, ArrowRight, Lock } from 'lucide-react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { JOURNEY_MILESTONE_STREAKS } from '@/features/quantum-journey/streakMotivation'

const ANALYTICS_HREF = '/labs/quantum-speed-reading/journey/analytics'

type DailyQuantumSessionCardProps = {
  hasAnySession: boolean
  currentStreak: number
  lifetimeXp: number
  personalBestWpm: number | null
  // Whether a 30-Second Baseline Diagnostic exists at all — gates showing
  // the link to the full Analytics Dashboard™ (WPM chart, streak/
  // consistency, Mind Score breakdown), which is where baseline vs.
  // current figures now live in full rather than duplicated here.
  hasBaseline: boolean
  // Journey Milestones™ — the longest consecutive-day run ever achieved
  // (computeLongestStreakEver), not the current streak — a milestone
  // earned once stays true forever even after a later gap resets
  // currentStreak, matching every other "real achievement" in this app.
  longestStreakEver: number
}

function JourneyMilestonesBadges({ longestStreakEver }: { longestStreakEver: number }): React.JSX.Element {
  return (
    <div className="mt-5 flex flex-wrap gap-2" role="list" aria-label="Journey streak milestones">
      {JOURNEY_MILESTONE_STREAKS.map((milestone) => {
        const isReached = longestStreakEver >= milestone
        return (
          <div
            key={milestone}
            role="listitem"
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
              isReached ? 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'border-border/60 text-muted-foreground/50',
            )}
          >
            {isReached ? <Flame className="size-3" aria-hidden="true" /> : <Lock className="size-3" aria-hidden="true" />}
            {milestone}-Day
          </div>
        )
      })}
    </div>
  )
}

// Daily Quantum Session™ — a distinct progress source from the Eye
// Foundation Module cards above it (Daily Momentum™, Achievements™,
// etc., all scoped to the quantum-speed-reading lab's own
// practice_sessions). This card reads from the separate
// daily_quantum_sessions table instead, so it's deliberately its own
// card rather than being blended into an existing streak number that
// means something narrower.
export function DailyQuantumSessionCard({
  hasAnySession,
  currentStreak,
  lifetimeXp,
  personalBestWpm,
  hasBaseline,
  longestStreakEver,
}: DailyQuantumSessionCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedStreak = useCountUp(currentStreak, 700, prefersReducedMotion)
  const animatedXp = useCountUp(lifetimeXp, 700, prefersReducedMotion)

  if (!hasAnySession) {
    return (
      <div className="dashboard-glass-card dashboard-glass-lift p-6">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Daily Quantum Session™</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Complete your first Daily Quantum Session to start tracking your streak and XP here.
        </p>
        {hasBaseline && (
          <Link href={ANALYTICS_HREF} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View Full Analytics
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="dashboard-glass-card dashboard-glass-lift p-6">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Daily Quantum Session™</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{Math.round(animatedStreak)}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className={cn('size-3', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')} aria-hidden="true" />
            Day{currentStreak !== 1 ? 's' : ''} streak
          </p>
        </div>
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{Math.round(animatedXp)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Lifetime XP</p>
        </div>
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{personalBestWpm ?? '—'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Best WPM</p>
        </div>
      </div>

      <JourneyMilestonesBadges longestStreakEver={longestStreakEver} />

      {hasBaseline && (
        <Link
          href={ANALYTICS_HREF}
          className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          View Full Analytics Dashboard
          <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
