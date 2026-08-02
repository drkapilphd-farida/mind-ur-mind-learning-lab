'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type PresenceReadingModeProps = {
  onBegin: () => void
}

const BREATH_CYCLE_MS = 6000

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Presence Reading™.
// "Prepare the brain before reading" — a calm, minimal breathing moment
// and a gentle focus timer, never a full exercise. `onBegin` hands off
// directly into whichever mode the learner actually wants next (the
// parent defaults this to `'sequential'`, today's real reading view) —
// this mode never touches the real chunk/session state itself.
export function PresenceReadingMode({ onBegin }: PresenceReadingModeProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card/60 px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className={cn('flex size-24 items-center justify-center rounded-full bg-primary/10', !prefersReducedMotion && 'animate-pulse')}
        style={!prefersReducedMotion ? { animationDuration: `${BREATH_CYCLE_MS}ms` } : undefined}
      >
        <div className="size-14 rounded-full bg-primary/20" />
      </div>

      <div>
        <p className={TYPOGRAPHY.h3}>Take a moment to settle in</p>
        <p className={cn(TYPOGRAPHY.small, 'mt-2 text-muted-foreground')}>Breathe in as the circle grows, breathe out as it fades.</p>
      </div>

      <p className={cn(TYPOGRAPHY.caption, 'tabular-nums text-muted-foreground')}>{elapsedSeconds}s</p>

      <Button size="lg" className="rounded-full" onClick={onBegin}>
        Begin Reading
      </Button>
    </div>
  )
}
