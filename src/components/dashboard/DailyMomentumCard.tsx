'use client'

import { Flame } from 'lucide-react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type DailyMomentumCardProps = {
  currentStreak: number
  bestStreak: number
  lastPracticedLabel: string | null
}

function MeterBar({ value, label, className }: { value: number; label: string; className?: string }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animated = useCountUp(value, 800, prefersReducedMotion)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground">{Math.round(animated)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--glass-inset)' }}>
        <div
          className={cn(
            'brand-gradient h-1.5 rounded-full',
            !prefersReducedMotion && 'transition-[width] duration-700 ease-out',
            className,
          )}
          style={{ width: `${Math.round(animated)}%`, boxShadow: '0 0 12px 1px var(--ambient-b)' }}
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

export function DailyMomentumCard({
  currentStreak,
  bestStreak,
  lastPracticedLabel,
}: DailyMomentumCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedStreak = useCountUp(currentStreak, 700, prefersReducedMotion)
  const momentumPercent = bestStreak > 0 ? Math.round((currentStreak / Math.max(bestStreak, 7)) * 100) : 0

  return (
    <div className="glass-premium-card glass-premium-lift p-5 sm:p-6">
      <div className="flex items-center gap-1.5">
        <Flame
          className={cn('size-3.5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')}
          aria-hidden="true"
        />
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Daily Momentum™</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        {/* Streak counter */}
        <div className="col-span-1">
          <p className="text-4xl font-bold tabular-nums tracking-tight text-foreground" aria-label={`${currentStreak} day streak`}>
            {Math.round(animatedStreak)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Day{currentStreak !== 1 ? 's' : ''} streak
          </p>
          {lastPracticedLabel !== null && (
            <p className="mt-1 text-[10px] text-muted-foreground/60">Last: {lastPracticedLabel}</p>
          )}
        </div>

        {/* Meter — Consistency bar removed for a cleaner, Duolingo-style
            focus on the one number that matters most: momentum. */}
        <div className="col-span-2 flex flex-col justify-center">
          <MeterBar value={momentumPercent} label="Momentum" />
        </div>
      </div>

      {bestStreak > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Personal best: <span className="font-medium text-foreground">{bestStreak} day{bestStreak !== 1 ? 's' : ''}</span>
          {currentStreak >= bestStreak && currentStreak > 0 && (
            <span className="ml-2 text-success font-medium">New record</span>
          )}
        </p>
      )}
    </div>
  )
}
