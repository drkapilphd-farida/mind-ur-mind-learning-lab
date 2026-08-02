'use client'

import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

type GuidedStepProgressProps = {
  /** 0-based index of the active step. */
  currentIndex: number
  totalSteps: number
}

// Sprint-2 — a small, self-contained dot row for the guided steps *within*
// an active stage. Deliberately its own component, not a reuse or
// modification of the outer FoundationProgressIndicator.tsx (a different,
// nested concept: steps within a stage, not stages within the journey).
export function GuidedStepProgress({ currentIndex, totalSteps }: GuidedStepProgressProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (totalSteps <= 1) return <></>

  return (
    <div className="flex items-center justify-center gap-1.5" role="status" aria-label={`Step ${currentIndex + 1} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className={cn(
            'size-1.5 rounded-full',
            !prefersReducedMotion && 'transition-all duration-300',
            i === currentIndex ? 'size-2 bg-foreground' : i < currentIndex ? 'bg-foreground/40' : 'bg-border',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
