'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { STATIC_DOT_LEVELS, FIXATION_EXERCISE_LABEL } from '../../../fixation/fixationLevels'
import { completeFixationSession } from '../../../fixation/actions/completeFixationSession'
import { FixationLevelSelect } from '../FixationLevelSelect'
import { FixationCompletion } from '../FixationCompletion'
import { StaticDotIntro } from './StaticDotIntro'
import { StaticDotSession } from './StaticDotSession'

type StaticDotPhase = 'intro' | 'level-select' | 'countdown' | 'session' | 'complete'

// Sprint-5 — Static Dot Focus™. Simplest of the 5 fixation exercises;
// built first to validate the whole phase-machine + save + Focus Score +
// AI Coach pipeline before the other 4 copy this shape.
export function StaticDotExperience(): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<StaticDotPhase>('intro')
  const [levelValue, setLevelValue] = useState<string>(STATIC_DOT_LEVELS[0]!.value)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const level = STATIC_DOT_LEVELS.find((option) => option.value === levelValue) ?? STATIC_DOT_LEVELS[0]!

  const handleStart = useCallback(() => setPhase('level-select'), [])
  const handleSelectLevel = useCallback((value: string) => {
    setLevelValue(value)
    setPhase('countdown')
  }, [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('complete'), [])
  const handleBackToHub = useCallback(() => router.push('/labs/visual-intelligence/fixation'), [router])

  // Fires exactly once when the completion screen is reached — same
  // hasSavedRef-guard convention as ImagePersistenceExperience.tsx.
  useEffect(() => {
    if (phase !== 'complete' || hasSavedRef.current) return
    hasSavedRef.current = true
    void completeFixationSession({
      exerciseType: 'static-dot',
      level: level.value,
      durationSeconds: level.durationSeconds,
      accuracyPercent: null,
    }).then((result) => {
      if (result.success) {
        setFocusScore(result.stats.focusScore)
        setCoachMessage(result.coachMessage)
      }
    })
  }, [phase, level.value, level.durationSeconds])

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div key={phase} className={cn(fadeClass)}>
      {phase === 'intro' && <StaticDotIntro onStart={handleStart} />}
      {phase === 'level-select' && (
        <FixationLevelSelect
          title="Choose Your Duration"
          subtitle="Longer sessions build deeper focus stamina."
          options={STATIC_DOT_LEVELS}
          onSelect={handleSelectLevel}
        />
      )}
      {phase === 'countdown' && (
        <div className="flex justify-center">
          <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Focus" />
        </div>
      )}
      {phase === 'session' && <StaticDotSession durationSeconds={level.durationSeconds} onComplete={handleSessionComplete} />}
      {phase === 'complete' && (
        <FixationCompletion
          exerciseLabel={FIXATION_EXERCISE_LABEL['static-dot']}
          levelLabel={level.label}
          accuracyPercent={null}
          focusScore={focusScore}
          coachMessage={coachMessage}
          onBackToHub={handleBackToHub}
        />
      )}
    </div>
  )
}
