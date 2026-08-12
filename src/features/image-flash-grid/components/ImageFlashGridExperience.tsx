'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { computeAccuracyPercent, type ImageFlashGridSize } from '../imageFlashGridEngine'
import { loadBestImageFlashGridStats, recordBestImageFlashGridStats } from '../imageFlashGridLocalHistory'
import { ImageFlashGridSettings } from './ImageFlashGridSettings'
import { ImageFlashGridCanvas } from './ImageFlashGridCanvas'
import { ImageFlashGridCompleteScreen } from './ImageFlashGridCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-image-flash-grid-best'
const DEFAULT_GRID_SIZE: ImageFlashGridSize = 4

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  totalCorrect: number
  totalIcons: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for Image Flash Grid™ — the fourth and final
// Right Brain Activation flash-grid exercise. Deliberately does NOT use
// useReadingSession (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe a
// pure photographic icon flash-then-recall game honestly); instead this
// calls useExerciseSession directly, matching WordFlashGridExperience.tsx's
// / NumberFlashGridExperience.tsx's own precedent for a non-WPM advanced
// exercise. Completion is unambiguous here: it means "all 5 rounds
// played," nothing else does — an abandoned attempt is never marked
// complete.
type ImageFlashGridExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. Mirrors
  // WordFlashGridExperience.tsx's identical prop: when a caller supplies
  // this, a "Continue Session →" action appears alongside the real,
  // unmodified CompleteScreen, and receives this real attempt's accuracy.
  // Standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function ImageFlashGridExperience({ onComplete }: ImageFlashGridExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('image-flash-grid', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'image-flash-grid' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [gridSize, setGridSize] = useState<ImageFlashGridSize>(DEFAULT_GRID_SIZE)
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestImageFlashGridStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, totalCorrect: number, totalIcons: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = computeAccuracyPercent(totalCorrect, totalIcons)
    setCompletedResult({ elapsedMs, totalCorrect, totalIcons, bestStreak, accuracyPercent })
    setBestStats(recordBestImageFlashGridStats(BEST_STATS_STORAGE_KEY, { bestScorePercent: accuracyPercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('image-flash-grid', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <ImageFlashGridSettings gridSize={gridSize} onSelectGridSize={setGridSize} onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <ImageFlashGridCompleteScreen
          elapsedMs={completedResult.elapsedMs}
          totalCorrect={completedResult.totalCorrect}
          totalIcons={completedResult.totalIcons}
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

  return <ImageFlashGridCanvas key={attemptNonce} gridSize={gridSize} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
