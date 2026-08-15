'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { computeAccuracyPercent, type DotMemoryGridSize } from '../dotMemoryGridEngine'
import { loadBestDotMemoryGridStats, recordBestDotMemoryGridStats } from '../dotMemoryGridLocalHistory'
import { DotMemoryGridSettings } from './DotMemoryGridSettings'
import { DotMemoryGridCanvas } from './DotMemoryGridCanvas'
import { DotMemoryGridCompleteScreen } from './DotMemoryGridCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-dot-memory-grid-best'
const DEFAULT_GRID_SIZE: DotMemoryGridSize = 5

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  totalCorrect: number
  totalDots: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for Dot Memory Grid™ — a Right Brain Activation
// exercise. Deliberately does NOT use useReadingSession (its recordResult
// takes a ReadingSessionResult — averageWpm/targetWpm/wordsRead/totalWords
// — none of which describe a spatial memorize-then-tap game honestly);
// instead this calls useExerciseSession directly, matching
// SchulteGridDrillExperience.tsx's / EspZenerTelepathyExperience.tsx's own
// precedent for a non-WPM advanced exercise. Completion is unambiguous
// here: it means "all 5 rounds played," nothing else does — an abandoned
// attempt is never marked complete.
type DotMemoryGridExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. Mirrors
  // EspZenerTelepathyExperience.tsx's identical prop: when a caller
  // supplies this, a "Continue Session →" action appears alongside the
  // real, unmodified CompleteScreen, and receives this real attempt's
  // accuracy. Standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function DotMemoryGridExperience({ onComplete }: DotMemoryGridExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('dot-memory-grid', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'dot-memory-grid' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [gridSize, setGridSize] = useState<DotMemoryGridSize>(DEFAULT_GRID_SIZE)
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestDotMemoryGridStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, totalCorrect: number, totalDots: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = computeAccuracyPercent(totalCorrect, totalDots)
    setCompletedResult({ elapsedMs, totalCorrect, totalDots, bestStreak, accuracyPercent })
    setBestStats(recordBestDotMemoryGridStats(BEST_STATS_STORAGE_KEY, { bestScorePercent: accuracyPercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('dot-memory-grid', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <DotMemoryGridSettings gridSize={gridSize} onSelectGridSize={setGridSize} onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <DotMemoryGridCompleteScreen
          backHref={getWizardAwareBackHref('dot-memory-grid', LAB_HREF)}
          elapsedMs={completedResult.elapsedMs}
          totalCorrect={completedResult.totalCorrect}
          totalDots={completedResult.totalDots}
          bestStreak={completedResult.bestStreak}
          bestScorePercentAllTime={bestStats.bestScorePercent}
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

  return <DotMemoryGridCanvas key={attemptNonce} gridSize={gridSize} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
