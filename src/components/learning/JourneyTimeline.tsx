import { CheckCircle2, Clock, Compass, HelpCircle, Layers, Lightbulb, ListChecks, Lock, Network, RotateCcw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { BlueprintJourneyStepId } from '@/types/learning/blueprint'
import type { JourneyStepWithStatus } from '@/types/learning/journeyProgress'

// Resolved here, not carried on BlueprintJourneyStep itself — a
// LucideIcon reference can't cross the Server→Client prop boundary
// (the same RSC serialization rule fixed for ShellNavItem in Sprint 0).
const STEP_ICON: Record<BlueprintJourneyStepId, LucideIcon> = {
  overview: Compass,
  'key-concepts': Lightbulb,
  flashcards: Layers,
  'mind-maps': Network,
  practice: ListChecks,
  quiz: HelpCircle,
  revision: RotateCcw,
}

type JourneyTimelineProps = {
  steps: readonly JourneyStepWithStatus[]
}

// Sprint 1 Chunk 4 → Sprint 2 Chunk 2 — the Learning Journey™, one step
// per Study Mode. Deliberately separate from ProcessingTimeline (Chunk
// 3's live async processing-run animation) and ProgressTimeline (the
// project's own five-stage lifecycle) — this models a fixed
// recommended path through the blueprint's Study Modes, gated by real
// (if currently all-locked-but-first) per-step progress.
export function JourneyTimeline({ steps }: JourneyTimelineProps): React.JSX.Element {
  return (
    <ol className="space-y-1">
      {steps.map((step, index) => {
        const StepIcon = STEP_ICON[step.id]
        const isLocked = step.status === 'locked'

        return (
          <li
            key={step.id}
            className={cn('flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors', step.status === 'available' && 'bg-accent/40')}
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                step.status === 'complete' && 'bg-foreground/10 text-foreground',
                step.status === 'available' && 'bg-primary/10 text-primary',
                isLocked && 'bg-muted text-muted-foreground/40',
              )}
            >
              {step.status === 'complete' ? <CheckCircle2 className={ICON_SIZE.md} /> : isLocked ? <Lock className={ICON_SIZE.sm} /> : <StepIcon className={ICON_SIZE.md} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={cn(TYPOGRAPHY.h4, isLocked && 'text-muted-foreground')}>
                  Step {index + 1}: {step.title}
                </p>
              </div>
              <p className={TYPOGRAPHY.caption}>{step.description}</p>
              <p className={cn(TYPOGRAPHY.caption, 'mt-1 inline-flex items-center gap-1')}>
                <Clock className={ICON_SIZE.sm} aria-hidden="true" />~{step.estimatedMinutes} min
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
