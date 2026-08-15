'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { loadBestEssenceSprintStats, recordBestEssenceSprintStats } from '../pictorialEssenceSprintLocalHistory'
import { ROUNDS_PER_SESSION } from '../pictorialEssenceSprintDataset'
import { PictorialEssenceSprintSettings } from './PictorialEssenceSprintSettings'
import { PictorialEssenceSprintCanvas } from './PictorialEssenceSprintCanvas'
import { PictorialEssenceSprintCompleteScreen } from './PictorialEssenceSprintCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-pictorial-essence-sprint-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  variant: 'complete' | 'game-over'
  elapsedMs: number
  correctCount: number
  totalScore: number
  bestStreak: number
  fastestReactionMs: number | null
}

// Top-level orchestrator for High-Speed Pictorial Essence Sprint™
// (Arcade Hard Mode) — the second Right Brain Activation exercise,
// alongside Photographic Memory™. Deliberately does NOT use
// useReadingSession (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe an
// essence-recall sprint honestly); instead this calls useExerciseSession
// directly, matching every sibling gamified exercise's own precedent for
// a non-WPM advanced exercise. Two ways a session can end, persisted
// differently, both honestly: a genuine full clear (all
// ROUNDS_PER_SESSION rounds reached) calls recordCompletion; running out
// of lives first (Game Over) is treated exactly like any other abandoned
// attempt elsewhere in this project and calls recordExit instead — the
// session genuinely wasn't finished, so it's never marked complete.
export function PictorialEssenceSprintExperience(): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'pictorial-essence-sprint' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestAccuracyPercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestEssenceSprintStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function finalizeSession(
    variant: 'complete' | 'game-over',
    elapsedMs: number,
    correctCount: number,
    totalScore: number,
    bestStreak: number,
    fastestReactionMs: number | null,
  ): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = Math.round((correctCount / ROUNDS_PER_SESSION) * 100)
    setCompletedResult({ variant, elapsedMs, correctCount, totalScore, bestStreak, fastestReactionMs })
    setBestStats(recordBestEssenceSprintStats(BEST_STATS_STORAGE_KEY, { bestAccuracyPercent: accuracyPercent, bestStreak }))
    if (variant === 'complete') {
      void session.recordCompletion(elapsedMs)
    } else {
      void session.recordExit(elapsedMs)
    }
    setPhase('complete')
  }

  function handleComplete(
    elapsedMs: number,
    correctCount: number,
    totalScore: number,
    bestStreak: number,
    fastestReactionMs: number | null,
  ): void {
    finalizeSession('complete', elapsedMs, correctCount, totalScore, bestStreak, fastestReactionMs)
  }

  function handleGameOver(
    elapsedMs: number,
    correctCount: number,
    totalScore: number,
    bestStreak: number,
    fastestReactionMs: number | null,
  ): void {
    finalizeSession('game-over', elapsedMs, correctCount, totalScore, bestStreak, fastestReactionMs)
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('pictorial-essence-sprint', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <PictorialEssenceSprintSettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <PictorialEssenceSprintCompleteScreen
          backHref={getWizardAwareBackHref('pictorial-essence-sprint', LAB_HREF)}
        variant={completedResult.variant}
        elapsedMs={completedResult.elapsedMs}
        correctCount={completedResult.correctCount}
        totalScore={completedResult.totalScore}
        bestStreak={completedResult.bestStreak}
        fastestReactionMs={completedResult.fastestReactionMs}
        bestAccuracyPercentAllTime={bestStats.bestAccuracyPercent}
        bestStreakAllTime={bestStats.bestStreak}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  return (
    <PictorialEssenceSprintCanvas
      key={attemptNonce}
      onComplete={handleComplete}
      onGameOver={handleGameOver}
      onExitRequested={handleExitRequested}
    />
  )
}
