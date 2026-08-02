'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseCountdown } from '@/components/exercise-engine/ExerciseCountdown'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { BREATH_SYNC_LEVELS, FIXATION_EXERCISE_LABEL } from '../../../fixation/fixationLevels'
import { completeFixationSession } from '../../../fixation/actions/completeFixationSession'
import { FixationLevelSelect } from '../FixationLevelSelect'
import { FixationCompletion } from '../FixationCompletion'
import { BreathSyncIntro } from './BreathSyncIntro'
import { BreathSyncSession } from './BreathSyncSession'

type BreathSyncPhase = 'intro' | 'level-select' | 'countdown' | 'session' | 'complete'

export function BreathSyncExperience(): React.JSX.Element {
  const router = useRouter()
  const [phase, setPhase] = useState<BreathSyncPhase>('intro')
  const [levelValue, setLevelValue] = useState<string>(BREATH_SYNC_LEVELS[0]!.value)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasSavedRef = useRef(false)

  const level = BREATH_SYNC_LEVELS.find((option) => option.value === levelValue) ?? BREATH_SYNC_LEVELS[0]!

  const handleStart = useCallback(() => setPhase('level-select'), [])
  const handleSelectLevel = useCallback((value: string) => {
    setLevelValue(value)
    setPhase('countdown')
  }, [])
  const handleCountdownComplete = useCallback(() => setPhase('session'), [])
  const handleSessionComplete = useCallback(() => setPhase('complete'), [])
  const handleBackToHub = useCallback(() => router.push('/labs/visual-intelligence/fixation'), [router])

  useEffect(() => {
    if (phase !== 'complete' || hasSavedRef.current) return
    hasSavedRef.current = true
    void completeFixationSession({
      exerciseType: 'breath-sync',
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
      {phase === 'intro' && <BreathSyncIntro onStart={handleStart} />}
      {phase === 'level-select' && (
        <FixationLevelSelect
          title="Choose Your Duration"
          subtitle="Longer sessions deepen the calming effect."
          options={BREATH_SYNC_LEVELS}
          onSelect={handleSelectLevel}
        />
      )}
      {phase === 'countdown' && (
        <div className="flex justify-center">
          <ExerciseCountdown from={3} onComplete={handleCountdownComplete} readyLabel="Get Ready" goLabel="Begin" />
        </div>
      )}
      {phase === 'session' && <BreathSyncSession durationSeconds={level.durationSeconds} onComplete={handleSessionComplete} />}
      {phase === 'complete' && (
        <FixationCompletion
          exerciseLabel={FIXATION_EXERCISE_LABEL['breath-sync']}
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
