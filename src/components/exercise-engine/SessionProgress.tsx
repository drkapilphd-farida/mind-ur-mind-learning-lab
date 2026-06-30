// SessionProgress — Apple-style session progress indicator.
// Shows current item, remaining items, and completion percentage.
// Displayed at the top of every exercise session.

import { cn } from '@/lib/utils'

type SessionProgressProps = {
  currentIndex: number    // 0-based
  totalItems: number
  completionPercent: number
  runningAccuracy: number
  speedMs: number
  prefersReducedMotion?: boolean
}

export function SessionProgress({
  currentIndex,
  totalItems,
  completionPercent,
  runningAccuracy,
  speedMs,
  prefersReducedMotion = false,
}: SessionProgressProps): React.JSX.Element {
  return (
    <>
      {/* Thin progress bar along the very top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border" aria-hidden="true">
        <div
          className={cn(
            'h-0.5 bg-primary',
            !prefersReducedMotion && 'transition-[width] duration-300 ease-out',
          )}
          style={{ width: `${completionPercent}%` }}
          role="progressbar"
          aria-valuenow={completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Session progress: ${completionPercent}%`}
        />
      </div>

      {/* Item counter — top left */}
      <p
        className="absolute top-4 left-6 text-xs tabular-nums text-muted-foreground"
        aria-live="polite"
        aria-label={`Item ${currentIndex + 1} of ${totalItems}`}
      >
        {currentIndex + 1} / {totalItems}
      </p>

      {/* Running accuracy — top right of content area (inside progress bar) */}
      {runningAccuracy > 0 && (
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground">
          {runningAccuracy}%
        </p>
      )}

      {/* Speed indicator — small badge below left counter */}
      <p className="absolute top-9 left-6 text-[10px] text-muted-foreground/60">
        {speedMs}ms
      </p>
    </>
  )
}
