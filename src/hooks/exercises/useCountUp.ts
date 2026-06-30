'use client'

import { useEffect, useRef, useState } from 'react'

// Animates a numeric value from 0 to `target` over `durationMs`, returning
// the current animated value. When prefersReducedMotion is true, returns the
// target immediately — no animation, no re-renders.
export function useCountUp(target: number, durationMs = 700, prefersReducedMotion = false): number {
  const [value, setValue] = useState(prefersReducedMotion ? target : 0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(target)
      return
    }

    const start = performance.now()

    function tick(now: number): void {
      const elapsed = now - start
      const t = Math.min(elapsed / durationMs, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(eased * target)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, durationMs, prefersReducedMotion])

  return value
}
