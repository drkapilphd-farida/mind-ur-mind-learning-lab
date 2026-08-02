'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { completeTratakMissionSession, type VisualIntelligenceReport } from '../../actions/completeTratakMissionSession'
import { devCompleteCandleTratakSession } from '@/lib/exercises/actions/devCandleTratakTools'
import { CANDLE_TRATAK_IMAGE } from '../../candleTratakImage'
import type { ImageFixationAnalyzerAnswers } from '../../imageFixation/imageFixationReflection'
import { ImageFixationSessionScreen } from '../../imageFixation/ImageFixationSessionScreen'
import { CandleTratakPreparationScreen } from './CandleTratakPreparationScreen'
import { CandleTratakEyesClosedScreen } from './CandleTratakEyesClosedScreen'
import { CandleTratakReflectionScreen } from './CandleTratakReflectionScreen'
import { CandleTratakObservationScreen } from './CandleTratakObservationScreen'
import { CandleTratakReportScreen } from './CandleTratakReportScreen'
import { CandleTratakDevPanel } from './CandleTratakDevPanel'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { usePhaseFadeClass } from '@/hooks/exercises/usePhaseFadeClass'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { cn } from '@/lib/utils'

type CandleTratakPhase = 'preparation' | 'countdown' | 'session' | 'eyes-closed' | 'reflection' | 'observation-intelligence' | 'report'

const EYES_CLOSED_SECONDS = 20

type CandleTratakExperienceProps = {
  neuralEvolutionOverallScore: number
  // When provided (e.g. embedded inside Visual Activation™'s guided
  // sequence), called instead of navigating to the standalone Tratak hub —
  // omitted, this component's standalone route behaves exactly as before.
  onReturnToJourney?: () => void
  // Advanced Tratak™ reuses this exact component/engine for a longer, harder
  // round — these two are cosmetic only and default to the standalone
  // Candle Tratak™ route's exact current copy/duration when omitted.
  missionLabel?: string
  title?: string
  defaultDurationSeconds?: number
  // Cosmetic only — defaults to the standalone route's exact current copy.
  continueLabel?: string
}

export function CandleTratakExperience({
  neuralEvolutionOverallScore: neuralEvolutionBeforeScore,
  onReturnToJourney,
  missionLabel = 'Mission 1',
  title = 'Candle Tratak™',
  defaultDurationSeconds = 45,
  continueLabel = 'Return to Journey',
}: CandleTratakExperienceProps): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<CandleTratakPhase>('preparation')
  const [durationSeconds, setDurationSeconds] = useState(defaultDurationSeconds)
  const [measuredAfterImageDurationSeconds, setMeasuredAfterImageDurationSeconds] = useState(0)
  const [pendingAnalyzerAnswers, setPendingAnalyzerAnswers] = useState<ImageFixationAnalyzerAnswers | null>(null)
  const [report, setReport] = useState<VisualIntelligenceReport | null>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [journeyProgressPercent, setJourneyProgressPercent] = useState(0)
  const [neuralEvolutionAfterScore, setNeuralEvolutionAfterScore] = useState(neuralEvolutionBeforeScore)
  const prefersReducedMotion = usePrefersReducedMotion()
  // Sprint-15 — Premium Interaction Review™. Was a useRef — correct as a
  // double-submit guard, but a ref can't drive the Continue button's
  // loading spinner (no re-render). Reactive state keeps the exact same
  // guard behavior while letting the UI reflect it.
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false)
  const isVictoryRevealed = useMicroVictoryReveal(1500, report)

  const handleStart = useCallback((selectedDurationSeconds: number) => {
    setDurationSeconds(selectedDurationSeconds)
    setPhase('countdown')
  }, [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('eyes-closed'), [])
  const handleExitSession = useCallback(() => setPhase('preparation'), [])
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
      if (isSubmittingObservation || pendingAnalyzerAnswers === null) return
      setIsSubmittingObservation(true)

      void completeTratakMissionSession({
        missionId: 'candle-tratak',
        durationSeconds: durationSeconds + EYES_CLOSED_SECONDS,
        reflectionResponse: null,
        observationNotes: null,
        analyzerAnswers: pendingAnalyzerAnswers,
        observationAnswers,
        levelNumber: null,
        imageId: CANDLE_TRATAK_IMAGE.id,
        measuredAfterImageDurationSeconds,
      }).then((result) => {
        setIsSubmittingObservation(false)
        if (!result.success) return
        setReport(result.stats.visualIntelligenceReport)
        setXpEarned(result.xpEarned)
        setJourneyProgressPercent(result.stats.journeyProgressPercent)
        setNeuralEvolutionAfterScore(result.stats.neuralEvolutionOverallScore)
        setPhase('report')
      })
    },
    [pendingAnalyzerAnswers, durationSeconds, measuredAfterImageDurationSeconds, isSubmittingObservation],
  )

  const handlePracticeAgain = useCallback(() => {
    setPendingAnalyzerAnswers(null)
    setReport(null)
    setPhase('preparation')
  }, [])

  const handleReturnToJourney = useCallback(() => {
    if (onReturnToJourney) {
      onReturnToJourney()
      return
    }
    router.push('/labs/visual-intelligence/tratak')
    router.refresh()
  }, [router, onReturnToJourney])

  const handleDevReplay = useCallback(() => {
    setPendingAnalyzerAnswers(null)
    setReport(null)
    setPhase('preparation')
  }, [])

  const handleDevGenerateReport = useCallback(() => {
    void devCompleteCandleTratakSession().then((result) => {
      if (!result.success) return
      setReport(result.stats.visualIntelligenceReport)
      setXpEarned(result.xpEarned)
      setJourneyProgressPercent(result.stats.journeyProgressPercent)
      setNeuralEvolutionAfterScore(result.stats.neuralEvolutionOverallScore)
      setPhase('report')
    })
  }, [])

  const handleDevResetSession = useCallback(() => {
    setPendingAnalyzerAnswers(null)
    setReport(null)
    setPhase('preparation')
  }, [])

  const fadeClass = usePhaseFadeClass(prefersReducedMotion)
  const isFullScreenPhase = phase === 'session' || phase === 'eyes-closed'

  return (
    <>
      <div key={phase} className={cn(!isFullScreenPhase && 'mx-auto max-w-2xl px-6 py-16', !isFullScreenPhase && fadeClass)}>
        {phase === 'preparation' && (
          <CandleTratakPreparationScreen onStart={handleStart} missionLabel={missionLabel} title={title} defaultDurationSeconds={defaultDurationSeconds} />
        )}
        {phase === 'countdown' && (
          <div className="flex justify-center">
            <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Begin" />
          </div>
        )}
        {phase === 'session' && (
          <ImageFixationSessionScreen
            imageSrc={CANDLE_TRATAK_IMAGE.src}
            imageAlt={CANDLE_TRATAK_IMAGE.alt}
            durationSeconds={durationSeconds}
            onComplete={handleSessionComplete}
            anchorXPercent={CANDLE_TRATAK_IMAGE.anchorXPercent}
            anchorYPercent={CANDLE_TRATAK_IMAGE.anchorYPercent}
            pulse
            anchorSize={5}
            onExit={handleExitSession}
          />
        )}
        {phase === 'eyes-closed' && <CandleTratakEyesClosedScreen onComplete={handleEyesClosedComplete} />}
        {phase === 'reflection' && (
          <CandleTratakReflectionScreen measuredAfterImageDurationSeconds={measuredAfterImageDurationSeconds} onContinue={handleAnalyzerContinue} />
        )}
        {phase === 'observation-intelligence' && (
          <CandleTratakObservationScreen onContinue={handleObservationContinue} isSubmitting={isSubmittingObservation} />
        )}
        {phase === 'report' && report !== null && !isVictoryRevealed && <MicroVictoryMoment />}
        {phase === 'report' && report !== null && isVictoryRevealed && (
          <CandleTratakReportScreen
            report={report}
            xpEarned={xpEarned}
            journeyProgressPercent={journeyProgressPercent}
            neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
            neuralEvolutionAfterScore={neuralEvolutionAfterScore}
            onPracticeAgain={handlePracticeAgain}
            onReturnToJourney={handleReturnToJourney}
            continueLabel={continueLabel}
          />
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <CandleTratakDevPanel onReplay={handleDevReplay} onGenerateReport={handleDevGenerateReport} onResetSession={handleDevResetSession} />
      )}
    </>
  )
}
