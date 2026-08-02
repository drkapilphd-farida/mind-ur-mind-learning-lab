'use client'

import { useEffect, useState } from 'react'
import { formatElapsedDuration } from '../presentation/formatSessionDuration'

type SessionTimerProps = {
  startedAt: string
}

function computeElapsedSeconds(startedAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
}

// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved from Quantum Speed Reading™'s own `components/ReadingTimer.tsx`
// (Sprint-2) — a plain elapsed-time display, ticking client-side from the
// session's own real `startedAt` timestamp (already persisted, LSE-1's
// own `LearningSession.startedAt`, reused verbatim). Never a pacing
// signal, never sent anywhere, never used to derive any per-mode rate —
// display only, for any Learning Mode.
export function SessionTimer({ startedAt }: SessionTimerProps): React.JSX.Element {
  const [elapsedSeconds, setElapsedSeconds] = useState(() => computeElapsedSeconds(startedAt))

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(computeElapsedSeconds(startedAt)), 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground" aria-label="Time spent this session">
      {formatElapsedDuration(elapsedSeconds)}
    </span>
  )
}
