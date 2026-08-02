import { cn } from '@/lib/utils'
import type { DayBucket } from '../../dashboard/weeklyProgressEngine'

function intensityClass(sessionsCount: number): string {
  if (sessionsCount === 0) return 'bg-muted'
  if (sessionsCount === 1) return 'bg-primary/30'
  if (sessionsCount === 2) return 'bg-primary/55'
  return 'bg-primary/80'
}

function buildTooltip(day: DayBucket): string {
  const improvement = day.growthPercent === null ? 'no comparison yet' : `${day.growthPercent > 0 ? '+' : ''}${day.growthPercent}% improvement`
  return `${day.dateKey} — ${day.sessionsCount} session${day.sessionsCount === 1 ? '' : 's'}, +${day.xp} XP, ${day.trainingMinutes}m, ${improvement}`
}

type TrainingCalendarHeatmapProps = {
  days: readonly DayBucket[]
}

// GitHub-contribution-style grid — 12 weeks of real daily activity, built
// in plain CSS grid (no calendar library installed anywhere in this
// codebase). Native title attribute provides the hover tooltip.
export function TrainingCalendarHeatmap({ days }: TrainingCalendarHeatmapProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Training Calendar™</p>
      <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2" style={{ gridTemplateColumns: `repeat(12, minmax(0, 1fr))` }}>
        {days.map((day) => (
          <div key={day.dateKey} title={buildTooltip(day)} className={cn('size-3.5 rounded-[3px]', intensityClass(day.sessionsCount))} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="size-3 rounded-[3px] bg-muted" />
        <span className="size-3 rounded-[3px] bg-primary/30" />
        <span className="size-3 rounded-[3px] bg-primary/55" />
        <span className="size-3 rounded-[3px] bg-primary/80" />
        <span>More</span>
      </div>
    </div>
  )
}
