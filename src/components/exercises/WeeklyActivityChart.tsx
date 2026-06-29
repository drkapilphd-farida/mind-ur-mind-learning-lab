'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { formatDurationLabel, type DayActivity } from '@/lib/exercises/practiceHistory'

type WeeklyActivityChartProps = {
  days: DayActivity[]
}

const MAX_BAR_HEIGHT_PX = 64
const MIN_BAR_HEIGHT_PX = 4

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
    <div className="bg-card rounded-xl border p-5">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">This week</p>
      <div
        role="img"
        aria-label={`This week's practice activity. ${buildWeekSummaryLabel(days)}`}
        className="mt-4 flex items-end justify-between gap-2"
      >
        {days.map((day) => {
          const hasActivity = day.sessionCount > 0
          const heightPx = hasActivity
            ? Math.max(MIN_BAR_HEIGHT_PX, Math.round((day.durationMs / maxDuration) * MAX_BAR_HEIGHT_PX))
            : MIN_BAR_HEIGHT_PX

          return (
            <div key={day.dateKey} aria-hidden="true" className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-full max-w-6 rounded-full',
                  hasActivity ? 'bg-primary' : 'bg-muted',
                  !prefersReducedMotion && 'transition-[height] duration-500 ease-out',
                )}
                style={{ height: `${heightPx}px` }}
              />
              <span className="text-xs text-muted-foreground">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
