'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { PERIPHERAL_LEVELS, FIXATION_EXERCISE_LABEL } from '../../../fixation/fixationLevels'
import { completeFixationSession } from '../../../fixation/actions/completeFixationSession'
import { FixationCompletion } from '../FixationCompletion'
import { PeripheralIntro } from './PeripheralIntro'
import { PeripheralSession } from './PeripheralSession'
import { PeripheralRecall } from './PeripheralRecall'

type PeripheralPhase = 'intro' | 'countdown' | 'session' | 'recall' | 'complete'

// Brief gives no explicit levels for Peripheral Activation — a single
// fixed-length mode, so there's no level-select phase (unlike the other 4
// exercises).
const LEVEL = PERIPHERAL_LEVELS[0]!

export function PeripheralExperience(): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<PeripheralPhase>('intro')
  const [lastSymbol, setLastSymbol] = useState<string | null>(null)
  const [accuracyPercent, setAccuracyPercent] = useState<number | null>(null)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const handleStart = useCallback(() => setPhase('countdown'), [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback((symbol: string) => {
    setLastSymbol(symbol)
    setPhase('recall')
  }, [])
  const handleRecallSubmit = useCallback((wasCorrect: boolean) => {
    setAccuracyPercent(wasCorrect ? 100 : 0)
    setPhase('complete')
  }, [])
  const handleBackToHub = useCallback(() => router.push('/labs/visual-intelligence/fixation'), [router])

  useEffect(() => {
    if (phase !== 'complete' || hasSavedRef.current || accuracyPercent === null) return
    hasSavedRef.current = true
    void completeFixationSession({
      exerciseType: 'peripheral',
      level: LEVEL.value,
      durationSeconds: LEVEL.durationSeconds,
      accuracyPercent,
    }).then((result) => {
      if (result.success) {
        setFocusScore(result.stats.focusScore)
        setCoachMessage(result.coachMessage)
      }
    })
  }, [phase, accuracyPercent])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div key={phase} className={cn(fadeClass)}>
      {phase === 'intro' && <PeripheralIntro onStart={handleStart} />}
      {phase === 'countdown' && (
        <div className="flex justify-center">
          <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Focus Center" />
        </div>
      )}
      {phase === 'session' && (
        <PeripheralSession durationSeconds={LEVEL.durationSeconds} onComplete={handleSessionComplete} />
      )}
      {phase === 'recall' && lastSymbol !== null && (
        <PeripheralRecall correctSymbol={lastSymbol} onSubmit={handleRecallSubmit} />
      )}
      {phase === 'complete' && (
        <FixationCompletion
          exerciseLabel={FIXATION_EXERCISE_LABEL['peripheral']}
          levelLabel={LEVEL.label}
          accuracyPercent={accuracyPercent}
          focusScore={focusScore}
          coachMessage={coachMessage}
          onBackToHub={handleBackToHub}
        />
      )}
    </div>
  )
}
