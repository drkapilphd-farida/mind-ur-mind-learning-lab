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
    { value: totalCompletedSessions, label: 'Sessions completed' },
    { value: totalPracticeMinutes, label: 'Minutes practiced' },
    { value: `${completionPercent}%`, label: 'Module complete' },
  ]

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-1.5">
        <Flame
          aria-hidden="true"
          className={cn('size-3.5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')}
        />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Practice summary</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
