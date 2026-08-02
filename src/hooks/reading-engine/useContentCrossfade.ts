'use client'

import { useEffect, useRef, useState } from 'react'

export type UseContentCrossfadeOptions = {
  exitMs?: number
  enterMs?: number
}

export type UseContentCrossfadeResult = {
  displayedValue: string
  isVisible: boolean
  transitionMs: number
}

const DEFAULT_EXIT_MS = 150
const DEFAULT_ENTER_MS = 260
// A brief pause between exit and enter, entirely invisible (opacity already
// at 0) — this is what makes the swap read as "content settling" rather
// than an instant cut, per the brief's own "very small breathing pause."
const BREATHING_PAUSE_MS = 40

// Sprint 3.4A (Apple Motion Polish™) — a small, reusable, motion-only
// utility: given a text value that changes over time, sequences
// exit → brief pause → enter instead of an instant swap. Deliberately
// generic and content-agnostic (no reading/session/metrics/dwell-time
// logic of any kind) so all 4 Reading Modes share one consistent motion
// language rather than each re-implementing this timing by hand.
//
// The rendered node's identity never changes — callers update this hook's
// return values in place (no `key` prop needed on the element being
// animated), so React never unmounts/remounts the content during a normal
// transition, only its opacity/transform and text content change.
export function useContentCrossfade(
  targetValue: string,
  prefersReducedMotion: boolean,
  options?: UseContentCrossfadeOptions,
): UseContentCrossfadeResult {
  const exitMs = options?.exitMs ?? DEFAULT_EXIT_MS
  const enterMs = options?.enterMs ?? DEFAULT_ENTER_MS

  const [displayedValue, setDisplayedValue] = useState(targetValue)
  const [isVisible, setIsVisible] = useState(true)
  const timeoutIdsRef = useRef<number[]>([])

  useEffect(() => {
    if (targetValue === displayedValue) return

    const ids = timeoutIdsRef.current
    ids.forEach((id) => window.clearTimeout(id))
    ids.length = 0

    if (prefersReducedMotion) {
      setDisplayedValue(targetValue)
      setIsVisible(true)
      return
    }

    setIsVisible(false)
    ids.push(
      window.setTimeout(() => {
        setDisplayedValue(targetValue)
        ids.push(window.setTimeout(() => setIsVisible(true), BREATHING_PAUSE_MS))
      }, exitMs),
    )

    return () => {
      ids.forEach((id) => window.clearTimeout(id))
      ids.length = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue])

  return { displayedValue, isVisible, transitionMs: isVisible ? enterMs : exitMs }
}
