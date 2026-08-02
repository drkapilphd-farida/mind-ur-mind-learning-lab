'use client'

import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { FOUNDATION_JOURNEY_STAGES } from '../foundationStages'

type FoundationProgressIndicatorProps = {
  /** null = idle/preview mode (home screen) — no stage is "current" yet. */
  currentOrder: 1 | 2 | 3 | 4 | 5 | null
}

// Analogous to SprintStepIndicator.tsx (5-dot/line progress row), but a new,
// self-contained component — this lab's own feature folder never imports
// from quantum-speed-reading's, keeping the two labs fully decoupled.
export function FoundationProgressIndicator({ currentOrder }: FoundationProgressIndicatorProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const currentStage = FOUNDATION_JOURNEY_STAGES.find((s) => s.order === currentOrder)

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center">
        {FOUNDATION_JOURNEY_STAGES.map(({ order, title }, i) => (
          <div key={order} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  'h-px w-8 sm:w-12',
                  !prefersReducedMotion && 'transition-colors duration-300',
                  currentOrder !== null && order <= currentOrder ? 'bg-foreground/30' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  !prefersReducedMotion && 'transition-all duration-300',
                  order === currentOrder
                    ? 'size-2 bg-foreground'
                    : currentOrder !== null && order < currentOrder
                      ? 'bg-foreground/40'
                      : 'bg-border',
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'hidden text-[10px] tracking-wide sm:block',
                  !prefersReducedMotion && 'transition-colors duration-300',
                  order === currentOrder ? 'font-medium text-foreground' : 'text-muted-foreground/60',
                )}
              >
                {title.replace('™', '')}
              </span>
            </div>
          </div>
        ))}
      </div>
      {currentOrder !== null && (
        <>
          <p className="text-[11px] text-muted-foreground sm:hidden" aria-hidden="true">
            Stage {currentOrder} of 5 · {currentStage?.title}
          </p>
          <p className="sr-only" role="status">
            Stage {currentOrder} of 5: {currentStage?.title}
          </p>
        </>
      )}
    </div>
  )
}
