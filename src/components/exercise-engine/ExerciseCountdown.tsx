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
}

export function ExerciseCountdown({
  from = 3,
  onComplete,
  className,
}: ExerciseCountdownProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (value <= 0) { onComplete(); return }
    const timer = setTimeout(() => setValue((v) => v - 1), 1000)
    return () => clearTimeout(timer)
  }, [value, onComplete])

  return (
    <div
      className={cn(
        'flex size-24 items-center justify-center rounded-full bg-muted',
        !prefersReducedMotion && 'animate-in zoom-in-75 duration-300',
        className,
      )}
      aria-live="assertive"
      aria-label={`Starting in ${value}`}
      role="timer"
    >
      <span className="text-5xl font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}
