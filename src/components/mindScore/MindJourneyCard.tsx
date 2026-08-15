'use client'

import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { JourneyStatusMeta } from '@/lib/exercises/mindScore'

type MindJourneyCardProps = JourneyStatusMeta & {
  currentStreak: number
  bestStreak: number
  totalSessions: number
  completedCount: number
  totalCount: number
}

const STATUS_COLORS: Record<string, string> = {
  Beginning: 'text-muted-foreground',
  Growing: 'text-foreground',
  Accelerating: 'text-success',
  Stable: 'text-foreground',
  Recovering: 'text-warning',
}

function MeterBar({ value, label }: { value: number; label: string }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animated = useCountUp(value, 800, prefersReducedMotion)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-foreground">{Math.round(animated)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className={cn('h-1.5 rounded-full bg-primary', !prefersReducedMotion && 'transition-[width] duration-700 ease-out')}
          style={{ width: `${Math.round(animated)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(animated)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  )
}

export function MindJourneyCard({
  label,
  description,
  momentumPercent,
  consistencyPercent,
  currentStreak,
  bestStreak,
  totalSessions,
  completedCount,
  totalCount,
}: MindJourneyCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedStreak = useCountUp(currentStreak, 700, prefersReducedMotion)
  const animatedSessions = useCountUp(totalSessions, 700, prefersReducedMotion)

  return (
    <div className="glass-premium-card p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Mind Journey™
      </p>

      {/* Status */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className={cn('text-3xl font-bold tracking-tight', STATUS_COLORS[label])}>
          {label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(animatedStreak)}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Day streak</p>
          {bestStreak > 0 && (
            <p className="text-[9px] text-muted-foreground/60">Best: {bestStreak}</p>
          )}
        </div>
        <div className="rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{Math.round(animatedSessions)}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Sessions</p>
        </div>
        <div className="rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {completedCount}
            <span className="text-sm font-normal text-muted-foreground">/{totalCount}</span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Exercises</p>
        </div>
      </div>

      {/* Meters */}
      <div className="mt-5 space-y-3">
        <MeterBar value={momentumPercent} label="Momentum" />
        <MeterBar value={consistencyPercent} label="Consistency" />
      </div>
    </div>
  )
}
