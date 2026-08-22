'use client'

import { Flame, CalendarCheck, Target } from 'lucide-react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type StreakConsistencyCardProps = {
  currentStreak: number
  totalSessions: number
  consistencyPercent: number
}

export function StreakConsistencyCard({
  currentStreak,
  totalSessions,
  consistencyPercent,
}: StreakConsistencyCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedStreak = useCountUp(currentStreak, 800, prefersReducedMotion)
  const animatedSessions = useCountUp(totalSessions, 800, prefersReducedMotion)
  const animatedConsistency = useCountUp(consistencyPercent, 800, prefersReducedMotion)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Consistency & Streak™</p>

      <div className="mt-4 flex items-center gap-4 rounded-xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent px-5 py-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
          <Flame className={cn('size-6', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/50')} aria-hidden="true" />
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{Math.round(animatedStreak)}</p>
          <p className="text-xs text-muted-foreground">Day{currentStreak !== 1 ? 's' : ''} active streak</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
          <CalendarCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-xl font-bold tabular-nums text-foreground">{Math.round(animatedSessions)}</p>
            <p className="text-[11px] text-muted-foreground">Sessions completed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
          <Target className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-xl font-bold tabular-nums text-foreground">{Math.round(animatedConsistency)}%</p>
            <p className="text-[11px] text-muted-foreground">Daily routine consistency</p>
          </div>
        </div>
      </div>
    </div>
  )
}
