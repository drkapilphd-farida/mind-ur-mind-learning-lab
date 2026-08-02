'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { loadBestAfterImageGazingStats, recordBestAfterImageGazingStats } from '../afterImageGazingLocalHistory'
import { ROUNDS_PER_SESSION, type GazeCategorySelection } from '../afterImageGazingDataset'
import { AfterImageGazingSettings } from './AfterImageGazingSettings'
import { AfterImageGazingCanvas } from './AfterImageGazingCanvas'
import { AfterImageGazingCompleteScreen } from './AfterImageGazingCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-after-image-gazing-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  clearCount: number
  totalScore: number
  bestStreak: number
}

// Top-level orchestrator for After-Image / Complementary Color Gazing™
// — the fourth Right Brain Activation exercise, alongside Photographic
// Memory™, High-Speed Pictorial Essence Sprint™, and Hemispheric
// Color-Word Sync Grid™. Deliberately does NOT use useReadingSession
// (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe a
// gazing session honestly); instead this calls useExerciseSession
// directly, matching every sibling gamified exercise's own precedent for
// a non-WPM advanced exercise. There is only one way this session ends
// (a full run through every round — no lives/Game Over branch, since
// there is no "wrong" way to honestly report your own perception), so
// recordCompletion is the only outcome once the session finishes; an
// early Exit is still recorded via recordExit, exactly like every other
// exercise in this project treats an abandoned attempt.
export function AfterImageGazingExperience(): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'after-image-gazing' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [categorySelection, setCategorySelection] = useState<GazeCategorySelection>('master')
  const [bestStats, setBestStats] = useState({ bestClarityPercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestAfterImageGazingStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(selectedCategory: GazeCategorySelection): void {
    hasRecordedRef.current = false
    setCategorySelection(selectedCategory)
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, clearCount: number, totalScore: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const clarityPercent = Math.round((clearCount / ROUNDS_PER_SESSION) * 100)
    setCompletedResult({ elapsedMs, clearCount, totalScore, bestStreak })
    setBestStats(recordBestAfterImageGazingStats(BEST_STATS_STORAGE_KEY, { bestClarityPercent: clarityPercent, bestStreak }))
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
    return <AfterImageGazingSettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <AfterImageGazingCompleteScreen
        elapsedMs={completedResult.elapsedMs}
        clearCount={completedResult.clearCount}
        totalScore={completedResult.totalScore}
        bestStreak={completedResult.bestStreak}
        bestClarityPercentAllTime={bestStats.bestClarityPercent}
        bestStreakAllTime={bestStats.bestStreak}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  return (
    <AfterImageGazingCanvas
      key={attemptNonce}
      categorySelection={categorySelection}
      onComplete={handleComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
