'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { MULTI_DOT_LEVELS, FIXATION_EXERCISE_LABEL } from '../../../fixation/fixationLevels'
import { completeFixationSession } from '../../../fixation/actions/completeFixationSession'
import { FixationLevelSelect } from '../FixationLevelSelect'
import { FixationCompletion } from '../FixationCompletion'
import { MultiDotIntro } from './MultiDotIntro'
import { MultiDotGrid } from './MultiDotGrid'

type MultiDotPhase = 'intro' | 'level-select' | 'countdown' | 'session' | 'complete'

export function MultiDotExperience(): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<MultiDotPhase>('intro')
  const [levelValue, setLevelValue] = useState<string>(MULTI_DOT_LEVELS[0]!.value)
  const [accuracyPercent, setAccuracyPercent] = useState<number | null>(null)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const level = MULTI_DOT_LEVELS.find((option) => option.value === levelValue) ?? MULTI_DOT_LEVELS[0]!
  const dotCount = Number(level.value)

  const handleStart = useCallback(() => setPhase('level-select'), [])
  const handleSelectLevel = useCallback((value: string) => {
    setLevelValue(value)
    setPhase('countdown')
  }, [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback((accuracy: number) => {
    setAccuracyPercent(accuracy)
    setPhase('complete')
  }, [])
  const handleBackToHub = useCallback(() => router.push('/labs/visual-intelligence/fixation'), [router])

  useEffect(() => {
    if (phase !== 'complete' || hasSavedRef.current || accuracyPercent === null) return
    hasSavedRef.current = true
    void completeFixationSession({
      exerciseType: 'multi-dot',
      level: level.value,
      durationSeconds: level.durationSeconds,
      accuracyPercent,
    }).then((result) => {
      if (result.success) {
        setFocusScore(result.stats.focusScore)
        setCoachMessage(result.coachMessage)
      }
    })
  }, [phase, level.value, level.durationSeconds, accuracyPercent])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div key={phase} className={cn(fadeClass)}>
      {phase === 'intro' && <MultiDotIntro onStart={handleStart} />}
      {phase === 'level-select' && (
        <FixationLevelSelect
          title="Choose Dot Count"
          subtitle="More dots means more targets to track."
          options={MULTI_DOT_LEVELS}
          onSelect={handleSelectLevel}
        />
      )}
      {phase === 'countdown' && (
        <div className="flex justify-center">
          <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Go" />
        </div>
      )}
      {phase === 'session' && (
        <MultiDotGrid dotCount={dotCount} durationSeconds={level.durationSeconds} onComplete={handleSessionComplete} />
      )}
      {phase === 'complete' && (
        <FixationCompletion
          exerciseLabel={FIXATION_EXERCISE_LABEL['multi-dot']}
          levelLabel={level.label}
          accuracyPercent={accuracyPercent}
          focusScore={focusScore}
          coachMessage={coachMessage}
          onBackToHub={handleBackToHub}
        />
      )}
    </div>
  )
}
