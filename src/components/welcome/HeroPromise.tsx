'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// Hero Promise™ (Production UX Polish sprint) — the locked brand promise,
// verbatim, exactly as specified. Reused across the Arrival and Choose
// Learning Method screens so the wording and reveal timing can never drift
// between call sites. Do not rewrite or shorten these lines.
const HERO_PROMISE_LINES = ['Understand Faster.', 'Remember Longer.', 'Learn Smarter.'] as const

const LINE_DELAY_MS = 220

type HeroPromiseProps = {
  className?: string
  startDelayMs?: number
}

export function HeroPromise({ className, startDelayMs = 0 }: HeroPromiseProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <p className={cn('flex flex-col gap-1 text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl md:text-4xl', className)}>
      {HERO_PROMISE_LINES.map((line, index) => (
        <span
          key={line}
          className={!prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-700 ease-out' : undefined}
          style={!prefersReducedMotion ? { animationDelay: `${startDelayMs + index * LINE_DELAY_MS}ms` } : undefined}
        >
          {line}
        </span>
      ))}
    </p>
  )
}
