'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExerciseSession } from '@/hooks/exercises/useExerciseSession'
import { Button } from '@/components/ui/button'
import { loadBestTimeMs, recordBestTimeMs } from '../schulteGridLocalHistory'
import { SchulteGridDrillSettings } from './SchulteGridDrillSettings'
import { SchulteGridDrillCanvas } from './SchulteGridDrillCanvas'
import { SchulteGridDrillCompleteScreen } from './SchulteGridDrillCompleteScreen'

const LAB_HREF = '/labs/quantum-speed-reading'
const BEST_TIME_STORAGE_KEY = 'qsr-schulte-grid-drill-best'

type ExperiencePhase = 'settings' | 'playing' | 'complete'

type CompletedResult = {
  elapsedMs: number
  mistakeCount: number
}

// Top-level orchestrator for Schulte Grid Speed Drill™ — the first
// advanced warmup exercise alongside the 5 Reading Modes. Deliberately
// does NOT use useReadingSession (its recordResult takes a
// ReadingSessionResult — averageWpm/targetWpm/wordsRead/totalWords — none
// of which describe a click-search grid honestly); instead this calls
// useExerciseSession directly, the same underlying primitive
// useReadingSession itself is built on, and makes the completed-vs-early-
// exit decision itself directly: honest and unambiguous here, since
// completion means "all 25 numbers found," nothing else does.
// session.start() fires once on Start; session.recordCompletion(elapsedMs)
// fires only on a genuine full clear; session.recordExit(elapsedMs) fires
// only on a real Exit click mid-attempt — matching every Reading Mode's
// own honesty convention (an abandoned attempt is never marked complete).
type SchulteGridDrillExperienceProps = {
  // 21-Day Transformation Journey™ — additive, optional. See
  // EspZenerTelepathyExperience.tsx's identical prop for the full
  // rationale. No accuracy argument here — Schulte Grid has no accuracy%
  // concept (its own real metric is completion time/mistake count), so
  // it's never written to domain_performance_sessions. Standalone usage
  // (this prop omitted) is unchanged.
  onComplete?: () => void
}

export function SchulteGridDrillExperience({ onComplete }: SchulteGridDrillExperienceProps = {}): React.JSX.Element {
  const router = useRouter()
  const session = useExerciseSession({ labId: 'quantum-speed-reading', exerciseId: 'schulte-grid-drill' })

  const [phase, setPhase] = useState<ExperiencePhase>('settings')
  const [attemptNonce, setAttemptNonce] = useState(0)
  const [bestTimeMs, setBestTimeMs] = useState(0)
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    setBestTimeMs(loadBestTimeMs(BEST_TIME_STORAGE_KEY))
  }, [])

  function handleStart(): void {
    hasRecordedRef.current = false
    session.start()
    setPhase('playing')
  }

  function handleComplete(elapsedMs: number, mistakeCount: number): void {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    setCompletedResult({ elapsedMs, mistakeCount })
    setBestTimeMs(recordBestTimeMs(BEST_TIME_STORAGE_KEY, elapsedMs))
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
    return <SchulteGridDrillSettings onStart={handleStart} />
  }

  if (phase === 'complete' && completedResult !== null) {
    return (
      <>
        <SchulteGridDrillCompleteScreen
          elapsedMs={completedResult.elapsedMs}
          mistakeCount={completedResult.mistakeCount}
          bestTimeMs={bestTimeMs}
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

  return <SchulteGridDrillCanvas key={attemptNonce} onComplete={handleComplete} onExitRequested={handleExitRequested} />
}
