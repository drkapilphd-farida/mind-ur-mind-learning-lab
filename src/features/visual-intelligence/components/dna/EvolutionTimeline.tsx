'use client'

import { Check, CircleDashed, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { EvolutionStage, EvolutionStageStatus } from '../../dna/dnaTypes'

const STATUS_ICON: Record<EvolutionStageStatus, typeof Check> = {
  completed: Check,
  active: Check,
  available: CircleDashed,
  'not-tracked': HelpCircle,
}

const STATUS_NODE_CLASS: Record<EvolutionStageStatus, string> = {
  completed: 'bg-success/15 text-success border-success/30',
  active: 'bg-primary/15 text-primary border-primary/30',
  available: 'bg-muted text-muted-foreground border-border',
  'not-tracked': 'bg-muted/50 text-muted-foreground border-dashed border-border',
}

const STATUS_LABEL: Record<EvolutionStageStatus, string> = {
  completed: 'Completed',
  active: 'Active',
  available: 'Not started',
  'not-tracked': 'Not yet tracked',
}

type EvolutionTimelineProps = {
  stages: readonly EvolutionStage[]
}

// A new horizontal timeline built fresh for this sprint (not a reuse or
// modification of the existing vertical TransformationTimeline.tsx).
export function EvolutionTimeline({ stages }: EvolutionTimelineProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-start gap-2 px-1 py-2">
        {stages.map((stage, index) => {
          const Icon = STATUS_ICON[stage.status]
          return (
            <div key={stage.id} className="flex items-start">
              <div className="flex w-28 flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2',
                    STATUS_NODE_CLASS[stage.status],
                    stage.status === 'active' && !prefersReducedMotion && 'animate-pulse',
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </div>
                <p className="text-xs leading-tight font-medium text-foreground">{stage.label}</p>
                <p className="text-[10px] text-muted-foreground">{STATUS_LABEL[stage.status]}</p>
              </div>
              {index < stages.length - 1 ? <div className="mt-5 h-0.5 w-8 bg-border" aria-hidden="true" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
