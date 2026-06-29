import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ContinueLearningCard } from '@/components/exercises/ContinueLearningCard'
import { getModuleProgress, type ExerciseAvailability } from '@/lib/exercises/queries/getModuleProgress'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Quantum Speed Reading Lab™',
  description: 'The Eye Foundation Module — six calm, guided exercises that build the visual habits real reading speed is built on.',
}

const EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)

const AVAILABILITY_LABEL: Record<ExerciseAvailability, string> = {
  completed: 'Completed',
  current: 'You are here',
  locked: 'Locked',
}

const AVAILABILITY_BADGE_VARIANT: Record<ExerciseAvailability, 'outline' | 'secondary' | 'default'> = {
  completed: 'default',
  current: 'secondary',
  locked: 'outline',
}

export default async function QuantumSpeedReadingLabPage(): Promise<React.JSX.Element> {
  const progress = await getModuleProgress('quantum-speed-reading', EXERCISE_IDS)
  const summary = getContinueLearningSummary(progress, EYE_FOUNDATION_MODULE)

  const resumeExercise =
    progress.resumeExerciseId !== null && progress.resumeExerciseId !== progress.nextRecommendedExerciseId
      ? EYE_FOUNDATION_MODULE.find((exercise) => exercise.exerciseId === progress.resumeExerciseId)
      : undefined

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Eye Foundation Module™
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Six calm, guided exercises that build the visual habits real reading speed is built on. Practice them
          in order, at your own pace — there&apos;s no rush and no score.
        </p>
      </div>

      <div className="mt-8">
        <ContinueLearningCard
          variant="hero"
          eyebrow="Quantum Speed Reading Lab™"
          title={summary.isComplete ? 'Module complete' : (summary.currentExercise?.title ?? 'Eye Foundation Module™')}
          actionLabel={summary.actionLabel}
          actionHref={summary.currentExercise?.href ?? null}
          completedCount={summary.completedCount}
          totalCount={summary.totalCount}
          lastCompletedTitle={summary.lastCompletedTitle}
          isComplete={summary.isComplete}
        />

        {resumeExercise && (
          <div className="mt-3 text-center">
            <Button asChild variant="ghost" size="sm">
              <Link href={resumeExercise.href}>Resume {resumeExercise.title}</Link>
            </Button>
          </div>
        )}
      </div>

      <ol className="mt-12 space-y-3">
        {EYE_FOUNDATION_MODULE.map((exercise, index) => {
          const availability = progress.availabilityByExerciseId[exercise.exerciseId] ?? 'locked'
          const isLocked = availability === 'locked'
          const isCompleted = availability === 'completed'
          const isCurrent = availability === 'current'

          return (
            <li key={exercise.exerciseId}>
              <Card
                {...(isCurrent ? { 'aria-current': 'step' } : {})}
                className={cn(
                  'transition-shadow duration-200',
                  isCurrent ? 'ring-2 ring-primary/40' : 'hover:shadow-md',
                )}
              >
                <CardContent className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isLocked ? <Lock className="size-3.5" /> : isCompleted ? <Check className="size-4" /> : index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={cn(
                          'truncate text-sm font-medium',
                          isLocked ? 'text-muted-foreground' : 'text-foreground',
                        )}
                      >
                        {exercise.title}
                      </h2>
                      <Badge variant={AVAILABILITY_BADGE_VARIANT[availability]}>
                        {AVAILABILITY_LABEL[availability]}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{exercise.summary}</p>
                  </div>

                  {isLocked ? (
                    <Button variant="outline" size="sm" className="shrink-0" disabled>
                      Locked
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={exercise.href}>{isCompleted ? 'Review' : 'Open'}</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
