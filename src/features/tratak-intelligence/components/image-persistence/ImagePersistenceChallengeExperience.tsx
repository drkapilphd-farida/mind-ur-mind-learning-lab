'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { completeTratakMissionSession } from '../../actions/completeTratakMissionSession'
import { devCompleteTodaysSequence, devResetTodaysProgress } from '@/lib/exercises/actions/devImagePersistenceTools'
import type { ImagePersistenceImageDefinition } from '../../imagePersistencePool'
import { DAILY_IMAGE_COUNT } from '../../imagePersistenceDailySequence'
import type { DailyPersistenceReport } from '../../dailyPersistenceReport'
import type { ImageFixationAnalyzerAnswers } from '../../imageFixation/imageFixationReflection'
import { ImagePersistencePreparationScreen } from './ImagePersistencePreparationScreen'
import { ImagePersistenceSessionScreen } from './ImagePersistenceSessionScreen'
import { ImagePersistenceEyesClosedScreen } from './ImagePersistenceEyesClosedScreen'
import { ImagePersistenceReflectionScreen } from './ImagePersistenceReflectionScreen'
import { ImagePersistenceObservationScreen } from './ImagePersistenceObservationScreen'
import { ImagePersistenceReportScreen } from './ImagePersistenceReportScreen'
import { ImagePersistenceDevPanel } from './ImagePersistenceDevPanel'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { usePhaseFadeClass } from '@/hooks/exercises/usePhaseFadeClass'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { cn } from '@/lib/utils'

type ImagePersistencePhase = 'preparation' | 'countdown' | 'session' | 'eyes-closed' | 'reflection' | 'observation-intelligence' | 'transition' | 'report'

const EYES_CLOSED_SECONDS = 20

type ImagePersistenceChallengeExperienceProps = {
  // Real lab-wide Neural Evolution Index™ read once at page load — used as
  // the "before" side of the honest delta.
  neuralEvolutionOverallScore: number
  // Real, already-computed lab-wide Visual DNA™ score — Tratak doesn't feed
  // Visual DNA™, so this is the honest existing value, never fabricated.
  visualDnaScore: number
  sequence: readonly ImagePersistenceImageDefinition[]
  todaysCompletedCount: number
  initialTodaysReport: DailyPersistenceReport | null
  initialDailyStreak: number
  // When provided (e.g. embedded inside Visual Activation™'s guided
  // sequence), called instead of navigating to the standalone Tratak hub —
  // omitted, this component's standalone route behaves exactly as before.
  onReturnToJourney?: () => void
  // Cosmetic only — defaults to the standalone route's exact current copy.
  continueLabel?: string
}

// Sprint 10F architecture refinement: one continuous flow through today's
// real 5-image sequence — no hub returns between images, no "Next Image"
// button (auto-transition via a short countdown instead), one combined
// report only after image 5 (or immediately if today's 5 are already done).
export function ImagePersistenceChallengeExperience({
  neuralEvolutionOverallScore: neuralEvolutionBeforeScore,
  visualDnaScore,
  sequence,
  todaysCompletedCount,
  initialTodaysReport,
  initialDailyStreak,
  onReturnToJourney,
  continueLabel = 'Return to Journey',
}: ImagePersistenceChallengeExperienceProps): React.JSX.Element {
  const router = useRouter()
  const isAlreadyCompleteToday = todaysCompletedCount >= DAILY_IMAGE_COUNT
  const [phase, setPhase] = useState<ImagePersistencePhase>(isAlreadyCompleteToday ? 'report' : 'preparation')
  const [currentImageIndex, setCurrentImageIndex] = useState(Math.min(todaysCompletedCount, DAILY_IMAGE_COUNT - 1))
  const [durationSeconds, setDurationSeconds] = useState(45)
  const [measuredAfterImageDurationSeconds, setMeasuredAfterImageDurationSeconds] = useState(0)
  const [pendingAnalyzerAnswers, setPendingAnalyzerAnswers] = useState<ImageFixationAnalyzerAnswers | null>(null)
  const [dailyReport, setDailyReport] = useState<DailyPersistenceReport | null>(initialTodaysReport)
  const [neuralEvolutionAfterScore, setNeuralEvolutionAfterScore] = useState(neuralEvolutionBeforeScore)
  const [dailyStreak, setDailyStreak] = useState(initialDailyStreak)
  const prefersReducedMotion = usePrefersReducedMotion()
  // Sprint-15 — Premium Interaction Review™. Was a useRef — correct as a
  // double-submit guard, but a ref can't drive the Continue button's
  // loading spinner (no re-render). Reactive state keeps the exact same
  // guard behavior while letting the UI reflect it.
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false)
  // Only the just-completed transition into 'report' earns a victory flash
  // — revisiting an already-finished day's report (isAlreadyCompleteToday)
  // starts in phase 'report' directly and should show it immediately, since
  // nothing was just "won" in this page view.
  const [justEarnedVictory, setJustEarnedVictory] = useState(false)
  const isVictoryRevealed = useMicroVictoryReveal(1500, currentImageIndex)

  const currentImage = sequence[currentImageIndex]

  const handleStart = useCallback((selectedDurationSeconds: number) => {
    setDurationSeconds(selectedDurationSeconds)
    setPhase('countdown')
  }, [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('eyes-closed'), [])
  const handleReturnToJourney = useCallback(() => {
    if (onReturnToJourney) {
      onReturnToJourney()
      return
    }
    router.push('/labs/visual-intelligence/tratak')
    router.refresh()
  }, [router, onReturnToJourney])
  // Exit abandons only the in-progress image — nothing partial is ever
  // saved, so returning to the hub is always safe.
  const handleExitSession = useCallback(() => handleReturnToJourney(), [handleReturnToJourney])
  const handleEyesClosedComplete = useCallback((measuredDurationSeconds: number) => {
    setMeasuredAfterImageDurationSeconds(measuredDurationSeconds)
    setPhase('reflection')
  }, [])

  const handleAnalyzerContinue = useCallback((answers: ImageFixationAnalyzerAnswers) => {
    setPendingAnalyzerAnswers(answers)
    setPhase('observation-intelligence')
  }, [])

  const handleObservationContinue = useCallback(
    (observationAnswers: Record<string, string>) => {
      if (isSubmittingObservation || pendingAnalyzerAnswers === null || currentImage === undefined) return
      setIsSubmittingObservation(true)

      void completeTratakMissionSession({
        missionId: 'image-persistence-challenge',
        durationSeconds: durationSeconds + EYES_CLOSED_SECONDS,
        reflectionResponse: null,
        observationNotes: null,
        analyzerAnswers: pendingAnalyzerAnswers,
        observationAnswers,
        levelNumber: currentImageIndex + 1,
        imageId: currentImage.id,
        measuredAfterImageDurationSeconds,
      }).then((result) => {
        setIsSubmittingObservation(false)
        if (!result.success) return

        setPendingAnalyzerAnswers(null)

        if (currentImageIndex + 1 >= DAILY_IMAGE_COUNT) {
          setDailyReport(result.stats.dailyPersistenceReport)
          setNeuralEvolutionAfterScore(result.stats.neuralEvolutionOverallScore)
          setDailyStreak(result.stats.currentStreak)
          setJustEarnedVictory(true)
          setPhase('report')
        } else {
          setCurrentImageIndex((index) => index + 1)
          setPhase('transition')
        }
      })
    },
    [pendingAnalyzerAnswers, durationSeconds, measuredAfterImageDurationSeconds, currentImage, currentImageIndex, isSubmittingObservation],
  )

  const handleTransitionComplete = useCallback(() => setPhase('countdown'), [])

  const handleDevSkip = useCallback(() => {
    if (phase === 'countdown') setPhase('session')
    else if (phase === 'session') setPhase('eyes-closed')
    else if (phase === 'eyes-closed') setPhase('reflection')
    else if (phase === 'transition') setPhase('countdown')
  }, [phase])

  const handleDevCompleteTodaysSequence = useCallback(() => {
    void devCompleteTodaysSequence().then((result) => {
      if (!result.success) return
      setDailyReport(result.stats.dailyPersistenceReport)
      setNeuralEvolutionAfterScore(result.stats.neuralEvolutionOverallScore)
      setDailyStreak(result.stats.currentStreak)
      setPhase('report')
    })
  }, [])

  const handleDevResetTodaysProgress = useCallback(() => {
    void devResetTodaysProgress().then((result) => {
      if (!result.success) return
      setCurrentImageIndex(0)
      setPendingAnalyzerAnswers(null)
      setDailyReport(null)
      setPhase('preparation')
      router.refresh()
    })
  }, [router])

  const fadeClass = usePhaseFadeClass(prefersReducedMotion)
  const isFullScreenPhase = phase === 'session' || phase === 'eyes-closed'

  return (
    <>
      <div key={phase} className={cn(!isFullScreenPhase && 'mx-auto max-w-2xl px-6 py-16', !isFullScreenPhase && fadeClass)}>
        {phase === 'preparation' && <ImagePersistencePreparationScreen onStart={handleStart} />}
        {phase === 'countdown' && (
          <div className="flex justify-center">
            <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Begin" />
          </div>
        )}
        {phase === 'session' && currentImage !== undefined && (
          <ImagePersistenceSessionScreen image={currentImage} durationSeconds={durationSeconds} onComplete={handleSessionComplete} onExit={handleExitSession} />
        )}
        {phase === 'eyes-closed' && <ImagePersistenceEyesClosedScreen onComplete={handleEyesClosedComplete} />}
        {phase === 'reflection' && (
          <ImagePersistenceReflectionScreen measuredAfterImageDurationSeconds={measuredAfterImageDurationSeconds} onContinue={handleAnalyzerContinue} />
        )}
        {phase === 'observation-intelligence' && currentImage !== undefined && (
          <ImagePersistenceObservationScreen
            imageId={currentImage.id}
            onContinue={handleObservationContinue}
            isSubmitting={isSubmittingObservation}
          />
        )}
        {phase === 'transition' && (
          <div className="flex justify-center">
            <ExerciseCountdown from={3} onComplete={handleTransitionComplete} readyLabel="Preparing Next Image..." goLabel="Begin" />
          </div>
        )}
        {phase === 'report' && dailyReport !== null && justEarnedVictory && !isVictoryRevealed && (
          <MicroVictoryMoment progressLabel={`${DAILY_IMAGE_COUNT} of ${DAILY_IMAGE_COUNT} Images Complete`} />
        )}
        {phase === 'report' && dailyReport !== null && (!justEarnedVictory || isVictoryRevealed) && (
          <ImagePersistenceReportScreen
            dailyReport={dailyReport}
            visualDnaScore={visualDnaScore}
            neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
            neuralEvolutionAfterScore={neuralEvolutionAfterScore}
            dailyStreak={dailyStreak}
            onReturnToJourney={handleReturnToJourney}
            continueLabel={continueLabel}
          />
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <ImagePersistenceDevPanel
          canSkip={phase === 'countdown' || phase === 'session' || phase === 'eyes-closed' || phase === 'transition'}
          onSkip={handleDevSkip}
          onCompleteTodaysSequence={handleDevCompleteTodaysSequence}
          onResetTodaysProgress={handleDevResetTodaysProgress}
        />
      )}
    </>
  )
}
