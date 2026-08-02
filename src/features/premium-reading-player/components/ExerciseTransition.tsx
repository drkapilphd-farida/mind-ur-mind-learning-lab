'use client'

import { useEffect } from 'react'
import { useMicroVictoryReveal } from '@/hooks/exercises/useMicroVictoryReveal'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { usePhaseFadeClass } from '@/hooks/exercises/usePhaseFadeClass'
import { cn } from '@/lib/utils'

type ExerciseTransitionProps = {
  exerciseTitle: string
  onComplete: () => void
  durationMs?: number
}

// The brief's "Exercise Transition" — the beat between Reading Objective and
// the active exercise mounting. Reuses useMicroVictoryReveal's generic
// reveal-timer mechanic (already used for the completion beat elsewhere)
// rather than writing a second timer hook, and the same fade motion language
// as every other phase transition in this app. `role="status"`/`aria-live`
// (Sprint 51) matches the same pattern MicroVictoryMoment already uses.
export function ExerciseTransition({ exerciseTitle, onComplete, durationMs = 900 }: ExerciseTransitionProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = usePhaseFadeClass(prefersReducedMotion)
  const isRevealed = useMicroVictoryReveal(durationMs)

  useEffect(() => {
    if (isRevealed) onComplete()
  }, [isRevealed, onComplete])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-2 py-16 text-center', fadeClass)}
    >
      <p className="text-sm text-muted-foreground">Starting {exerciseTitle}…</p>
    </div>
  )
}
