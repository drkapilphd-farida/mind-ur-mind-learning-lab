'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { computeAccuracyPercent, type NumberFlashGridSize } from '../numberFlashGridEngine'
import { loadBestNumberFlashGridStats, recordBestNumberFlashGridStats } from '../numberFlashGridLocalHistory'
import { NumberFlashGridSettings } from './NumberFlashGridSettings'
import { NumberFlashGridCanvas } from './NumberFlashGridCanvas'
import { NumberFlashGridCompleteScreen } from './NumberFlashGridCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-number-flash-grid-best'
const DEFAULT_GRID_SIZE: NumberFlashGridSize = 4

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  totalCorrect: number
  totalDigits: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for Number Flash Grid™ — the second Right Brain
// Activation exercise. Deliberately does NOT use useReadingSession (its
// recordResult takes a ReadingSessionResult — averageWpm/targetWpm/
// wordsRead/totalWords — none of which describe a numerical flash-then-
// recall game honestly); instead this calls useExerciseSession directly,
// matching DotMemoryGridExperience.tsx's own precedent for a non-WPM
// advanced exercise. Completion is unambiguous here: it means "all 5
// rounds played," nothing else does — an abandoned attempt is never
// marked complete.
type NumberFlashGridExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. Mirrors
  // DotMemoryGridExperience.tsx's identical prop: when a caller supplies
  // this, a "Continue Session →" action appears alongside the real,
  // unmodified CompleteScreen, and receives this real attempt's accuracy.
  // Standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function NumberFlashGridExperience({ onComplete }: NumberFlashGridExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'number-flash-grid' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [gridSize, setGridSize] = useState<NumberFlashGridSize>(DEFAULT_GRID_SIZE)
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestNumberFlashGridStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, totalCorrect: number, totalDigits: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = computeAccuracyPercent(totalCorrect, totalDigits)
    setCompletedResult({ elapsedMs, totalCorrect, totalDigits, bestStreak, accuracyPercent })
    setBestStats(recordBestNumberFlashGridStats(BEST_STATS_STORAGE_KEY, { bestScorePercent: accuracyPercent, bestStreak }))
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
    return <NumberFlashGridSettings gridSize={gridSize} onSelectGridSize={setGridSize} onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <NumberFlashGridCompleteScreen
          elapsedMs={completedResult.elapsedMs}
          totalCorrect={completedResult.totalCorrect}
          totalDigits={completedResult.totalDigits}
          bestStreak={completedResult.bestStreak}
          bestScorePercentAllTime={bestStats.bestScorePercent}
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

  return <NumberFlashGridCanvas key={attemptNonce} gridSize={gridSize} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
