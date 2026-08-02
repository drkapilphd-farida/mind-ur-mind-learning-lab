'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// A generous safety cap only — never fabricates a duration, just prevents
// the flow getting stuck forever if a user walks away. If the cap is hit,
// the REAL elapsed time up to that point is still what's reported.
const SAFETY_CAP_SECONDS = 90

type CandleTratakEyesClosedScreenProps = {
  onComplete: (measuredDurationSeconds: number) => void
}

// Sprint 10F enhancement: replaces the old fixed 20s passive countdown with
// a real, user-timed 2-tap measurement — "no guessing." Local duplicate of
// ImagePersistenceEyesClosedScreen.tsx's identical mechanic, not shared
// with Mandala Tratak™'s own MandalaEyesClosedScreen.tsx (untouched).
export function CandleTratakEyesClosedScreen({ onComplete }: CandleTratakEyesClosedScreenProps): React.JSX.Element {
  const [phase, setPhase] = useState<'waiting-to-start' | 'timing'>('waiting-to-start')
  const prefersReducedMotion = usePrefersReducedMotion()
  const startTimeRef = useRef<number | null>(null)
  const hasCompletedRef = useRef(false)

  const complete = (measuredDurationSeconds: number): void => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    onComplete(Math.max(0, measuredDurationSeconds))
  }

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      const elapsedSeconds = startTimeRef.current !== null ? (Date.now() - startTimeRef.current) / 1000 : 0
      complete(elapsedSeconds)
    }, SAFETY_CAP_SECONDS * 1000)
    return () => clearTimeout(safetyTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStillVisible = (): void => {
    startTimeRef.current = Date.now()
    setPhase('timing')
  }

  const handleDisappeared = (): void => {
    const elapsedSeconds = startTimeRef.current !== null ? (Date.now() - startTimeRef.current) / 1000 : 0
    complete(elapsedSeconds)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black px-6 text-center">
      <div
        className={cn('pointer-events-none absolute size-64 rounded-full bg-primary/10 blur-3xl', !prefersReducedMotion && 'animate-pulse')}
        aria-hidden="true"
      />
      <h1 className="relative font-heading text-3xl font-bold tracking-tight text-white" aria-live="polite">
        Close Your Eyes
      </h1>
      <p className="relative max-w-xs text-sm leading-relaxed text-white/60">Observe the after-image naturally. Do not force it. Remain relaxed.</p>

      <Button
        size="lg"
        className={cn('relative w-full max-w-xs rounded-full', !prefersReducedMotion && 'transition-transform active:scale-[0.98]')}
        onClick={phase === 'waiting-to-start' ? handleStillVisible : handleDisappeared}
      >
        {phase === 'waiting-to-start' ? 'I Can Still See It' : 'It Has Disappeared'}
      </Button>
    </div>
  )
}
