'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { loadBestEspStats, recordBestEspStats } from '../espZenerLocalHistory'
import { ZENER_DECK_SIZE } from '../espZenerDataset'
import { EspZenerTelepathySettings } from './EspZenerTelepathySettings'
import { EspZenerTelepathyCanvas } from './EspZenerTelepathyCanvas'
import { EspZenerTelepathyCompleteScreen } from './EspZenerTelepathyCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-esp-zener-telepathy-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  correctCount: number
  totalScore: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for ESP Zener Card Telepathy Sprint™ — the first
// Intuition Development exercise. Deliberately does NOT use
// useReadingSession (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe a
// guessing sprint honestly); instead this calls useExerciseSession
// directly, the same underlying primitive useReadingSession itself is
// built on, matching SchulteGridDrillExperience.tsx's own precedent for a
// non-WPM advanced exercise. Completion is unambiguous here: it means "all
// 25 cards in the deck were guessed," nothing else does — an abandoned
// attempt is never marked complete.
type EspZenerTelepathyExperienceProps = {
  // 21-Day Transformation Journey™ — additive, optional. When a caller
  // (QuantumJourneySession) supplies this, a "Continue Session →" action
  // appears alongside the real, unmodified CompleteScreen so the wizard
  // can advance to its next level, and receives this real attempt's
  // accuracy so it can persist it to domain_performance_sessions for
  // Smart Weakness Targeting™. Standalone usage (this prop omitted) is
  // byte-for-byte unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function EspZenerTelepathyExperience({ onComplete }: EspZenerTelepathyExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('esp-zener-telepathy-sprint', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'esp-zener-telepathy-sprint' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestAccuracyPercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestEspStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = Math.round((correctCount / ZENER_DECK_SIZE) * 100)
    setCompletedResult({ elapsedMs, correctCount, totalScore, bestStreak, accuracyPercent })
    setBestStats(recordBestEspStats(BEST_STATS_STORAGE_KEY, { bestAccuracyPercent: accuracyPercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('esp-zener-telepathy-sprint', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <EspZenerTelepathySettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <EspZenerTelepathyCompleteScreen
          elapsedMs={completedResult.elapsedMs}
          correctCount={completedResult.correctCount}
          totalScore={completedResult.totalScore}
          bestStreak={completedResult.bestStreak}
          bestAccuracyPercentAllTime={bestStats.bestAccuracyPercent}
          bestStreakAllTime={bestStats.bestStreak}
          onPlayAgain={handlePlayAgain}
        />
        {(curriculumSession.isActiveStep || onComplete) && (
          <div className="mx-auto mt-4 max-w-sm px-4">
            <Button type="button" size="lg" className="w-full rounded-full" onClick={() => (curriculumSession.isActiveStep ? curriculumSession.advance() : onComplete?.(completedResult.accuracyPercent))}>
              Continue Session →
            </Button>
          </div>
        )}
      </>
    )
  }

  return <EspZenerTelepathyCanvas key={attemptNonce} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
