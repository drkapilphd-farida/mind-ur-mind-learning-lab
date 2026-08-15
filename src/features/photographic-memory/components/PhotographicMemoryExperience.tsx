'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { loadBestPhotographicMemoryStats, recordBestPhotographicMemoryStats } from '../photographicMemoryLocalHistory'
import { ROUNDS_PER_SESSION, type PhotographicMemoryCategoryFilter } from '../photographicMemoryDataset'
import { PhotographicMemorySettings } from './PhotographicMemorySettings'
import { PhotographicMemoryCanvas } from './PhotographicMemoryCanvas'
import { PhotographicMemoryCompleteScreen } from './PhotographicMemoryCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-photographic-memory-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  correctCount: number
  totalScore: number
  bestStreak: number
  accuracyPercent: number
}

// Top-level orchestrator for Photographic Memory™ — a rebrand and
// multi-category expansion of the retired mandala-photographic-dash
// (now one of 4 categories). Deliberately does NOT use useReadingSession
// (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe a
// visual-recall sprint honestly); instead this calls useExerciseSession
// directly, matching every sibling gamified exercise's own precedent for
// a non-WPM advanced exercise. Completion is unambiguous here: it means
// "all ROUNDS_PER_SESSION rounds were recalled," nothing else does — an
// abandoned attempt is never marked complete.
type PhotographicMemoryExperienceProps = {
  // 21-Day Transformation Journey™ — additive, optional. See
  // EspZenerTelepathyExperience.tsx's identical prop for the full
  // rationale; standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function PhotographicMemoryExperience({ onComplete }: PhotographicMemoryExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('photographic-memory', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'photographic-memory' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [categoryFilter, setCategoryFilter] = useState<PhotographicMemoryCategoryFilter>('all')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestPhotographicMemoryStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, correctCount: number, totalScore: number, bestStreak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const scorePercent = Math.round((correctCount / ROUNDS_PER_SESSION) * 100)
    setCompletedResult({ elapsedMs, correctCount, totalScore, bestStreak, accuracyPercent: scorePercent })
    setBestStats(recordBestPhotographicMemoryStats(BEST_STATS_STORAGE_KEY, { bestScorePercent: scorePercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('photographic-memory', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return (
      <PhotographicMemorySettings categoryFilter={categoryFilter} onSelectCategoryFilter={setCategoryFilter} onStart={handleStart} />
    )
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <PhotographicMemoryCompleteScreen
          backHref={getWizardAwareBackHref('photographic-memory', LAB_HREF)}
          elapsedMs={completedResult.elapsedMs}
          correctCount={completedResult.correctCount}
          totalScore={completedResult.totalScore}
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

  return (
    <PhotographicMemoryCanvas
      key={attemptNonce}
      categoryFilter={categoryFilter}
      onComplete={handleComplete}
      onExitRequested={handleExitRequested}
    />
  )
}
