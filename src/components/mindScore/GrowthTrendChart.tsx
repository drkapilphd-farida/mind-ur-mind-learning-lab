'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { formatDurationLabel, type DayActivity } from '@/lib/exercises/practiceHistory'
import type { WpmGrowth } from '@/lib/exercises/mindScore'

type GrowthTrendChartProps = {
  days: DayActivity[]
  personalBestMs: number
  weeklyTrend: number | null
  totalSessions: number
  wpmGrowth: WpmGrowth | null
}

const MAX_HEIGHT = 80
const MIN_HEIGHT = 3

function buildAriaLabel(days: DayActivity[], trend: number | null): string {
  const active = days.filter((d) => d.sessionCount > 0)
  const trendText = trend === null ? '' : ` Practice is ${trend >= 0 ? 'up' : 'down'} ${Math.abs(trend)}% versus last period.`
  return `Weekly activity: ${active.length} of 7 days active.${trendText}`
}

export function GrowthTrendChart({
  days,
  personalBestMs,
  weeklyTrend,
  totalSessions,
  wpmGrowth,
}: GrowthTrendChartProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const maxDuration = Math.max(...days.map((d) => d.durationMs), 1)
  const hasTrend = weeklyTrend !== null

  return (
    <div className="glass-premium-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Growth Trend™
          </p>
          {hasTrend && (
            <p className={cn(
              'mt-1 text-sm font-medium',
              weeklyTrend! >= 0 ? 'text-success' : 'text-destructive',
            )}>
              {weeklyTrend! >= 0 ? '↑' : '↓'} {Math.abs(weeklyTrend!)}% vs prior period
            </p>
          )}
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">{totalSessions}</p>
            <p className="text-[10px] text-muted-foreground">Total sessions</p>
          </div>
          {personalBestMs > 0 && (
            <div>
              <p className="text-lg font-bold tabular-nums text-foreground">{formatDurationLabel(personalBestMs)}</p>
              <p className="text-[10px] text-muted-foreground">Personal best</p>
            </div>
          )}
        </div>
      </div>

      {/* Baseline → Current WPM — the exact real transformation, only
          shown once there's enough session history to honestly split
          into a baseline and a recent window (see computeWpmGrowth). */}
      {wpmGrowth && (
        <div className="mt-5 flex items-center justify-center gap-4 rounded-2xl border border-border/50 bg-foreground/[0.02] px-4 py-4 sm:gap-6">
          <div className="text-center">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Baseline</p>
            <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-foreground/70">{wpmGrowth.baselineWpm}</p>
            <p className="text-[10px] text-muted-foreground">WPM</p>
          </div>
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <span aria-hidden="true" className="text-lg">→</span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                wpmGrowth.growthPercent >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {wpmGrowth.growthPercent >= 0 ? '+' : ''}
              {wpmGrowth.growthPercent}%
            </span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Current</p>
            <p className="mt-0.5 text-3xl font-extrabold tabular-nums text-primary">{wpmGrowth.currentWpm}</p>
            <p className="text-[10px] text-muted-foreground">WPM</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div
        className="mt-6 border-t border-border/40 pt-4"
        role="img"
        aria-label={buildAriaLabel(days, weeklyTrend)}
      >
        <div className="flex items-end justify-between gap-1.5" aria-hidden="true">
          {days.map((day) => {
            const hasActivity = day.sessionCount > 0
            const heightPx = hasActivity
              ? Math.max(MIN_HEIGHT, Math.round((day.durationMs / maxDuration) * MAX_HEIGHT))
              : MIN_HEIGHT
            const isPersonalBest = hasActivity && day.durationMs === personalBestMs && personalBestMs > 0

            return (
              <div key={day.dateKey} className="flex flex-1 flex-col items-center gap-2">
                {isPersonalBest && (
                  <span className="text-[9px] font-semibold text-success">Best</span>
                )}
                <div
                  className={cn(
                    'w-full max-w-8 rounded-full',
                    hasActivity ? 'bg-primary' : 'bg-foreground/[0.05]',
                    !prefersReducedMotion && 'transition-[height] duration-500 ease-out',
                  )}
                  style={{ height: `${heightPx}px` }}
                  title={hasActivity ? `${day.label}: ${day.sessionCount} session${day.sessionCount !== 1 ? 's' : ''}, ${formatDurationLabel(day.durationMs)}` : `${day.label}: no activity`}
                />
                <span className={cn(
                  'text-[10px]',
                  hasActivity ? 'font-medium text-foreground/60' : 'text-muted-foreground',
                )}>
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
