import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GoalProgressBar } from '../adaptive-intelligence/GoalProgressBar'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'
import type { GoalDefinition } from '../../adaptive-intelligence/readingIntelligenceTypes'

type TodaysGoalCardProps = {
  goal: GoalDefinition | null
  goalProgressPercent: number
  continueHref: string
}

// Sprint-6, Part 2 — "Today's Goal" + "Continue Reading" for the final
// Reading Intelligence Dashboard™. Reuses the existing GoalProgressBar and
// getReadingGoal/computeGoalProgress (called by the page, passed in here)
// — no new goal logic, purely a new arrangement of real, existing data.
export function TodaysGoalCard({ goal, goalProgressPercent, continueHref }: TodaysGoalCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className={LAB_STAT_LABEL_CLASS}>Today&apos;s Goal</p>
      {goal ? (
        <div className="mt-3">
          <p className="text-base font-semibold text-foreground">{goal.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
          <div className="mt-4">
            <GoalProgressBar label="Progress" percent={goalProgressPercent} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Choose a reading goal to see it here — it shapes your coaching and recommendations.
        </p>
      )}
      <Button asChild size="lg" className="mt-5 w-full rounded-full">
        <Link href={continueHref}>Continue Reading</Link>
      </Button>
    </div>
  )
}
