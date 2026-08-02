// SessionProgress — Apple-style session progress indicator.
// Shows current item, remaining items, and completion percentage.
// Displayed at the top of every exercise session.

import { cn } from '@/lib/utils'
import { comboMicroFeedback } from '@/lib/exercise-engine/difficultyRamp'

type SessionProgressProps = {
  currentIndex: number    // 0-based
  totalItems: number
  completionPercent: number
  runningAccuracy: number
  speedMs: number
  prefersReducedMotion?: boolean
  // Optional copy/gamification additions — all additive, no effect on any
  // exercise that doesn't pass them.
  itemNoun?: string          // e.g. "Challenge" -> "Challenge 7 / 20"
  comboCount?: number        // consecutive-correct streak; elegant phrasing shown when >= 2
  focusLevel?: string        // calm descriptive label, e.g. "Deep Focus"
  difficultyLabel?: string   // e.g. "Advanced" or the current ramp level
  averageResponseTimeMs?: number // running average reaction time so far this session
}

export function SessionProgress({
  currentIndex,
  totalItems,
  completionPercent,
  runningAccuracy,
  speedMs,
  prefersReducedMotion = false,
  itemNoun,
  comboCount,
  focusLevel,
  difficultyLabel,
  averageResponseTimeMs,
}: SessionProgressProps): React.JSX.Element {
  const comboLabel = comboCount !== undefined ? comboMicroFeedback(comboCount) : null

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

      {/* Row 1 — item counter (left), accuracy (center), combo (right) */}
      <p
        className="absolute top-4 left-6 text-xs tabular-nums text-muted-foreground"
        aria-live="polite"
        aria-label={`${itemNoun ?? 'Item'} ${currentIndex + 1} of ${totalItems}`}
      >
        {itemNoun !== undefined ? `${itemNoun} ` : ''}{currentIndex + 1} / {totalItems}
      </p>

      {runningAccuracy > 0 && (
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground">
          {runningAccuracy}%
        </p>
      )}

      {comboLabel !== null && (
        <p
          className="absolute top-4 right-6 text-[10px] font-medium tabular-nums text-primary"
          aria-label={`Current streak: ${comboCount} in a row — ${comboLabel}`}
        >
          {comboLabel}
        </p>
      )}

      {/* Row 2 — speed (left), current difficulty (center), avg response time (right) */}
      <p className="absolute top-9 left-6 text-[10px] text-muted-foreground/60">
        {speedMs}ms
      </p>

      {difficultyLabel !== undefined && (
        <p className="absolute top-9 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60">
          {difficultyLabel}
        </p>
      )}

      {averageResponseTimeMs !== undefined && averageResponseTimeMs > 0 && (
        <p className="absolute top-9 right-6 text-[10px] text-muted-foreground/60">
          {Math.round(averageResponseTimeMs)}ms avg
        </p>
      )}

      {/* Row 3 — focus level, only shown when provided, kept subtle and separate */}
      {focusLevel !== undefined && (
        <p className="absolute top-14 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60">
          {focusLevel}
        </p>
      )}
    </>
  )
}
