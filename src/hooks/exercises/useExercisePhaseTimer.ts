'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export type PhaseConfig<TPhaseId extends string> = {
  id: TPhaseId
  durationMs: number
}

type UseExercisePhaseTimerResult<TPhaseId extends string> = {
  phaseId: TPhaseId
  elapsedInPhaseMs: number
  phaseDurationMs: number
  totalElapsedMs: number
  totalDurationMs: number
  progress: number
  prefersReducedMotion: boolean
  boundaryOpacity: number
}

const BOUNDARY_FADE_IN_MS = 800

// Drives any exercise's active phase: advances through `phases` in order, pauses
// while the tab is hidden (resuming cleanly instead of jumping forward), and
// reports reduced-motion so the exercise can swap translation for a static pulse.
// `phases` and `onComplete` are captured once per mount via refs, so the engine
// never restarts mid-session even if the caller re-renders for an unrelated reason.
//
// `boundaryOpacity` fades 0→1 across the first phase and 1→0 across the last —
// every exercise so far wants this at its outermost visual layer, so it lives
// here once instead of being hand-rolled per exercise.
export function useExercisePhaseTimer<TPhaseId extends string>(
  phases: PhaseConfig<TPhaseId>[],
  onComplete: (durationMs: number) => void,
): UseExercisePhaseTimerResult<TPhaseId> {
  const prefersReducedMotion = usePrefersReducedMotion()
  const totalDurationMs = phases.reduce((sum, phase) => sum + phase.durationMs, 0)

  const [phaseIndex, setPhaseIndex] = useState(0)
  const [elapsedInPhaseMs, setElapsedInPhaseMs] = useState(0)
  const [totalElapsedMs, setTotalElapsedMs] = useState(0)

  const phasesRef = useRef(phases)
  const onCompleteRef = useRef(onComplete)
  const lastFrameTimeRef = useRef<number | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const phaseIndexRef = useRef(0)
  const elapsedInPhaseRef = useRef(0)
  const totalElapsedRef = useRef(0)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    function tick(timestamp: number): void {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp
      }

      const delta = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      elapsedInPhaseRef.current += delta
      totalElapsedRef.current += delta

      const currentPhase = phasesRef.current[phaseIndexRef.current]

      if (currentPhase === undefined) {
        onCompleteRef.current(totalElapsedRef.current)
        return
      }

      if (elapsedInPhaseRef.current >= currentPhase.durationMs) {
        phaseIndexRef.current += 1
        elapsedInPhaseRef.current = 0
      }

      setPhaseIndex(phaseIndexRef.current)
      setElapsedInPhaseMs(elapsedInPhaseRef.current)
      setTotalElapsedMs(totalElapsedRef.current)

      frameIdRef.current = requestAnimationFrame(tick)
    }

    function handleVisibilityChange(): void {
      if (document.hidden) {
        if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current)
          frameIdRef.current = null
        }
        lastFrameTimeRef.current = null
      } else if (frameIdRef.current === null) {
        frameIdRef.current = requestAnimationFrame(tick)
      }
    }

    frameIdRef.current = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // Mount-once by design: `phasesRef`/`onCompleteRef` stay current without restarting the loop.
  }, [])

  // `phases` is guaranteed non-empty by every call site (a module-level phase list).
  const currentPhase = (phasesRef.current[phaseIndex] ?? phasesRef.current.at(-1)) as PhaseConfig<TPhaseId>
  const isFirstPhase = phaseIndex === 0
  const isLastPhase = phaseIndex === phasesRef.current.length - 1

  const boundaryOpacity = isFirstPhase
    ? Math.min(1, elapsedInPhaseMs / BOUNDARY_FADE_IN_MS)
    : isLastPhase
      ? Math.max(0, 1 - elapsedInPhaseMs / currentPhase.durationMs)
      : 1

  return {
    phaseId: currentPhase.id,
    elapsedInPhaseMs,
    phaseDurationMs: currentPhase.durationMs,
    totalElapsedMs,
    totalDurationMs,
    progress: totalDurationMs > 0 ? Math.min(1, totalElapsedMs / totalDurationMs) : 0,
    prefersReducedMotion,
    boundaryOpacity,
  }
}
