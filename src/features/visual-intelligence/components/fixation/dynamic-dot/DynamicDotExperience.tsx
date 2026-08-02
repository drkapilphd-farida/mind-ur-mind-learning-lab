'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { DYNAMIC_DOT_PATHS, FIXATION_EXERCISE_LABEL } from '../../../fixation/fixationLevels'
import { completeFixationSession } from '../../../fixation/actions/completeFixationSession'
import { FixationLevelSelect } from '../FixationLevelSelect'
import { FixationCompletion } from '../FixationCompletion'
import { DynamicDotIntro } from './DynamicDotIntro'
import { DynamicDotSession } from './DynamicDotSession'

type DynamicDotPhase = 'intro' | 'level-select' | 'countdown' | 'session' | 'complete'

export function DynamicDotExperience(): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<DynamicDotPhase>('intro')
  const [pathValue, setPathValue] = useState<string>(DYNAMIC_DOT_PATHS[0]!.value)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const path = DYNAMIC_DOT_PATHS.find((option) => option.value === pathValue) ?? DYNAMIC_DOT_PATHS[0]!

  const handleStart = useCallback(() => setPhase('level-select'), [])
  const handleSelectPath = useCallback((value: string) => {
    setPathValue(value)
    setPhase('countdown')
  }, [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('complete'), [])
  const handleBackToHub = useCallback(() => router.push('/labs/visual-intelligence/fixation'), [router])

  useEffect(() => {
    if (phase !== 'complete' || hasSavedRef.current) return
    hasSavedRef.current = true
    void completeFixationSession({
      exerciseType: 'dynamic-dot',
      level: path.value,
      durationSeconds: path.durationSeconds,
      accuracyPercent: null,
    }).then((result) => {
      if (result.success) {
        setFocusScore(result.stats.focusScore)
        setCoachMessage(result.coachMessage)
      }
    })
  }, [phase, path.value, path.durationSeconds])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div key={phase} className={cn(fadeClass)}>
      {phase === 'intro' && <DynamicDotIntro onStart={handleStart} />}
      {phase === 'level-select' && (
        <FixationLevelSelect
          title="Choose Your Path"
          subtitle="Each path runs for 45 seconds."
          options={DYNAMIC_DOT_PATHS}
          onSelect={handleSelectPath}
        />
      )}
      {phase === 'countdown' && (
        <div className="flex justify-center">
          <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Track It" />
        </div>
      )}
      {phase === 'session' && (
        <DynamicDotSession pathValue={path.value} durationSeconds={path.durationSeconds} onComplete={handleSessionComplete} />
      )}
      {phase === 'complete' && (
        <FixationCompletion
          exerciseLabel={FIXATION_EXERCISE_LABEL['dynamic-dot']}
          levelLabel={path.label}
          accuracyPercent={null}
          focusScore={focusScore}
          coachMessage={coachMessage}
          onBackToHub={handleBackToHub}
        />
      )}
    </div>
  )
}
