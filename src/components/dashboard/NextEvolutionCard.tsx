import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NextEvolutionCardProps = {
  currentMindScore: number
  nextMindScoreGoal: number
  completedCount: number
  totalCount: number
  nextExerciseHref: string | null
  nextExerciseTitle: string | null
}

// Returns the next meaningful evolution in the student's journey:
// if still in the Eye Foundation Module, the evolution is completing it;
// if the module is complete, the evolution is unlocking the next Lab.
function describeEvolution(
  completedCount: number,
  totalCount: number,
): {
  title: string
  detail: string
  isUnlockable: boolean
  unlockScore: number | null
} {
  const readingComplete = completedCount >= totalCount && totalCount > 0

  if (!readingComplete) {
    return {
      title: `Complete Eye Foundation Module`,
      detail: `${totalCount - completedCount} exercise${totalCount - completedCount !== 1 ? 's' : ''} remaining — each one raises your Reading Intelligence`,
      isUnlockable: true,
      unlockScore: null,
    }
  }

  return {
    title: 'Memory Intelligence Lab™',
    detail: `Your next evolution — builds on the reading foundation you have built`,
    isUnlockable: false,
    unlockScore: 500,
  }
}

export function NextEvolutionCard({
  currentMindScore,
  nextMindScoreGoal,
  completedCount,
  totalCount,
  nextExerciseHref,
  nextExerciseTitle,
}: NextEvolutionCardProps): React.JSX.Element {
  const evolution = describeEvolution(completedCount, totalCount)
  const scoreProgress = Math.min(100, Math.round((currentMindScore / nextMindScoreGoal) * 100))

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Next Evolution™
      </p>

      <div className="mt-4 flex items-start gap-4">
        {/* Lock / unlock indicator */}
        <div className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          evolution.isUnlockable ? 'bg-foreground/[0.05]' : 'bg-muted',
        )}>
          {evolution.isUnlockable ? (
            <ArrowRight className="size-4 text-foreground" aria-hidden="true" />
          ) : (
            <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{evolution.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{evolution.detail}</p>

          {/* Progress toward next Mind Score goal */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Mind Score {currentMindScore}</span>
              <span>Goal: {nextMindScoreGoal}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <div
                className="h-1 rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${scoreProgress}%` }}
                role="progressbar"
                aria-valuenow={currentMindScore}
                aria-valuemin={0}
                aria-valuemax={nextMindScoreGoal}
                aria-label="Progress to next Mind Score goal"
              />
            </div>
          </div>

          {/* CTA */}
          {evolution.isUnlockable && nextExerciseHref !== null && nextExerciseTitle !== null && (
            <Button asChild size="sm" className="mt-4 gap-1.5 rounded-full" variant="outline">
              <Link href={nextExerciseHref}>
                Continue Evolution
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
          {!evolution.isUnlockable && evolution.unlockScore !== null && (
            <p className="mt-3 text-xs text-muted-foreground/70">
              Unlocks at Mind Score {evolution.unlockScore} — coming soon
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
