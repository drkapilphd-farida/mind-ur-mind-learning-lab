import { GraduationCap } from 'lucide-react'
import type { CurriculumDayCompletionRecord } from '@/features/thirty-day-curriculum/actions/getCurriculumDayCompletions'

const TOTAL_CURRICULUM_DAYS = 30

type CurriculumProgressCardProps = {
  completions: readonly CurriculumDayCompletionRecord[]
}

// Two-Pillar Simplification™ — real 30-Day Masterclass progress, sourced
// from curriculum_day_completions (see syncCurriculumDayCompletion.ts),
// not the student's own localStorage — the only way this can be visible
// server-side to a parent checking from a different device.
export function CurriculumProgressCard({ completions }: CurriculumProgressCardProps): React.JSX.Element {
  const daysCompleted = completions.length
  const consistencyPercent = Math.round((daysCompleted / TOTAL_CURRICULUM_DAYS) * 100)
  const highestDay = completions.reduce((max, completion) => Math.max(max, completion.day), 0)
  const currentDay = Math.min(highestDay + 1, TOTAL_CURRICULUM_DAYS)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Daily Curriculum Progress</p>

      {daysCompleted === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No 30-Day Masterclass days completed yet.</p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/[0.08]">
              <GraduationCap className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {daysCompleted}
                  <span className="text-sm font-medium text-muted-foreground"> / {TOTAL_CURRICULUM_DAYS}</span>
                </p>
                <p className="text-xs text-muted-foreground">Days completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{consistencyPercent}%</p>
                <p className="text-xs text-muted-foreground">Consistency</p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${consistencyPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Currently on Day {currentDay} of {TOTAL_CURRICULUM_DAYS}.</p>
        </>
      )}
    </div>
  )
}
