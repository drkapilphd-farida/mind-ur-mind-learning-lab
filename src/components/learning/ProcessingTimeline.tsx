'use client'

import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import type { ProcessingStageDefinition } from '@/constants/learning/processingStages'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { ProcessingStageState } from '@/types/learning/processing'

type ProcessingTimelineProps = {
  definitions: readonly ProcessingStageDefinition[]
  stages: readonly ProcessingStageState[]
}

// AI Thinking Timeline™ (Sprint LW-1D) — the reusable "Processing
// Timeline" component, redesigned: completed stages show a check, the
// active stage is emphasized with a soft glow (never a spinner — a
// spinner reads as "loading," which this experience deliberately avoids
// in favour of feeling like understanding is actively happening), pending
// stages recede. Same contract as before — pure presentational, takes
// whatever state useProcessingPipeline produces; the pipeline itself is
// untouched.
export function ProcessingTimeline({ definitions, stages }: ProcessingTimelineProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <ol className="space-y-2">
      {definitions.map((definition, index) => {
        const stage = stages[index]
        const status = stage?.status ?? 'pending'

        return (
          <li
            key={definition.id}
            className={cn(
              'flex items-start gap-4 rounded-2xl px-4 py-3.5 transition-all duration-500 ease-out',
              status === 'active' && 'bg-primary/[0.05] shadow-sm',
              status === 'pending' && 'opacity-50',
            )}
          >
            <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
              {status === 'complete' && <CheckCircle2 className={cn(ICON_SIZE.lg, 'text-foreground')} />}
              {status === 'active' && (
                <>
                  <span className={cn('absolute inset-0 rounded-full bg-primary/20', !prefersReducedMotion && 'animate-pulse')} />
                  <Circle className={cn(ICON_SIZE.lg, 'relative fill-primary/10 text-primary')} />
                </>
              )}
              {status === 'error' && <XCircle className={cn(ICON_SIZE.lg, 'text-destructive')} />}
              {status === 'pending' && <Circle className={cn(ICON_SIZE.lg, 'text-muted-foreground/30')} />}
            </span>
            <div className="min-w-0">
              <p className={cn(TYPOGRAPHY.h4, status === 'pending' && 'text-muted-foreground')}>{definition.label}</p>
              <p className={TYPOGRAPHY.caption}>{definition.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
