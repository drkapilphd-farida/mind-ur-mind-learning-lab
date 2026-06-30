import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ContinueLearningCard } from '@/components/exercises/ContinueLearningCard'
import { ReadingIntelligenceActivatedCard } from '@/components/labs/ReadingIntelligenceActivatedCard'
import { getModuleProgress, type ExerciseAvailability } from '@/lib/exercises/queries/getModuleProgress'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import { getLastIncompleteAttemptDuration, formatDurationLabel } from '@/lib/exercises/practiceHistory'
import { computeReadingScore, computeMindScore } from '@/lib/exercises/mindScore'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Quantum Speed Reading Lab™',
  description: 'The Eye Foundation Intelligence Stage — six activations that build the visual foundation real reading speed is built on.',
}

const EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)

// Display labels using transformation language — no LMS terminology.
const AVAILABILITY_LABEL: Record<ExerciseAvailability, string> = {
  completed: 'Activated',
  current: 'You are here',
  locked: 'Locked',
}

const AVAILABILITY_BADGE_VARIANT: Record<ExerciseAvailability, 'outline' | 'secondary' | 'default'> = {
  completed: 'default',
  current: 'secondary',
  locked: 'outline',
}

// Short activation description shown beneath each completed exercise — describes
// what ability was developed, not what content was consumed.
const ACTIVATION_DESCRIPTIONS: Record<string, string> = {
  'eye-warm-up': 'Visual flexibility activated.',
  'eye-stretch': 'Eye range and comfort activated.',
  'eye-span': 'Peripheral awareness activated.',
  'regression-control': 'Forward reading momentum activated.',
  'reading-speed': 'Reading rhythm and pace activated.',
  'rsvp': 'Rapid word recognition activated.',
}

export default async function QuantumSpeedReadingLabPage(): Promise<React.JSX.Element> {
  const [progress, sessions] = await Promise.all([
    getModuleProgress('quantum-speed-reading', EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
  ])
  const summary = getContinueLearningSummary(progress, EYE_FOUNDATION_MODULE)

  const completionPercent = progress.totalCount > 0
    ? Math.round((progress.completedCount / progress.totalCount) * 100)
    : 0
  const readingScore = computeReadingScore(completionPercent, 0) // streak not needed here
  const mindScore = computeMindScore([readingScore])

  const lastAttemptDurationMs =
    summary.isResuming && summary.currentExercise !== null
      ? getLastIncompleteAttemptDuration(sessions, summary.currentExercise.exerciseId)
      : null

  const resumeExercise =
    progress.resumeExerciseId !== null && progress.resumeExerciseId !== progress.nextRecommendedExerciseId
      ? EYE_FOUNDATION_MODULE.find((exercise) => exercise.exerciseId === progress.resumeExerciseId)
      : undefined

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Intelligence Journey
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Eye Foundation Stage™
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Six activations that build the visual habits real reading speed is built on. Practice them
          in order, at your own pace — your mind evolves with every session.
        </p>
      </div>

      <div className="mt-8">
        {/* When all exercises are activated, show the celebration card instead */}
        {summary.isComplete ? (
          <ReadingIntelligenceActivatedCard
            completedCount={progress.completedCount}
            totalCount={progress.totalCount}
            mindScore={mindScore}
          />
        ) : (
          <>
            <ContinueLearningCard
              variant="hero"
              eyebrow="Quantum Speed Reading Lab™"
              title={summary.currentExercise?.title ?? 'Eye Foundation Stage™'}
              actionLabel={summary.actionLabel}
              actionHref={summary.currentExercise?.href ?? null}
              completedCount={summary.completedCount}
              totalCount={summary.totalCount}
              lastCompletedTitle={summary.lastCompletedTitle}
              isComplete={summary.isComplete}
              {...(lastAttemptDurationMs !== null
                ? { resumeContextLabel: `You stopped ${formatDurationLabel(lastAttemptDurationMs)} in last time` }
                : {})}
            />

            {resumeExercise && (
              <div className="mt-3 text-center">
                <Button asChild variant="ghost" size="sm">
                  <Link href={resumeExercise.href}>Resume {resumeExercise.title}</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ol className="mt-12 space-y-3">
        {EYE_FOUNDATION_MODULE.map((exercise, index) => {
          const availability = progress.availabilityByExerciseId[exercise.exerciseId] ?? 'locked'
          const isLocked = availability === 'locked'
          const isActivated = availability === 'completed'
          const isCurrent = availability === 'current'
          const activationDesc = ACTIVATION_DESCRIPTIONS[exercise.exerciseId]

          return (
            <li key={exercise.exerciseId}>
              <Card
                role="group"
                aria-label={`${exercise.title}, ${AVAILABILITY_LABEL[availability]}`}
                {...(isCurrent ? { 'aria-current': 'step' } : {})}
                {...(isLocked ? { 'aria-disabled': true } : {})}
                className={cn(
                  'transition-shadow duration-200',
                  isCurrent ? 'ring-2 ring-primary/40' : isLocked ? 'cursor-not-allowed' : 'hover:shadow-md',
                )}
              >
                <CardContent className="flex items-center gap-4">
                  {/* Step indicator */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
                      isActivated ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isLocked ? <Lock className="size-3.5" /> : isActivated ? <Check className="size-4" /> : index + 1}
                  </div>

                  {/* Exercise info */}
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
                    {/* Show activation description for activated exercises; summary for others */}
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {isActivated && activationDesc ? activationDesc : exercise.summary}
                    </p>
                  </div>

                  {/* Action button */}
                  {isLocked ? (
                    <Button variant="outline" size="sm" className="shrink-0" disabled aria-disabled="true">
                      Locked
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={exercise.href}>
                        {isActivated ? 'Practice Again' : 'Begin Activation'}
                      </Link>
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
