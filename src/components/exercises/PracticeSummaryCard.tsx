import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

type PracticeSummaryCardProps = {
  currentStreak: number
  bestStreak: number
  totalCompletedSessions: number
  totalPracticeMinutes: number
  completionPercent: number
}

// Presentation only — every number is computed upstream from real
// exercise_progress/practice_sessions data (computeDailyStreak,
// computeTotalPracticeStats, getModuleProgress). No Lab-specific
// knowledge here, so any Lab's stats can drive the same card.
export function PracticeSummaryCard({
  currentStreak,
  bestStreak,
  totalCompletedSessions,
  totalPracticeMinutes,
  completionPercent,
}: PracticeSummaryCardProps): React.JSX.Element {
  const stats = [
    { value: currentStreak, label: 'Current streak' },
    { value: bestStreak, label: 'Best streak' },
    { value: totalCompletedSessions, label: 'Sessions' },
    { value: totalPracticeMinutes, label: 'Minutes' },
    { value: `${completionPercent}%`, label: 'Complete' },
  ]

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Flame
          aria-hidden="true"
          className={cn('size-3.5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')}
        />
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Practice summary</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-muted/40 px-4 py-3">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
