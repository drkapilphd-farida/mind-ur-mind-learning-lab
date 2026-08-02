'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { loadBestQuantumGridStats, recordBestQuantumGridStats } from '../quantumHiddenTargetGridLocalHistory'
import { GRID_SIZE } from '../quantumHiddenTargetGridDataset'
import { QuantumHiddenTargetGridSettings } from './QuantumHiddenTargetGridSettings'
import { QuantumHiddenTargetGridCanvas } from './QuantumHiddenTargetGridCanvas'
import { QuantumHiddenTargetGridCompleteScreen } from './QuantumHiddenTargetGridCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-quantum-hidden-target-grid-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  correctCount: number
  totalEnergy: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for Quantum Hidden Target Grid™ — the second
// Intuition Development exercise. Deliberately does NOT use
// useReadingSession (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe a
// guessing sprint honestly); instead this calls useExerciseSession
// directly, matching EspZenerTelepathyExperience.tsx/
// SchulteGridDrillExperience.tsx's own precedent for a non-WPM advanced
// exercise. Completion is unambiguous here: it means "all GRID_SIZE
// rounds were guessed," nothing else does — an abandoned attempt is
// never marked complete.
type QuantumHiddenTargetGridExperienceProps = {
  // 21-Day Transformation Journey™ — additive, optional. See
  // EspZenerTelepathyExperience.tsx's identical prop for the full
  // rationale; standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function QuantumHiddenTargetGridExperience({ onComplete }: QuantumHiddenTargetGridExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'quantum-hidden-target-grid' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestAccuracyPercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestQuantumGridStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, correctCount: number, totalEnergy: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = Math.round((correctCount / GRID_SIZE) * 100)
    setCompletedResult({ elapsedMs, correctCount, totalEnergy, bestStreak, accuracyPercent })
    setBestStats(recordBestQuantumGridStats(BEST_STATS_STORAGE_KEY, { bestAccuracyPercent: accuracyPercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(LAB_HREF)
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <QuantumHiddenTargetGridSettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <QuantumHiddenTargetGridCompleteScreen
          elapsedMs={completedResult.elapsedMs}
          correctCount={completedResult.correctCount}
          totalEnergy={completedResult.totalEnergy}
          bestStreak={completedResult.bestStreak}
          bestAccuracyPercentAllTime={bestStats.bestAccuracyPercent}
          bestStreakAllTime={bestStats.bestStreak}
          onPlayAgain={handlePlayAgain}
        />
        {onComplete && (
          <div className="mx-auto mt-4 max-w-sm px-4">
            <Button type="button" size="lg" className="w-full rounded-full" onClick={() => onComplete(completedResult.accuracyPercent)}>
              Continue Session →
            </Button>
          </div>
        )}
      </>
    )
  }

  return <QuantumHiddenTargetGridCanvas key={attemptNonce} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
