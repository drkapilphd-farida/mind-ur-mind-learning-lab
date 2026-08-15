'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { getHologramGoalById, HOLOGRAM_GOALS } from '../hologramDatabase'
import type { NarrationLanguage } from '../hologramVoiceSelection'
import {
  SENSORY_HOLOGRAM_BUILDER_STORAGE_KEY,
  loadBestSensoryHologramBuilderStats,
  recordSensoryHologramBuilderCompletion,
  recordSensoryHologramBuilderEarlyExit,
} from '../sensoryHologramBuilderLocalHistory'
import { SensoryHologramBuilderSettings } from './SensoryHologramBuilderSettings'
import { SensoryHologramBuilderCanvas } from './SensoryHologramBuilderCanvas'
import { SensoryHologramBuilderReflectionScreen } from './SensoryHologramBuilderReflectionScreen'
import { SensoryHologramBuilderCompleteScreen } from './SensoryHologramBuilderCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = SENSORY_HOLOGRAM_BUILDER_STORAGE_KEY
const DEFAULT_GOAL_ID = HOLOGRAM_GOALS[0]!.id

type ExperiencePhase = 'settings' | 'playing' | 'reflection' | 'complete'

type CompletedResult = {
  elapsedMs: number
  immersionScorePercent: number
  streak: number
}

// Top-level orchestrator for Sensory Hologram Builder™ — a Visualization
// Hub exercise. Deliberately does NOT use useReadingSession (its
// recordResult takes a ReadingSessionResult — averageWpm/targetWpm/
// wordsRead/totalWords — none of which describe a guided sensory
// visualization honestly); instead this calls useExerciseSession
// directly, matching every other non-WPM advanced exercise's own
// precedent. Completion is unambiguous here: it means "reached the
// reflection screen and answered all 3 questions," nothing else does —
// an abandoned attempt is always recorded as an early exit
// (recordSensoryHologramBuilderEarlyExit), never as a completion.
type SensoryHologramBuilderExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. Mirrors every other advanced
  // exercise's identical prop: when a caller supplies this, a "Continue
  // Session →" action appears alongside the real, unmodified
  // CompleteScreen, and receives this real attempt's Sensory Immersion
  // Score as its accuracyPercent. Standalone usage (this prop omitted)
  // is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function SensoryHologramBuilderExperience({ onComplete }: SensoryHologramBuilderExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('sensory-hologram-builder', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'sensory-hologram-builder' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [language, setLanguage] = useState<NarrationLanguage>('en')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [journeyElapsedMs, setJourneyElapsedMs] = useState(0)
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedExitRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestSensoryHologramBuilderStats(BEST_STATS_STORAGE_KEY))
  }, [])

  const activeGoal = getHologramGoalById(selectedGoalId ?? DEFAULT_GOAL_ID) ?? HOLOGRAM_GOALS[0]!

  function handleStart(): void {
    if (selectedGoalId === null) return
    hasRecordedExitRef.current = false
    session.start()
    setPhase('playing')
  }

  // The guided journey itself finished naturally (all 5 phases spoken) —
  // this is NOT yet a "completion" for local-history purposes; the
  // reflection still has to happen first.
  function handleJourneyComplete(elapsedMs: number): void {
    setJourneyElapsedMs(elapsedMs)
    setPhase('reflection')
  }

  function handleReflectionComplete(immersionScorePercent: number): void {
    const record = recordSensoryHologramBuilderCompletion(BEST_STATS_STORAGE_KEY, immersionScorePercent)
    setBestStats({ bestScorePercent: record.bestScorePercent, bestStreak: record.bestStreak })
    setCompletedResult({ elapsedMs: journeyElapsedMs, immersionScorePercent, streak: record.currentStreak })
    void session.recordCompletion(journeyElapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    if (!hasRecordedExitRef.current) {
      hasRecordedExitRef.current = true
      recordSensoryHologramBuilderEarlyExit(BEST_STATS_STORAGE_KEY)
      void session.recordExit(elapsedMs)
    }
    router.push(getCurriculumSmartExitHref('sensory-hologram-builder', LAB_HREF))
  }

  function handlePlayAgain(): void {
    setCompletedResult(null)
    setSelectedGoalId(null)
    setAttemptNonce((nonce) => nonce + 1)
    setPhase('settings')
  }

  if (phase === 'settings') {
    return (
      <SensoryHologramBuilderSettings
        language={language}
        onSelectLanguage={setLanguage}
        selectedGoalId={selectedGoalId}
        onSelectGoal={setSelectedGoalId}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'reflection') {
    return (
      <SensoryHologramBuilderReflectionScreen
        language={language}
        onComplete={handleReflectionComplete}
        onExit={() => handleExitRequested(journeyElapsedMs)}
      />
    )
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <SensoryHologramBuilderCompleteScreen
          backHref={getWizardAwareBackHref('sensory-hologram-builder', LAB_HREF)}
          goalTitle={language === 'hi' ? activeGoal.titleHi : activeGoal.titleEn}
          elapsedMs={completedResult.elapsedMs}
          immersionScorePercent={completedResult.immersionScorePercent}
          streak={completedResult.streak}
          bestScorePercentAllTime={bestStats.bestScorePercent}
          bestStreakAllTime={bestStats.bestStreak}
          onPlayAgain={handlePlayAgain}
        />
        {(curriculumSession.isActiveStep || onComplete) && (
          <div className="mx-auto mt-4 max-w-sm px-4">
            <Button type="button" size="lg" className="w-full rounded-full" onClick={() => (curriculumSession.isActiveStep ? curriculumSession.advance() : onComplete?.(completedResult.immersionScorePercent))}>
              Continue Session →
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <SensoryHologramBuilderCanvas
      key={attemptNonce}
      goal={activeGoal}
      language={language}
      onComplete={handleJourneyComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
