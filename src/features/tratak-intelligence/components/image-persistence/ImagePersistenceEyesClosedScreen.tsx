'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// A generous safety cap only — never fabricates a duration, just prevents
// the flow getting stuck forever if a user walks away. If the cap is hit,
// the REAL elapsed time up to that point is still what's reported.
const SAFETY_CAP_SECONDS = 90

type ImagePersistenceEyesClosedScreenProps = {
  onComplete: (measuredDurationSeconds: number) => void
  /** Sprint 52: the "clean neutral background" the after-image is observed
   * against — configurable per the Image Persistence Engine's
   * requirements, defaults to a soft white matching the brief's default. */
  neutralBackgroundClassName?: string
}

// Sprint 10F enhancement: replaces the old fixed 20s passive countdown with
// a real, user-timed 2-tap measurement — "no guessing." Local duplicate of
// CandleTratakEyesClosedScreen.tsx's identical mechanic, not shared with
// Mandala Tratak™'s own MandalaEyesClosedScreen.tsx (untouched, still a
// fixed passive countdown).
//
// Sprint 52 — Persistence Observation™: this screen's premise changed from
// "close your eyes, watch the after-image against your eyelids" (black
// background) to "keep your eyes open, observe the after-image against a
// neutral surface" (the classic Tratak persistence-of-vision technique,
// and what the brief's "Transition… neutral white background" +
// "Persistence Observation… What do you notice?" steps describe). The
// timer mechanic and onComplete contract are byte-identical — only the
// background, copy, and glow styling changed to match the new premise.
export function ImagePersistenceEyesClosedScreen({
  onComplete,
  neutralBackgroundClassName = 'bg-neutral-50',
}: ImagePersistenceEyesClosedScreenProps): React.JSX.Element {
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
    // Safety cap only — a real elapsed-time report, never a fabricated one.
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
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 text-center',
        neutralBackgroundClassName,
        !prefersReducedMotion && 'animate-in fade-in duration-700',
      )}
    >
      {/* Ambient ring — reuses the existing breathing-pulse keyframe
          (already established for calm, premium circles elsewhere in this
          app) restyled as a soft bordered ring rather than a blurred fill,
          since a dark blurred glow reads as a smudge on a light/neutral
          background instead of a glow. */}
      <div
        className="pointer-events-none absolute size-64 rounded-full border border-primary/10 bg-primary/[0.03]"
        style={!prefersReducedMotion ? { animation: 'breathing-pulse 3.5s ease-in-out infinite' } : { opacity: 0.7 }}
        aria-hidden="true"
      />
      <p className="relative text-xs font-medium tracking-widest text-muted-foreground uppercase">Persistence Observation™</p>
      <h1 className="relative font-heading text-3xl font-bold tracking-tight text-foreground" aria-live="polite">
        What do you notice?
      </h1>
      <p className="relative max-w-xs text-sm leading-relaxed text-muted-foreground">
        Keep looking at the neutral background. There&rsquo;s nothing to force — simply observe.
      </p>

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
