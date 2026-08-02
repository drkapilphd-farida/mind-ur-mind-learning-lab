'use client'

import { useEffect, useState } from 'react'
import { formatElapsedDuration } from '@/features/learning-mode-runtime/presentation/formatSessionDuration'
import { cn } from '@/lib/utils'

type SprintCountdownTimerProps = {
  startedAt: string
  targetDurationMinutes: number
}

function computeRemainingSeconds(startedAt: string, targetDurationMinutes: number): number {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  return Math.max(0, targetDurationMinutes * 60 - elapsedSeconds)
}

// Focus Mode™ (Mini) Sprint ALS-16 — Reading Sprint's own real countdown.
// The one genuinely new timer this sprint adds (confirmed via
// investigation: no countdown timer existed anywhere in this codebase
// before this sprint). Ticks down client-side from the session's own
// real, already-persisted `startedAt` — never a separate clock that could
// drift from what the server actually recorded — reusing
// `formatElapsedDuration` (the exact same mm:ss formatter the count-up
// `SessionTimer` already uses) rather than writing a second time-format
// function. Reaching zero is a real, honest, purely visual state — it
// never calls `finishFocusSession` or any other action on its own; the
// learner's own real pacing decision always wins, matching this
// platform's established stance against forced pacing interruptions.
export function SprintCountdownTimer({ startedAt, targetDurationMinutes }: SprintCountdownTimerProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(() => computeRemainingSeconds(startedAt, targetDurationMinutes))

  useEffect(() => {
    const interval = setInterval(() => setRemainingSeconds(computeRemainingSeconds(startedAt, targetDurationMinutes)), 1000)
    return () => clearInterval(interval)
  }, [startedAt, targetDurationMinutes])

  const isComplete = remainingSeconds === 0

  return (
    <span className={cn('font-mono text-xs tabular-nums', isComplete ? 'font-medium text-primary' : 'text-muted-foreground')} aria-label={isComplete ? 'Sprint complete' : 'Time remaining this sprint'}>
      {isComplete ? 'Sprint complete' : formatElapsedDuration(remainingSeconds)}
    </span>
  )
}
