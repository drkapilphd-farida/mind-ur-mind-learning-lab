'use client'

import { Check, CircleDashed, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { DashboardJourneyStage, DashboardJourneyStageStatus } from '../../dashboard/journeyProgressEngine'

const STATUS_ICON: Record<DashboardJourneyStageStatus, typeof Check> = {
  completed: Check,
  active: Check,
  available: CircleDashed,
  'not-tracked': HelpCircle,
}

const STATUS_NODE_CLASS: Record<DashboardJourneyStageStatus, string> = {
  completed: 'bg-success/15 text-success border-success/30 shadow-[0_0_16px_-4px] shadow-success/40',
  active: 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_16px_-4px] shadow-primary/40',
  available: 'bg-muted text-muted-foreground border-border',
  'not-tracked': 'bg-muted/50 text-muted-foreground border-dashed border-border',
}

type JourneyProgressTimelineProps = {
  stages: readonly DashboardJourneyStage[]
}

// A new horizontal timeline built fresh for this sprint (Sprint-8's own
// EvolutionTimeline.tsx stays untouched — this is a distinct, 9-stage
// Sprint-9-scoped list). Completed/active stages get a soft glow, per the
// brief's "completed stages glowing."
export function JourneyProgressTimeline({ stages }: JourneyProgressTimelineProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-start gap-2 px-1 py-2">
        {stages.map((stage, index) => {
          const Icon = STATUS_ICON[stage.status]
          return (
            <div key={stage.id} className="flex items-start">
              <div className="flex w-24 flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2',
                    STATUS_NODE_CLASS[stage.status],
                    stage.status === 'active' && !prefersReducedMotion && 'animate-pulse',
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </div>
                <p className="text-[11px] leading-tight font-medium text-foreground">{stage.label}</p>
              </div>
              {index < stages.length - 1 ? <div className="mt-[18px] h-0.5 w-6 bg-border" aria-hidden="true" /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
