import { useEffect, useState } from 'react'

// Sprint-13 — Micro Victory System™. One timer, reused at every exercise
// completion point: `isRevealed` starts false, flips true once after
// `durationMs`. The brief calls for the flash to "automatically continue"
// regardless of motion preference, so the timer always runs the full
// duration — MicroVictoryMoment itself is what skips the animation for
// prefers-reduced-motion, not this hook.
//
// `resetKey` matters for auto-advancing multi-level exercises (Progressive
// Chunk/Phrase/Multi-Line/Sentence/Paragraph Reading, Mandala's levels):
// the same component instance shows a fresh pass screen every level
// without unmounting, so the timer must restart each time — pass
// something that changes per level (e.g. the level number) as `resetKey`.
// Single-shot call sites (Flash exercises, Tratak reports) can omit it.
export function useMicroVictoryReveal(durationMs = 1500, resetKey?: unknown): boolean {
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    setIsRevealed(false)
    const timer = setTimeout(() => setIsRevealed(true), durationMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  return isRevealed
}
