'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { Button } from '@/components/ui/button'
import {
  completeTratakMissionSession,
  type CompleteTratakMissionSessionStats,
  type VisualIntelligenceReport,
} from '../../actions/completeTratakMissionSession'
import { devResetMandalaTratakMission, devCompleteMandalaMission } from '@/lib/exercises/actions/devMandalaTratakTools'
import { MANDALA_LEVELS, type MandalaLevel, type MandalaLevelOrder } from '../../mandalaLevels'
import type { ImageFixationAnalyzerAnswers } from '../../imageFixation/imageFixationReflection'
import type { VisualAnalytics } from '../../imageFixation/visualAnalytics'
import { IntelligentFocusAnalyzerScreen } from '../../imageFixation/IntelligentFocusAnalyzerScreen'
import { ObservationIntelligenceScreen } from './ObservationIntelligenceScreen'
import { MandalaPreparationScreen } from './MandalaPreparationScreen'
import { MandalaSessionScreen } from './MandalaSessionScreen'
import { MandalaEyesClosedScreen } from './MandalaEyesClosedScreen'
import { MandalaLevelCompleteScreen } from './MandalaLevelCompleteScreen'
import { MandalaCompletionScreen } from './MandalaCompletionScreen'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { usePhaseFadeClass } from '@/hooks/exercises/usePhaseFadeClass'
import { MicroVictoryMoment } from '@/components/exercises/MicroVictoryMoment'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { cn } from '@/lib/utils'

type MandalaFlowPhase =
  | 'preparation'
  | 'countdown'
  | 'session'
  | 'eyes-closed'
  | 'reflection'
  | 'observation-intelligence'
  | 'level-complete'
  | 'mission-complete'

const EYES_CLOSED_SECONDS = 20
const FIRST_LEVEL: MandalaLevelOrder = 1

function levelDuration(order: MandalaLevelOrder): number {
  return MANDALA_LEVELS.find((level) => level.order === order)?.durationSeconds ?? 45
}

type MandalaPersistenceFlowExperienceProps = {
  neuralEvolutionOverallScore: number
  // When provided (e.g. embedded inside Visual Activation™'s guided
  // sequence), called instead of navigating to the standalone Tratak hub.
  onReturnToJourney?: () => void
  // Cosmetic only — the label read on the two completion-screen buttons.
  continueLabel?: string
}

// One continuous, auto-advancing Mandala Persistence™ experience — no level
// picker, no category selection. Always starts at level 1 and moves
// straight through all 5 real MANDALA_LEVELS in order, showing the
// preparation screen once (not once per level). Reuses every existing
// screen/question-set/completion-action call the old level-picker
// (MandalaTratakExperience.tsx, untouched, still serves the standalone
// /tratak/mandala route) already used — only the orchestration shape
// changes from "pick a level" to "one guided flow."
export function MandalaPersistenceFlowExperience({
  neuralEvolutionOverallScore: neuralEvolutionBeforeScore,
  onReturnToJourney,
  continueLabel = 'Return to Journey',
}: MandalaPersistenceFlowExperienceProps): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<MandalaFlowPhase>('preparation')
  const [currentLevelOrder, setCurrentLevelOrder] = useState<MandalaLevelOrder>(FIRST_LEVEL)
  const [pendingAnalyzerAnswers, setPendingAnalyzerAnswers] = useState<ImageFixationAnalyzerAnswers | null>(null)
  const [levelXpEarned, setLevelXpEarned] = useState(0)
  const [completedLevelsCount, setCompletedLevelsCount] = useState(0)
  const [levelAnalytics, setLevelAnalytics] = useState<VisualAnalytics | null>(null)
  const [visualIntelligenceReport, setVisualIntelligenceReport] = useState<VisualIntelligenceReport | null>(null)
  const [neuralEvolutionAfterScore, setNeuralEvolutionAfterScore] = useState(neuralEvolutionBeforeScore)
  const [focusScore, setFocusScore] = useState(0)
  const [persistenceScore, setPersistenceScore] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [journeyProgressPercent, setJourneyProgressPercent] = useState(0)
  const [missionXpTotal, setMissionXpTotal] = useState(0)
  const [isResettingDev, setIsResettingDev] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  // Sprint-15 — Premium Interaction Review™. Was a useRef — correct as a
  // double-submit guard, but a ref can't drive the Continue button's
  // loading spinner (no re-render). Reactive state keeps the exact same
  // guard behavior while letting the UI reflect it.
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false)
  const isVictoryRevealed = useMicroVictoryReveal(1500, completedLevelsCount)

  const handleReady = useCallback(() => setPhase('countdown'), [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('eyes-closed'), [])
  const handleEyesClosedComplete = useCallback(() => setPhase('reflection'), [])

  const handleAnalyzerContinue = useCallback((answers: ImageFixationAnalyzerAnswers) => {
    setPendingAnalyzerAnswers(answers)
    setPhase('observation-intelligence')
  }, [])

  const applySessionStats = useCallback((stats: CompleteTratakMissionSessionStats, xpEarned: number) => {
    setCurrentLevelOrder((order) => stats.mandalaCurrentLevelNumber ?? order)
    setLevelXpEarned(xpEarned)
    setCompletedLevelsCount(stats.mandalaLevels.filter((level: MandalaLevel) => level.status === 'completed').length)
    setLevelAnalytics(stats.visualAnalytics)
    setVisualIntelligenceReport(stats.visualIntelligenceReport)
    setJourneyProgressPercent(stats.journeyProgressPercent)
    setNeuralEvolutionAfterScore(stats.neuralEvolutionOverallScore)

    if (stats.isMandalaMissionFullyComplete) {
      setFocusScore(stats.focusScore)
      setPersistenceScore(stats.persistenceScore)
      setCurrentStreak(stats.currentStreak)
      setMissionXpTotal(stats.mandalaLevelXpEarned)
      setPhase('mission-complete')
    } else {
      setPhase('level-complete')
    }
  }, [])

  const handleObservationContinue = useCallback(
    (observationAnswers: Record<string, string>) => {
      if (isSubmittingObservation || pendingAnalyzerAnswers === null) return
      setIsSubmittingObservation(true)

      void completeTratakMissionSession({
        missionId: 'mandala-persistence',
        durationSeconds: levelDuration(currentLevelOrder) + EYES_CLOSED_SECONDS,
        reflectionResponse: null,
        observationNotes: null,
        analyzerAnswers: pendingAnalyzerAnswers,
        observationAnswers,
        levelNumber: currentLevelOrder,
        imageId: null,
        measuredAfterImageDurationSeconds: null,
      }).then((result) => {
        setIsSubmittingObservation(false)
        if (!result.success) return
        applySessionStats(result.stats, result.xpEarned)
      })
    },
    [currentLevelOrder, pendingAnalyzerAnswers, applySessionStats, isSubmittingObservation],
  )

  // Advances straight into the next level's countdown — no preparation
  // screen repeated, no manual level picker, matching "one continuous flow."
  const handleContinueToNextLevel = useCallback(() => {
    setPendingAnalyzerAnswers(null)
    setCurrentLevelOrder((order) => (Math.min(order + 1, 5) as MandalaLevelOrder))
    setPhase('countdown')
  }, [])

  const handleReturnToJourney = useCallback(() => {
    if (onReturnToJourney) {
      onReturnToJourney()
      return
    }
    router.push('/labs/visual-intelligence/tratak')
    router.refresh()
  }, [router, onReturnToJourney])

  const handleDevReset = useCallback(() => {
    setIsResettingDev(true)
    void devResetMandalaTratakMission().then(() => {
      setIsResettingDev(false)
      setCurrentLevelOrder(FIRST_LEVEL)
      setPendingAnalyzerAnswers(null)
      setPhase('preparation')
      router.refresh()
    })
  }, [router])

  const handleDevCompleteMission = useCallback(() => {
    void devCompleteMandalaMission().then((result) => {
      if (!result.success) return
      applySessionStats(result.stats, result.xpEarned)
    })
  }, [applySessionStats])

  const fadeClass = usePhaseFadeClass(prefersReducedMotion)
  const isFullScreenPhase = phase === 'session' || phase === 'eyes-closed'

  return (
    <>
      <div key={phase} className={cn(!isFullScreenPhase && 'mx-auto max-w-2xl px-6 py-16', !isFullScreenPhase && fadeClass)}>
        {phase === 'preparation' && <MandalaPreparationScreen onReady={handleReady} />}
        {phase === 'countdown' && (
          <div className="flex justify-center">
            <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Begin" />
          </div>
        )}
        {phase === 'session' && (
          <MandalaSessionScreen levelOrder={currentLevelOrder} durationSeconds={levelDuration(currentLevelOrder)} onComplete={handleSessionComplete} />
        )}
        {phase === 'eyes-closed' && <MandalaEyesClosedScreen onComplete={handleEyesClosedComplete} />}
        {phase === 'reflection' && <IntelligentFocusAnalyzerScreen onContinue={handleAnalyzerContinue} />}
        {phase === 'observation-intelligence' && (
          <ObservationIntelligenceScreen
            levelOrder={currentLevelOrder}
            onContinue={handleObservationContinue}
            isSubmitting={isSubmittingObservation}
          />
        )}
        {phase === 'level-complete' && !isVictoryRevealed && (
          <MicroVictoryMoment progressLabel={`Level ${completedLevelsCount} of ${MANDALA_LEVELS.length}`} />
        )}
        {phase === 'level-complete' && isVictoryRevealed && (
          <MandalaLevelCompleteScreen
            levelOrder={currentLevelOrder}
            xpEarned={levelXpEarned}
            completedLevelsCount={completedLevelsCount}
            totalLevels={MANDALA_LEVELS.length}
            analytics={levelAnalytics}
            report={visualIntelligenceReport}
            journeyProgressPercent={journeyProgressPercent}
            neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
            neuralEvolutionAfterScore={neuralEvolutionAfterScore}
            onContinue={handleContinueToNextLevel}
          />
        )}
        {phase === 'mission-complete' && !isVictoryRevealed && <MicroVictoryMoment />}
        {phase === 'mission-complete' && isVictoryRevealed && (
          <MandalaCompletionScreen
            xpEarned={missionXpTotal}
            focusScore={focusScore}
            persistenceScore={persistenceScore}
            currentStreak={currentStreak}
            journeyProgressPercent={journeyProgressPercent}
            neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
            neuralEvolutionAfterScore={neuralEvolutionAfterScore}
            analytics={levelAnalytics}
            report={visualIntelligenceReport}
            onContinueJourney={handleReturnToJourney}
            onReturnToJourney={handleReturnToJourney}
            continueLabel={continueLabel}
          />
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-[60] w-64 rounded-2xl border border-warning/30 bg-card p-4 shadow-lg">
          <p className="text-xs font-medium tracking-widest text-warning uppercase">Developer Testing Panel</p>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handleDevCompleteMission}>
            Complete Mission
          </Button>
          <Button variant="destructive" size="sm" className="mt-2 w-full" disabled={isResettingDev} onClick={handleDevReset}>
            {isResettingDev ? 'Resetting…' : 'Reset Mission'}
          </Button>
        </div>
      )}
    </>
  )
}
