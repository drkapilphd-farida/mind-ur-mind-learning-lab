'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const BLACK_SCREEN_SECONDS = 30

type BlackScreenProps = {
  onComplete: () => void
}

// Pure black, no distractions, no buttons — matches the brief exactly.
// A real 30s countdown; the number itself is shown small and unobtrusive
// so it never competes with "Close Your Eyes."
export function BlackScreen({ onComplete }: BlackScreenProps): React.JSX.Element {
  const [remainingSeconds, setRemainingSeconds] = useState(BLACK_SCREEN_SECONDS)

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
      <h1 className={cn('font-heading text-3xl font-bold tracking-tight text-white')} aria-live="polite">
        Close Your Eyes
      </h1>
      <p className="max-w-xs text-sm leading-relaxed text-white/60">
        Observe the image naturally. Do not force anything.
      </p>
      <p className="mt-4 text-xs tabular-nums text-white/40" aria-hidden="true">
        {remainingSeconds}
      </p>
      <span className="sr-only" aria-live="polite">
        {remainingSeconds} seconds remaining
      </span>
    </div>
  )
}
