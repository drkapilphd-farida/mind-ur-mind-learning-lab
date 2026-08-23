import { formatRelativeDate } from '@/lib/formatRelativeDate'
import type { CurriculumDayCompletionRecord } from '@/features/thirty-day-curriculum/actions/getCurriculumDayCompletions'

type CurriculumSessionHistoryCardProps = {
  completions: readonly CurriculumDayCompletionRecord[]
}

const HISTORY_LIMIT = 10

// Two-Pillar Simplification™ — the real, per-day record behind "Daily
// Curriculum Progress" above: which days actually happened, when, and
// (for checkpoint days 1/7/14/21/30) the real measured WPM/comprehension.
// Regular days have no per-day WPM/comprehension measurement — the
// 30-Day Masterclass only assesses on checkpoint days — so those rows
// show completion only, never a fabricated number.
export function CurriculumSessionHistoryCard({ completions }: CurriculumSessionHistoryCardProps): React.JSX.Element {
  const recent = [...completions].sort((a, b) => b.day - a.day).slice(0, HISTORY_LIMIT)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Session History</p>

      {recent.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No completed sessions yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {recent.map((completion) => (
            <li key={completion.day} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Day {completion.day}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(completion.completedAt)}</p>
              </div>
              {completion.trueWpm !== null && completion.comprehensionAccuracyPercent !== null ? (
                <p className="shrink-0 text-right text-xs font-medium text-foreground">
                  {completion.trueWpm} WPM · {completion.comprehensionAccuracyPercent}% comprehension
                </p>
              ) : (
                <p className="shrink-0 text-xs text-muted-foreground">Completed</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
