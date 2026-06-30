'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { formatDurationLabel, type DayActivity } from '@/lib/exercises/practiceHistory'

type WeeklyActivityChartProps = {
  days: DayActivity[]
}

const MAX_BAR_HEIGHT_PX = 72
const MIN_BAR_HEIGHT_PX = 3

function buildWeekSummaryLabel(days: DayActivity[]): string {
  return days
    .map((day) =>
      day.sessionCount > 0
        ? `${day.label}: ${day.sessionCount} session${day.sessionCount !== 1 ? 's' : ''}, ${formatDurationLabel(day.durationMs)}`
        : `${day.label}: no activity`,
    )
    .join('. ')
}

export function WeeklyActivityChart({ days }: WeeklyActivityChartProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const maxDuration = Math.max(...days.map((day) => day.durationMs), 1)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">This week</p>

      {/* Baseline */}
      <div className="mt-5 border-t border-border/40 pt-4">
        <div
          role="img"
          aria-label={`This week's practice activity. ${buildWeekSummaryLabel(days)}`}
          className="flex items-end justify-between gap-2"
        >
          {days.map((day) => {
            const hasActivity = day.sessionCount > 0
            const heightPx = hasActivity
              ? Math.max(MIN_BAR_HEIGHT_PX, Math.round((day.durationMs / maxDuration) * MAX_BAR_HEIGHT_PX))
              : MIN_BAR_HEIGHT_PX

            return (
              <div key={day.dateKey} aria-hidden="true" className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-full max-w-8 rounded-full transition-[height]',
                    hasActivity ? 'bg-primary' : 'bg-foreground/[0.06]',
                    !prefersReducedMotion && 'duration-500 ease-out',
                  )}
                  style={{ height: `${heightPx}px` }}
                />
                <span className={cn('text-xs', hasActivity ? 'text-foreground/60' : 'text-muted-foreground')}>
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
