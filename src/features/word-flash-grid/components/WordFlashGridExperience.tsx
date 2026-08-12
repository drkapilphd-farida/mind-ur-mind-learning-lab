'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { computeAccuracyPercent, type WordFlashGridSize } from '../wordFlashGridEngine'
import { loadBestWordFlashGridStats, recordBestWordFlashGridStats } from '../wordFlashGridLocalHistory'
import { WordFlashGridSettings } from './WordFlashGridSettings'
import { WordFlashGridCanvas } from './WordFlashGridCanvas'
import { WordFlashGridCompleteScreen } from './WordFlashGridCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-word-flash-grid-best'
const DEFAULT_GRID_SIZE: WordFlashGridSize = 4

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  totalCorrect: number
  totalWords: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for Word Flash Grid™ — the third Right Brain
// Activation exercise. Deliberately does NOT use useReadingSession (its
// recordResult takes a ReadingSessionResult — averageWpm/targetWpm/
// wordsRead/totalWords — none of which describe a visual-linguistic
// flash-then-recall game honestly); instead this calls useExerciseSession
// directly, matching NumberFlashGridExperience.tsx's / DotMemoryGridExperience.tsx's
// own precedent for a non-WPM advanced exercise. Completion is unambiguous
// here: it means "all 5 rounds played," nothing else does — an abandoned
// attempt is never marked complete.
type WordFlashGridExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. Mirrors
  // NumberFlashGridExperience.tsx's identical prop: when a caller supplies
  // this, a "Continue Session →" action appears alongside the real,
  // unmodified CompleteScreen, and receives this real attempt's accuracy.
  // Standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function WordFlashGridExperience({ onComplete }: WordFlashGridExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'word-flash-grid' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [gridSize, setGridSize] = useState<WordFlashGridSize>(DEFAULT_GRID_SIZE)
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestWordFlashGridStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, totalCorrect: number, totalWords: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = computeAccuracyPercent(totalCorrect, totalWords)
    setCompletedResult({ elapsedMs, totalCorrect, totalWords, bestStreak, accuracyPercent })
    setBestStats(recordBestWordFlashGridStats(BEST_STATS_STORAGE_KEY, { bestScorePercent: accuracyPercent, bestStreak }))
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
    return <WordFlashGridSettings gridSize={gridSize} onSelectGridSize={setGridSize} onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <WordFlashGridCompleteScreen
          elapsedMs={completedResult.elapsedMs}
          totalCorrect={completedResult.totalCorrect}
          totalWords={completedResult.totalWords}
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

  return <WordFlashGridCanvas key={attemptNonce} gridSize={gridSize} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
