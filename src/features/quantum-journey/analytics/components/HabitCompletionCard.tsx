'use client'

import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { TOTAL_JOURNEY_DAYS } from '../../quantumJourneyLevels'

type HabitCompletionCardProps = {
  sessionsCompleted: number
  completionPercent: number
}

// Habit App Isolation™ — replaces what used to be here, a WPM Progress
// chart (a QSR-specific reading-speed figure that has no place in a pure
// habit-building app — see analyticsMath.ts's computeHabitCompletionPercent
// for the same reasoning). "Habit Completion Rate" is honest and simple:
// real sessions completed against the journey's own fixed real length,
// nothing else — never a speed or comprehension figure.
export function HabitCompletionCard({ sessionsCompleted, completionPercent }: HabitCompletionCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedPercent = useCountUp(completionPercent, 900, prefersReducedMotion)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Habit Completion Rate™</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {sessionsCompleted} of {TOTAL_JOURNEY_DAYS} days complete
      </p>

      <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight text-foreground">{Math.round(animatedPercent)}%</p>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]"
        role="progressbar"
        aria-valuenow={completionPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Habit completion rate"
      >
        <div
          className={cn('h-full rounded-full bg-primary', !prefersReducedMotion && 'transition-[width] duration-700 ease-out')}
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  )
}
