'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { savePracticeSession } from '@/lib/exercises/actions/savePracticeSession'
import { MandalaPersistenceFlowExperience } from '@/features/tratak-intelligence/components/mandala/MandalaPersistenceFlowExperience'
import { ImagePersistenceChallengeExperience } from '@/features/tratak-intelligence/components/image-persistence/ImagePersistenceChallengeExperience'
import { CandleTratakExperience } from '@/features/tratak-intelligence/components/candle-tratak/CandleTratakExperience'
import type { ImagePersistenceImageDefinition } from '@/features/tratak-intelligence/imagePersistencePool'
import type { DailyPersistenceReport } from '@/features/tratak-intelligence/dailyPersistenceReport'
import { BreathAwarenessScreen } from './preparation/BreathAwarenessScreen'
import { EyeRelaxationScreen } from './preparation/EyeRelaxationScreen'
import { VisualActivationCompleteScreen } from './VisualActivationCompleteScreen'
import { VisualActivationTransitionScreen } from './VisualActivationTransitionScreen'
import { VISUAL_ACTIVATION_SEQUENCE } from '../visualActivationSequence'

const CONTINUE_LABEL = 'Continue Journey'
// Matches ReadingPreparationSequence's TRANSITION_MS — one shared, brief,
// automatic hand-off timing across the app's two guided sequences.
const TRANSITION_MS = 1000

type VisualActivationSequenceProps = {
  neuralEvolutionOverallScore: number
  imagePersistenceVisualDnaScore: number
  imagePersistenceSequence: readonly ImagePersistenceImageDefinition[]
  imagePersistenceTodaysCompletedCount: number
  imagePersistenceInitialTodaysReport: DailyPersistenceReport | null
  imagePersistenceInitialDailyStreak: number
}

type SequencePhase = 'running' | 'transitioning' | 'complete'

function VisualActivationProgressBar({ current, total }: { current: number; total: number }): React.JSX.Element {
  return (
    <div className="fixed inset-x-0 top-0 z-40 flex justify-center py-3">
      <p className="rounded-full bg-background/80 px-4 py-1 text-xs font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur">
        Visual Activation {current} / {total}
      </p>
    </div>
  )
}

// Orchestrates all 6 Visual Activation™ stages using each stage's real,
// unmodified engine (Canvas-style screens for the first two, full Tratak
// mission Experiences for the rest). Each stage's own completion additionally
// records a 'visual-intelligence' exercise_progress row (savePracticeSession,
// same action Reading Preparation™ uses) purely for cross-lab progress
// tracking/gating — it never replaces a mission's own real session write.
export function VisualActivationSequence({
  neuralEvolutionOverallScore,
  imagePersistenceVisualDnaScore,
  imagePersistenceSequence,
  imagePersistenceTodaysCompletedCount,
  imagePersistenceInitialTodaysReport,
  imagePersistenceInitialDailyStreak,
}: VisualActivationSequenceProps): React.JSX.Element {
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<SequencePhase>('running')
  const stepStartRef = useRef(Date.now())

  const currentStep = VISUAL_ACTIVATION_SEQUENCE[stepIndex]

  const moveToNextStep = useCallback(() => {
    stepStartRef.current = Date.now()
    setStepIndex((index) => {
      const next = index + 1
      if (next >= VISUAL_ACTIVATION_SEQUENCE.length) {
        setPhase('complete')
      }
      return next
    })
  }, [])

  // Used by the Tratak family (Mandala/Image Persistence/Candle/Advanced) —
  // each already shows its own report screen and an explicit "Continue
  // Journey" click before this fires, so it advances immediately, same as
  // before Sprint-13.
  const advance = useCallback(() => {
    if (!currentStep) return
    const durationMs = Math.max(1, Date.now() - stepStartRef.current)
    void savePracticeSession({
      labId: 'visual-intelligence',
      exerciseId: currentStep.exerciseId,
      durationMs,
      completed: true,
    })
    moveToNextStep()
  }, [currentStep, moveToNextStep])

  // Used by the two standalone screens (Breath Awareness, Eye Relaxation)
  // that previously had zero acknowledgment between them — records the
  // session, then shows a brief automatic transition before moving on.
  const handleSimpleStepComplete = useCallback(() => {
    if (!currentStep) return
    const durationMs = Math.max(1, Date.now() - stepStartRef.current)
    void savePracticeSession({
      labId: 'visual-intelligence',
      exerciseId: currentStep.exerciseId,
      durationMs,
      completed: true,
    })
    setPhase('transitioning')
  }, [currentStep])

  useEffect(() => {
    if (phase !== 'transitioning') return
    const timer = setTimeout(() => {
      moveToNextStep()
      setPhase('running')
    }, TRANSITION_MS)
    return () => clearTimeout(timer)
  }, [phase, moveToNextStep])

  if (phase === 'complete' || !currentStep) {
    return <VisualActivationCompleteScreen />
  }

  if (phase === 'transitioning') {
    return <VisualActivationTransitionScreen stepIndex={stepIndex + 1} totalSteps={VISUAL_ACTIVATION_SEQUENCE.length} />
  }

  return (
    <>
      <VisualActivationProgressBar current={stepIndex + 1} total={VISUAL_ACTIVATION_SEQUENCE.length} />

      {currentStep.exerciseId === 'breath-awareness' && <BreathAwarenessScreen key={currentStep.exerciseId} onComplete={handleSimpleStepComplete} />}

      {currentStep.exerciseId === 'eye-relaxation' && <EyeRelaxationScreen key={currentStep.exerciseId} onComplete={handleSimpleStepComplete} />}

      {currentStep.exerciseId === 'mandala-persistence' && (
        <MandalaPersistenceFlowExperience
          key={currentStep.exerciseId}
          neuralEvolutionOverallScore={neuralEvolutionOverallScore}
          onReturnToJourney={advance}
          continueLabel={CONTINUE_LABEL}
        />
      )}

      {currentStep.exerciseId === 'image-persistence-challenge' && (
        <ImagePersistenceChallengeExperience
          key={currentStep.exerciseId}
          neuralEvolutionOverallScore={neuralEvolutionOverallScore}
          visualDnaScore={imagePersistenceVisualDnaScore}
          sequence={imagePersistenceSequence}
          todaysCompletedCount={imagePersistenceTodaysCompletedCount}
          initialTodaysReport={imagePersistenceInitialTodaysReport}
          initialDailyStreak={imagePersistenceInitialDailyStreak}
          onReturnToJourney={advance}
          continueLabel={CONTINUE_LABEL}
        />
      )}

      {currentStep.exerciseId === 'candle-tratak' && (
        <CandleTratakExperience
          key={currentStep.exerciseId}
          neuralEvolutionOverallScore={neuralEvolutionOverallScore}
          onReturnToJourney={advance}
          continueLabel={CONTINUE_LABEL}
        />
      )}

      {currentStep.exerciseId === 'advanced-tratak' && (
        <CandleTratakExperience
          key={currentStep.exerciseId}
          neuralEvolutionOverallScore={neuralEvolutionOverallScore}
          onReturnToJourney={advance}
          missionLabel="Bonus Mission"
          title="Advanced Tratak™"
          defaultDurationSeconds={90}
          continueLabel={CONTINUE_LABEL}
        />
      )}
    </>
  )
}
