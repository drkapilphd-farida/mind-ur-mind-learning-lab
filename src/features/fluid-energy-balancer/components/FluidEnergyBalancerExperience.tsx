'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurriculumSmartExitHref, getWizardAwareBackHref } from '@/features/thirty-day-curriculum/curriculumReturnRouting'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { loadBestFluidEnergyBalancerStats, recordBestFluidEnergyBalancerStats } from '../fluidEnergyBalancerLocalHistory'
import { FluidEnergyBalancerSettings } from './FluidEnergyBalancerSettings'
import { FluidEnergyBalancerCanvas } from './FluidEnergyBalancerCanvas'
import { FluidEnergyBalancerCompleteScreen } from './FluidEnergyBalancerCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_STATS_STORAGE_KEY = 'qsr-fluid-energy-balancer-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  overallStabilityPercent: number
  streak: number
}

// Top-level orchestrator for Fluid Energy Balancer™ — a Visualization Hub
// exercise. Deliberately does NOT use useReadingSession (its recordResult
// takes a ReadingSessionResult — averageWpm/targetWpm/wordsRead/totalWords
// — none of which describe a real-time balancing simulation honestly);
// instead this calls useExerciseSession directly, matching every other
// non-WPM advanced exercise's own precedent. Completion is unambiguous
// here: it means "all 5 rounds played through to their own natural end,"
// nothing else does — an abandoned attempt is always recorded as an early
// exit, never as a completion.
type FluidEnergyBalancerExperienceProps = {
  // QSR Pro Circuit™ — additive, optional. Mirrors every other advanced
  // exercise's identical prop: when a caller supplies this, a "Continue
  // Session →" action appears alongside the real, unmodified
  // CompleteScreen, and receives this real attempt's overall stability as
  // its accuracyPercent. Standalone usage (this prop omitted) is
  // unchanged.
  onComplete?: (accuracyPercent: number) => void
}

export function FluidEnergyBalancerExperience({ onComplete }: FluidEnergyBalancerExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('fluid-energy-balancer', LAB_HREF)
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'fluid-energy-balancer' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestStats, setBestStats] = useState({ bestScorePercent: 0, bestStreak: 0 })
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestStats(loadBestFluidEnergyBalancerStats(BEST_STATS_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, overallStabilityPercent: number, streak: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    setCompletedResult({ elapsedMs, overallStabilityPercent, streak })
    setBestStats(recordBestFluidEnergyBalancerStats(BEST_STATS_STORAGE_KEY, { bestScorePercent: overallStabilityPercent, bestStreak: streak }))
    void session.recordCompletion(elapsedMs)
    setPhase('complete')
  }

  function handleExitRequested(elapsedMs: number): void {
    void session.recordExit(elapsedMs)
    router.push(getCurriculumSmartExitHref('fluid-energy-balancer', LAB_HREF))
  }

  function handlePlayAgain(): void {
    hasRecordedRef.current = false
    setCompletedResult(null)
    setAttemptNonce((nonce) => nonce + 1)
    session.start()
    setPhase('playing')
  }

  if (phase === 'settings') {
    return <FluidEnergyBalancerSettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <FluidEnergyBalancerCompleteScreen
          backHref={getWizardAwareBackHref('fluid-energy-balancer', LAB_HREF)}
          elapsedMs={completedResult.elapsedMs}
          overallStabilityPercent={completedResult.overallStabilityPercent}
          streak={completedResult.streak}
          bestScorePercentAllTime={bestStats.bestScorePercent}
          bestStreakAllTime={bestStats.bestStreak}
          onPlayAgain={handlePlayAgain}
        />
        {(curriculumSession.isActiveStep || onComplete) && (
          <div className="mx-auto mt-4 max-w-sm px-4">
            <Button
              type="button"
              size="lg"
              className="w-full rounded-full"
              onClick={() => (curriculumSession.isActiveStep ? curriculumSession.advance() : onComplete?.(completedResult.overallStabilityPercent))}
            >
              Continue Session →
            </Button>
          </div>
        )}
      </>
    )
  }

  return <FluidEnergyBalancerCanvas key={attemptNonce} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
