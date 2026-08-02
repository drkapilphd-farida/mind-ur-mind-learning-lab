'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

const EYES_CLOSED_SECONDS = 20

type MandalaEyesClosedScreenProps = {
  onComplete: () => void
}

// Mirrors BlackScreen.tsx (Sprint-6) exactly — pure black, no distractions,
// no buttons, a real countdown shown small and unobtrusive. Adds one subtle
// addition: a barely-visible pulsing background glow (Tailwind's own
// animate-pulse utility, already used elsewhere in this codebase for
// skeleton loaders) — never applied to the "Close Your Eyes" text itself.
export function MandalaEyesClosedScreen({ onComplete }: MandalaEyesClosedScreenProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(EYES_CLOSED_SECONDS)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setRemainingSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [remainingSeconds, onComplete])

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
      <p className="relative mt-4 text-xs tabular-nums text-white/40" aria-hidden="true">
        {remainingSeconds}
      </p>
      <span className="sr-only" aria-live="polite">
        {remainingSeconds} seconds remaining
      </span>
    </div>
  )
}
