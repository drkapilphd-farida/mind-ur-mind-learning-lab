'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

type ReadingProgressBarProps = {
  progressPercent: number
}

// Sprint 3.2A — a thin, minimal, Apple-like progress indicator replacing
// the old plain "72%" stat text. No gamification, no flashy animation —
// just a smooth width transition (skipped instantly under reduced motion).
export function ReadingProgressBar({ progressPercent }: ReadingProgressBarProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const clamped = Math.min(100, Math.max(0, progressPercent))

  return (
    <div className="w-full">
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full bg-foreground/70 ${prefersReducedMotion ? '' : 'transition-[width] duration-300 ease-out'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-[10px] font-medium tabular-nums text-muted-foreground">{clamped}%</p>
    </div>
  )
}
