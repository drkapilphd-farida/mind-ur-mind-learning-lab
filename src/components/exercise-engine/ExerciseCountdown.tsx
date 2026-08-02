'use client'

// ExerciseCountdown — universal 3-2-1 countdown for any exercise.
// Replaces the inline countdown logic in FlashCanvas.tsx.
// Called by the UniversalExercisePlayer; exercise-specific players can
// also use it directly for consistency.

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

type ExerciseCountdownProps = {
  from?: number            // default 3
  onComplete: () => void
  className?: string
  // Optional pacing beats — additive. When provided, a brief "ready" label
  // shows before the numeric countdown starts, and a brief "go" label
  // shows after it ends, before onComplete fires. When both are omitted
  // (every exercise except Word Flash today), behavior is byte-for-byte
  // identical to before: the numeric countdown starts immediately and
  // onComplete fires the instant it reaches 0.
  readyLabel?: string
  goLabel?: string
}

const READY_BEAT_MS = 500
const GO_BEAT_MS = 250

type CountdownPhase = 'ready' | 'counting' | 'go'

export function ExerciseCountdown({
  from = 3,
  onComplete,
  className,
  readyLabel,
  goLabel,
}: ExerciseCountdownProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<CountdownPhase>(readyLabel !== undefined ? 'ready' : 'counting')
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (phase === 'ready') {
      const timer = setTimeout(() => setPhase('counting'), READY_BEAT_MS)
      return () => clearTimeout(timer)
    }

    if (phase === 'counting') {
      if (value <= 0) {
        if (goLabel !== undefined) { setPhase('go'); return }
        onComplete()
        return
      }
      const timer = setTimeout(() => setValue((v) => v - 1), 1000)
      return () => clearTimeout(timer)
    }

    // phase === 'go'
    const timer = setTimeout(onComplete, GO_BEAT_MS)
    return () => clearTimeout(timer)
  }, [phase, value, onComplete, goLabel])

  const displayText = phase === 'ready' ? readyLabel : phase === 'go' ? goLabel : String(value)
  const isWordPhase = phase === 'ready' || phase === 'go'

  return (
    <div
      className={cn(
        'flex size-24 items-center justify-center rounded-full bg-muted px-2 text-center',
        !prefersReducedMotion && 'animate-in zoom-in-75 duration-300',
        className,
      )}
      aria-live="assertive"
      aria-label={phase === 'counting' ? `Starting in ${value}` : displayText}
      role="timer"
    >
      <span
        className={cn(
          'font-bold text-foreground tabular-nums',
          isWordPhase ? 'text-sm leading-tight' : 'text-5xl',
        )}
      >
        {displayText}
      </span>
    </div>
  )
}
