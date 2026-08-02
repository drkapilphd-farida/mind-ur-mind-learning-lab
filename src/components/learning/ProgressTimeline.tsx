import { CheckCircle2, Cog, PlayCircle, Sparkles, Trophy, UploadCloud } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PROJECT_LIFECYCLE_STAGES } from '@/constants/learning/lifecycleStages'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { ProjectLifecycleStageId, ProjectLifecycleStageState } from '@/types/learning/lifecycle'

const STAGE_ICON: Record<ProjectLifecycleStageId, LucideIcon> = {
  upload: UploadCloud,
  processing: Cog,
  'blueprint-ready': Sparkles,
  'learning-started': PlayCircle,
  completed: Trophy,
}

type ProgressTimelineProps = {
  stages: readonly ProjectLifecycleStageState[]
}

// Reusable Progress Timeline (Sprint 2, Chunk 1) — the project's own
// five-stage lifecycle (Upload → Processing → Blueprint Ready →
// Learning Started → Completed). Distinct from ProcessingTimeline
// (Sprint 1 Chunk 3's live async processing-run animation) and
// JourneyTimeline (Sprint 1 Chunk 4's in-blueprint learning path) — all
// three model genuinely different things and are kept separate rather
// than forced into one over-generalized timeline component.
export function ProgressTimeline({ stages }: ProgressTimelineProps): React.JSX.Element {
  return (
    <ol className="space-y-1">
      {PROJECT_LIFECYCLE_STAGES.map((definition, index) => {
        const stage = stages[index]
        const status = stage?.status ?? 'upcoming'
        const Icon = status === 'complete' ? CheckCircle2 : STAGE_ICON[definition.id]

        return (
          <li key={definition.id} className={cn('flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors', status === 'current' && 'bg-accent/40')}>
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                status === 'complete' && 'bg-foreground/10 text-foreground',
                status === 'current' && 'bg-primary/10 text-primary',
                status === 'upcoming' && 'bg-muted text-muted-foreground/40',
              )}
            >
              <Icon className={ICON_SIZE.md} />
            </span>
            <div className="min-w-0">
              <p className={cn(TYPOGRAPHY.h4, status === 'upcoming' && 'text-muted-foreground')}>{definition.label}</p>
              <p className={TYPOGRAPHY.caption}>{definition.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
