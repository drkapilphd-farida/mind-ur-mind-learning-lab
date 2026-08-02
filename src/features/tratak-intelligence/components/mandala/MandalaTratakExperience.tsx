'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import {
  completeTratakMissionSession,
  type CompleteTratakMissionSessionStats,
  type VisualIntelligenceReport,
} from '../../actions/completeTratakMissionSession'
import { devResetMandalaTratakMission, devCompleteMandalaMission } from '@/lib/exercises/actions/devMandalaTratakTools'
import { isTratakDevUnlockEnabled } from '../../tratakDevUnlock'
import { MANDALA_LEVELS, type MandalaLevel, type MandalaLevelOrder } from '../../mandalaLevels'
import {
  GAZE_STABILITY_OPTIONS,
  AFTER_IMAGE_CLARITY_OPTIONS,
  AFTER_IMAGE_DURATION_OPTIONS,
  CENTER_FOCUS_EASE_OPTIONS,
  type ImageFixationAnalyzerAnswers,
} from '../../imageFixation/imageFixationReflection'
import type { VisualAnalytics } from '../../imageFixation/visualAnalytics'
import { MANDALA_OBSERVATION_QUESTIONS } from '../../mandalaObservationQuestions'
import { IntelligentFocusAnalyzerScreen } from '../../imageFixation/IntelligentFocusAnalyzerScreen'
import { ObservationIntelligenceScreen } from './ObservationIntelligenceScreen'
import { MandalaMissionOverviewScreen } from './MandalaMissionOverviewScreen'
import { MandalaPreparationScreen } from './MandalaPreparationScreen'
import { MandalaSessionScreen } from './MandalaSessionScreen'
import { MandalaEyesClosedScreen } from './MandalaEyesClosedScreen'
import { MandalaLevelCompleteScreen } from './MandalaLevelCompleteScreen'
import { MandalaCompletionScreen } from './MandalaCompletionScreen'
import { MandalaDevPanel } from './MandalaDevPanel'

type MandalaPhase =
  | 'mission-overview'
  | 'preparation'
  | 'countdown'
  | 'session'
  | 'eyes-closed'
  | 'reflection'
  | 'observation-intelligence'
  | 'level-complete'
  | 'mission-complete'

const EYES_CLOSED_SECONDS = 20

function levelDuration(order: MandalaLevelOrder): number {
  return MANDALA_LEVELS.find((level) => level.order === order)?.durationSeconds ?? 45
}

type MandalaTratakExperienceProps = {
  // Real lab-wide Neural Evolution Index™ read once at page load — used as
  // the "before" side of the Visual Intelligence Report™'s honest delta.
  neuralEvolutionOverallScore: number
  initialLevels: readonly MandalaLevel[]
  initialCurrentLevelOrder: MandalaLevelOrder | null
  // When provided (e.g. embedded inside Visual Activation™'s guided
  // sequence), called instead of navigating to the standalone Tratak hub —
  // omitted, this component's standalone route behaves exactly as before.
  onReturnToJourney?: () => void
}

export function MandalaTratakExperience({
  neuralEvolutionOverallScore: neuralEvolutionBeforeScore,
  initialLevels,
  initialCurrentLevelOrder,
  onReturnToJourney,
}: MandalaTratakExperienceProps): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<MandalaPhase>('mission-overview')
  const [levels, setLevels] = useState<readonly MandalaLevel[]>(initialLevels)
  const [currentLevelOrder, setCurrentLevelOrder] = useState<MandalaLevelOrder | null>(initialCurrentLevelOrder)
  const [selectedLevelOrder, setSelectedLevelOrder] = useState<MandalaLevelOrder | null>(null)
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
  // Automatically unlocked in development (or when NEXT_PUBLIC_DEV_UNLOCK=true)
  // so the whole journey can be tested without a manual toggle click —
  // still overridable via the existing Dev Panel switch.
  const [devBypassLocks, setDevBypassLocks] = useState(() => isTratakDevUnlockEnabled())
  const prefersReducedMotion = usePrefersReducedMotion()
  const isSavingRef = useRef(false)

  const handleSelectLevel = useCallback((order: number) => {
    setSelectedLevelOrder(order as MandalaLevelOrder)
    setPhase('preparation')
  }, [])
  const handleReady = useCallback(() => setPhase('countdown'), [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('eyes-closed'), [])
  const handleEyesClosedComplete = useCallback(() => setPhase('reflection'), [])

  // Sprint 10E: the Analyzer no longer saves directly — its real answers are
  // held until Observation Intelligence™ is answered too, then both are
  // submitted together in a single save (see handleObservationContinue).
  const handleAnalyzerContinue = useCallback((answers: ImageFixationAnalyzerAnswers) => {
    setPendingAnalyzerAnswers(answers)
    setPhase('observation-intelligence')
  }, [])

  const applySessionStats = useCallback((stats: CompleteTratakMissionSessionStats, xpEarned: number) => {
    setLevels(stats.mandalaLevels)
    setCurrentLevelOrder(stats.mandalaCurrentLevelNumber)
    setLevelXpEarned(xpEarned)
    setCompletedLevelsCount(stats.mandalaLevels.filter((level) => level.status === 'completed').length)
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
      if (isSavingRef.current || selectedLevelOrder === null || pendingAnalyzerAnswers === null) return
      isSavingRef.current = true

      void completeTratakMissionSession({
        missionId: 'mandala-persistence',
        durationSeconds: levelDuration(selectedLevelOrder) + EYES_CLOSED_SECONDS,
        reflectionResponse: null,
        observationNotes: null,
        analyzerAnswers: pendingAnalyzerAnswers,
        observationAnswers,
        levelNumber: selectedLevelOrder,
        imageId: null,
        measuredAfterImageDurationSeconds: null,
      }).then((result) => {
        isSavingRef.current = false
        if (!result.success) return
        applySessionStats(result.stats, result.xpEarned)
      })
    },
    [selectedLevelOrder, pendingAnalyzerAnswers, applySessionStats],
  )

  const handleContinueMission = useCallback(() => {
    setSelectedLevelOrder(null)
    setPendingAnalyzerAnswers(null)
    setVisualIntelligenceReport(null)
    setPhase('mission-overview')
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
    void devResetMandalaTratakMission().then(() => {
      setLevels(initialLevels.map((level) => ({ ...level, status: level.order === 1 ? 'unlocked' : 'locked' })))
      setCurrentLevelOrder(1)
      setSelectedLevelOrder(null)
      setPhase('mission-overview')
      router.refresh()
    })
  }, [initialLevels, router])

  const handleDevJumpToLevel = useCallback((order: number) => {
    setSelectedLevelOrder(order as MandalaLevelOrder)
    setPhase('preparation')
  }, [])

  // Purely client-side reset — no DB call, no data loss. Distinct from
  // "Reset Mission" (which really deletes saved progress): this only snaps
  // the in-progress UI back to the mission overview.
  const handleDevClearSession = useCallback(() => {
    setSelectedLevelOrder(null)
    setPendingAnalyzerAnswers(null)
    setLevelXpEarned(0)
    setLevelAnalytics(null)
    setVisualIntelligenceReport(null)
    setPhase('mission-overview')
  }, [])

  // Completes every remaining level via the real save pipeline with
  // disclosed synthetic answers (devMandalaTratakTools.ts) — reuses the same
  // applySessionStats path a real session would take.
  const handleDevCompleteMission = useCallback(() => {
    void devCompleteMandalaMission().then((result) => {
      if (!result.success) return
      applySessionStats(result.stats, result.xpEarned)
    })
  }, [applySessionStats])

  // Fills and submits whichever question screen is currently showing with
  // real, randomly-selected options — never a fabricated result, since it
  // flows through the exact same handlers a human answering the UI would.
  const handleDevRandomAnswers = useCallback(() => {
    if (phase === 'reflection') {
      const randomAnswers: ImageFixationAnalyzerAnswers = {
        gazeStability: GAZE_STABILITY_OPTIONS[Math.floor(Math.random() * GAZE_STABILITY_OPTIONS.length)]!.value,
        afterImageClarity: AFTER_IMAGE_CLARITY_OPTIONS[Math.floor(Math.random() * AFTER_IMAGE_CLARITY_OPTIONS.length)]!.value,
        afterImageDuration: AFTER_IMAGE_DURATION_OPTIONS[Math.floor(Math.random() * AFTER_IMAGE_DURATION_OPTIONS.length)]!.value,
        centerFocusEase: CENTER_FOCUS_EASE_OPTIONS[Math.floor(Math.random() * CENTER_FOCUS_EASE_OPTIONS.length)]!.value,
        notes: null,
      }
      handleAnalyzerContinue(randomAnswers)
    } else if (phase === 'observation-intelligence' && selectedLevelOrder !== null) {
      const questionSet = MANDALA_OBSERVATION_QUESTIONS[selectedLevelOrder]
      const randomObservationAnswers = Object.fromEntries(
        questionSet.questions.map((question) => [question.id, question.options[Math.floor(Math.random() * question.options.length)]!.id]),
      )
      handleObservationContinue(randomObservationAnswers)
    }
  }, [phase, selectedLevelOrder, handleAnalyzerContinue, handleObservationContinue])

  const handleDevGoToReport = useCallback(() => {
    router.push('/labs/visual-intelligence/tratak/mandala/reports')
  }, [router])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''
  const isFullScreenPhase = phase === 'session' || phase === 'eyes-closed'

  return (
    <>
      <div key={phase} className={cn(!isFullScreenPhase && 'mx-auto max-w-2xl px-6 py-16', !isFullScreenPhase && fadeClass)}>
        {phase === 'mission-overview' && (
          <MandalaMissionOverviewScreen
            levels={levels}
            currentLevelOrder={currentLevelOrder}
            devBypassLocks={devBypassLocks}
            onSelectLevel={handleSelectLevel}
          />
        )}
        {phase === 'preparation' && <MandalaPreparationScreen onReady={handleReady} />}
        {phase === 'countdown' && (
          <div className="flex justify-center">
            <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Begin" />
          </div>
        )}
        {phase === 'session' && selectedLevelOrder !== null && (
          <MandalaSessionScreen levelOrder={selectedLevelOrder} durationSeconds={levelDuration(selectedLevelOrder)} onComplete={handleSessionComplete} />
        )}
        {phase === 'eyes-closed' && <MandalaEyesClosedScreen onComplete={handleEyesClosedComplete} />}
        {phase === 'reflection' && <IntelligentFocusAnalyzerScreen onContinue={handleAnalyzerContinue} />}
        {phase === 'observation-intelligence' && selectedLevelOrder !== null && (
          <ObservationIntelligenceScreen levelOrder={selectedLevelOrder} onContinue={handleObservationContinue} />
        )}
        {phase === 'level-complete' && selectedLevelOrder !== null && (
          <MandalaLevelCompleteScreen
            levelOrder={selectedLevelOrder}
            xpEarned={levelXpEarned}
            completedLevelsCount={completedLevelsCount}
            totalLevels={MANDALA_LEVELS.length}
            analytics={levelAnalytics}
            report={visualIntelligenceReport}
            journeyProgressPercent={journeyProgressPercent}
            neuralEvolutionBeforeScore={neuralEvolutionBeforeScore}
            neuralEvolutionAfterScore={neuralEvolutionAfterScore}
            onContinue={handleContinueMission}
          />
        )}
        {phase === 'mission-complete' && (
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
          />
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <MandalaDevPanel
          devBypassLocks={devBypassLocks}
          onToggleBypassLocks={setDevBypassLocks}
          onReset={handleDevReset}
          onJumpToLevel={handleDevJumpToLevel}
          onClearSession={handleDevClearSession}
          onCompleteMission={handleDevCompleteMission}
          canRandomAnswers={phase === 'reflection' || phase === 'observation-intelligence'}
          onRandomAnswers={handleDevRandomAnswers}
          onGoToReport={handleDevGoToReport}
        />
      )}
    </>
  )
}
