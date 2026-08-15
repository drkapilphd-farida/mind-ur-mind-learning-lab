'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import {
  loadBestColorSceneTransformationStats,
  recordBestColorSceneTransformationStats,
} from '../colorSceneTransformationLocalHistory'
import { ROUNDS_PER_SESSION } from '../colorSceneTransformationDataset'
import { ColorSceneTransformationSettings } from './ColorSceneTransformationSettings'
import { ColorSceneTransformationCanvas } from './ColorSceneTransformationCanvas'
import { ColorSceneTransformationCompleteScreen } from './ColorSceneTransformationCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-color-scene-transformation-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  correctCount: number
  totalScore: number
  bestStreak: number
  fastestReactionMs: number | null
  totalFocusTimeMs: number
  accuracyPercent: number
}

// Top-level orchestrator for Color & Scene Transformation Journey™ —
// the second Visualization Development exercise, alongside Quantum
// Mental Object Rotation™. Deliberately does NOT use useReadingSession
// (its recordResult takes a ReadingSessionResult —
// averageWpm/targetWpm/wordsRead/totalWords — none of which describe a
// scene-transformation sprint honestly); instead this calls
// useExerciseSession directly, matching every sibling gamified
// exercise's own precedent for a non-WPM advanced exercise. There is
// only one way this session ends (a full 16-round run — no lives/Game
// Over branch), so recordCompletion is the only honest outcome once the
// journey finishes; an early Exit is still recorded via recordExit,
// exactly like every other exercise in this project treats an
// abandoned attempt.
type ColorSceneTransformationExperienceProps = {
  // 21-Day Transformation Journey™ — additive, optional. See
  // EspZenerTelepathyExperience.tsx's identical prop for the full
  // rationale; standalone usage (this prop omitted) is unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function ColorSceneTransformationExperience({ onComplete }: ColorSceneTransformationExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('color-scene-transformation', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'color-scene-transformation' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestAccuracyPercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestColorSceneTransformationStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(
    elapsedMs: number,
    correctCount: number,
    totalScore: number,
    bestStreak: number,
    fastestReactionMs: number | null,
    totalFocusTimeMs: number,
  ): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = Math.round((correctCount / ROUNDS_PER_SESSION) * 100)
    setCompletedResult({ elapsedMs, correctCount, totalScore, bestStreak, fastestReactionMs, totalFocusTimeMs, accuracyPercent })
    setBestStats(recordBestColorSceneTransformationStats(BEST_STATS_STORAGE_KEY, { bestAccuracyPercent: accuracyPercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('color-scene-transformation', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <ColorSceneTransformationSettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <ColorSceneTransformationCompleteScreen
          backHref={getWizardAwareBackHref('color-scene-transformation', LAB_HREF)}
          elapsedMs={completedResult.elapsedMs}
          correctCount={completedResult.correctCount}
          totalScore={completedResult.totalScore}
          bestStreak={completedResult.bestStreak}
          fastestReactionMs={completedResult.fastestReactionMs}
          totalFocusTimeMs={completedResult.totalFocusTimeMs}
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

  return <ColorSceneTransformationCanvas key={attemptNonce} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
