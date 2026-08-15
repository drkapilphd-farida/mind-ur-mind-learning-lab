'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { getCurriculumSmartExitHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { Button } from '@/components/ui/button'
import { loadBestBrainGymStats, recordBestBrainGymStats } from '../brainGymLocalHistory'
import { BrainGymDrillSettings } from './BrainGymDrillSettings'
import { BrainGymDrillCanvas } from './BrainGymDrillCanvas'
import { BrainGymDrillCompleteScreen } from './BrainGymDrillCompleteScreen'
import type { BrainGymDrillConfig } from '../types'

const LAB_HREF = '/labs/quantum-speed-reading'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  correctCount: number
  bestStreak: number
  averageReactionMs: number
}

type BrainGymDrillExperienceProps = {
  config: BrainGymDrillConfig
  // 21-Day Transformation Journey™ — additive, optional, same pattern as
  // every other embeddable exercise this session (EspZenerTelepathyExperience
  // et al.). No accuracy argument: Brain Gym drills aren't one of the 3
  // tracked domains (Intuition/Right Brain/Visualisation), so nothing
  // here ever reaches domain_performance_sessions.
  onComplete?: () => void
  // 30-Day Curriculum In-Page Master Player™ — additive, optional. When
  // supplied, replaces the default "back to lab root" destination for a
  // mid-drill exit. This was previously missing entirely (a real,
  // confirmed bug: every one of the 5 catalog exercises that share this
  // engine dumped straight to `/labs/quantum-speed-reading` on exit,
  // regardless of curriculum context) — now falls back to
  // getCurriculumSmartExitHref when omitted, same as every other
  // embeddable exercise's own exit path.
  onExit?: () => void
}

// Shared orchestrator for all 4 Brain Gym drills — settings → playing →
// complete, exactly the same state machine SchulteGridDrillExperience.tsx/
// EspZenerTelepathyExperience.tsx already establish, parameterized by
// `config` instead of forked 4 times for 4 near-identical mechanics.
export function BrainGymDrillExperience({ config, onComplete, onExit }: BrainGymDrillExperienceProps): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: config.labId, exerciseId: config.exerciseId })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestAccuracyPercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestBrainGymStats(config.storageKey))
  }, [config.storageKey])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, correctCount: number, bestStreak: number, averageReactionMs: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    const accuracyPercent = Math.round((correctCount / config.roundCount) * 100)
    setCompletedResult({ elapsedMs, correctCount, bestStreak, averageReactionMs })
    setBestStats(recordBestBrainGymStats(config.storageKey, { bestAccuracyPercent: accuracyPercent, bestStreak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    if (onExit) {
      onExit()
      return
    }
    router.push(getCurriculumSmartExitHref(config.exerciseId, LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <BrainGymDrillSettings config={config} onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <BrainGymDrillCompleteScreen
          config={config}
          elapsedMs={completedResult.elapsedMs}
          correctCount={completedResult.correctCount}
          bestStreak={completedResult.bestStreak}
          averageReactionMs={completedResult.averageReactionMs}
          bestAccuracyPercentAllTime={bestStats.bestAccuracyPercent}
          bestStreakAllTime={bestStats.bestStreak}
          onPlayAgain={handlePlayAgain}
        />
        {onComplete && (
          <div className="mx-auto mt-4 max-w-sm px-4">
            <Button type="button" size="lg" className="w-full rounded-full" onClick={onComplete}>
              Continue Session →
            </Button>
          </div>
        )}
      </>
    )
  }

  return <BrainGymDrillCanvas key={attemptNonce} config={config} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
