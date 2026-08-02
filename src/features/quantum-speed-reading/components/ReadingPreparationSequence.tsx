'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { READING_PREPARATION_STEPS, type ReadingPreparationStep } from '../readingPreparationSteps'
import { ReadingPreparationTransitionScreen } from './ReadingPreparationTransitionScreen'
import { ReadingPreparationCompleteScreen } from './ReadingPreparationCompleteScreen'

// 800-1200ms per the Reading Preparation™ brief — automatic, no click.
const TRANSITION_MS = 1000

type SequencePhase = 'running' | 'transitioning' | 'complete'

type PreparationStepRunnerProps = {
  exerciseId: string
  Canvas: ReadingPreparationStep['Canvas']
  onStepComplete: () => void
}

// Runs one Reading Preparation™ step using the exact same session hook and
// Canvas every standalone Eye Foundation route uses — only navigation after
// completion differs (advance within this sequence, not push a new route).
function PreparationStepRunner({ exerciseId, Canvas, onStepComplete }: PreparationStepRunnerProps): React.JSX.Element | null {
  const router = useRouter()
  const { stage, start, recordCompletion, recordExit } = useExerciseSession({
    labId: 'quantum-speed-reading',
    exerciseId,
  })

  useEffect(() => {
    start()
    // Runs once per mount (component is remounted per step via a `key`), to
    // move straight into the exercise without a manual "Start" tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleComplete = useCallback(
    (durationMs: number) => {
      void recordCompletion(durationMs).then(onStepComplete)
    },
    [recordCompletion, onStepComplete],
  )

  const handleExit = useCallback(
    (durationMs: number) => {
      void recordExit(durationMs).then(() => {
        router.push('/labs/quantum-speed-reading')
      })
    },
    [recordExit, router],
  )

  if (stage !== 'active') return null

  return <Canvas onComplete={handleComplete} onExit={handleExit} />
}

function PreparationProgressBar({ current, total }: { current: number; total: number }): React.JSX.Element {
  return (
    <div className="fixed inset-x-0 top-0 z-40 flex justify-center py-3">
      <p className="rounded-full bg-background/80 px-4 py-1 text-xs font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur">
        Reading Preparation™ · Step {current} of {total}
      </p>
    </div>
  )
}

export function ReadingPreparationSequence(): React.JSX.Element {
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<SequencePhase>('running')

  const currentStep = READING_PREPARATION_STEPS[stepIndex]
  const nextStep = READING_PREPARATION_STEPS[stepIndex + 1] ?? null

  useEffect(() => {
    if (phase !== 'transitioning') return

    const timer = setTimeout(() => {
      if (nextStep === null) {
        setPhase('complete')
        return
      }
      setStepIndex((index) => index + 1)
      setPhase('running')
    }, TRANSITION_MS)

    return () => clearTimeout(timer)
  }, [phase, nextStep])

  const handleStepComplete = useCallback(() => {
    setPhase('transitioning')
  }, [])

  if (phase === 'complete') {
    return <ReadingPreparationCompleteScreen />
  }

  if (currentStep === undefined) {
    return <ReadingPreparationCompleteScreen />
  }

  return (
    <>
      <PreparationProgressBar current={stepIndex + 1} total={READING_PREPARATION_STEPS.length} />
      {phase === 'transitioning' ? (
        <ReadingPreparationTransitionScreen
          completedTitle={currentStep.title}
          nextTitle={nextStep?.title ?? 'Flash Intelligence Pack™'}
        />
      ) : (
        <PreparationStepRunner
          key={currentStep.exerciseId}
          exerciseId={currentStep.exerciseId}
          Canvas={currentStep.Canvas}
          onStepComplete={handleStepComplete}
        />
      )}
    </>
  )
}
