import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getModuleProgress, type ExerciseStatus } from '@/lib/exercises/queries/getModuleProgress'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Quantum Speed Reading Lab™',
  description: 'The Eye Foundation Module — six calm, guided exercises that build the visual habits real reading speed is built on.',
}

const EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)

const STATUS_LABEL: Record<ExerciseStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
}

const STATUS_BADGE_VARIANT: Record<ExerciseStatus, 'outline' | 'secondary' | 'default'> = {
  'not-started': 'outline',
  'in-progress': 'secondary',
  completed: 'default',
}

export default async function QuantumSpeedReadingLabPage(): Promise<React.JSX.Element> {
  const progress = await getModuleProgress('quantum-speed-reading', EXERCISE_IDS)

  const completedCount = EXERCISE_IDS.filter(
    (exerciseId) => progress.statusByExerciseId[exerciseId] === 'completed',
  ).length
  const isModuleComplete = completedCount === EXERCISE_IDS.length

  const nextExercise = EYE_FOUNDATION_MODULE.find(
    (exercise) => exercise.exerciseId === progress.nextRecommendedExerciseId,
  )
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
        <p className="mt-4 text-sm text-muted-foreground">
          {completedCount} of {EXERCISE_IDS.length} complete
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          {isModuleComplete ? (
            <p className="text-sm font-medium text-foreground">
              You&apos;ve completed every exercise in this module. Feel free to revisit any of them below.
            </p>
          ) : (
            nextExercise && (
              <Button asChild size="lg" className="min-w-[220px] rounded-full shadow-sm">
                <Link href={nextExercise.href}>
                  {progress.statusByExerciseId[nextExercise.exerciseId] === 'in-progress'
                    ? `Continue: ${nextExercise.title}`
                    : `Start: ${nextExercise.title}`}
                </Link>
              </Button>
            )
          )}

          {resumeExercise && (
            <Button asChild variant="ghost" size="sm">
              <Link href={resumeExercise.href}>Resume {resumeExercise.title}</Link>
            </Button>
          )}
        </div>
      </div>

      <ol className="mt-12 space-y-3">
        {EYE_FOUNDATION_MODULE.map((exercise, index) => {
          const status = progress.statusByExerciseId[exercise.exerciseId] ?? 'not-started'
          const isNextRecommended = exercise.exerciseId === progress.nextRecommendedExerciseId

          return (
            <li key={exercise.exerciseId}>
              <Card className={isNextRecommended ? 'ring-2 ring-primary/40' : undefined}>
                <CardContent className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-medium text-foreground">{exercise.title}</h2>
                      <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{exercise.summary}</p>
                  </div>

                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link href={exercise.href}>{status === 'completed' ? 'Review' : 'Open'}</Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
