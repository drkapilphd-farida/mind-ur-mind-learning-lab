import Link from 'next/link'
import { BookOpen, CalendarClock, Clock, FileText, PlayCircle, Target } from 'lucide-react'
import { DifficultyBadge } from '@/components/learning/DifficultyBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PROJECT_LIFECYCLE_STAGES } from '@/constants/learning/lifecycleStages'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { BlueprintDifficulty } from '@/types/learning/blueprint'
import type { ProjectLifecycleStageState } from '@/types/learning/lifecycle'

function formatGeneratedDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso))
}

type BlueprintHeroProps = {
  projectTitle: string
  documentTitle: string
  summary: string
  // AI Learning Studio™ Sprint ALS-4 — real, derived from the document's
  // actual mime type (see analyzeDocumentContent), not a private
  // PDF-only lookup table.
  contentTypeLabel: string
  difficulty: BlueprintDifficulty
  // "Estimated learning time" — the existing multi-step-journey estimate.
  estimatedMinutes: number
  // "Estimated reading time" — Sprint ALS-4, real and distinct from the
  // above: analyzeDocumentContent's size-derived estimate of the raw
  // material itself.
  estimatedReadingMinutes: number
  learningObjective: string
  generatedAt: string
  lifecycle: readonly ProjectLifecycleStageState[]
  // AI Learning Studio™ Sprint ALS-6 — real navigation into the already-
  // built Reading Runtime (via the Learning Workspace™), replacing the
  // prior `onPrimaryAction` click-handler that always led to
  // WorkspaceComingSoonScreen regardless of which mode was recommended.
  startLearningHref: string
  onStartLearningClick?: () => void
}

// Sprint 2, Chunk 1 — the redesigned Learning Blueprint™ Hero,
// replacing Sprint 1 Chunk 4's plain title block. The progress ribbon
// reuses the same lifecycle data as ProgressTimeline lower on the page
// (single source of truth — see deriveProjectLifecycle) rendered as a
// compact segmented bar instead of the full vertical list.
export function BlueprintHero({
  projectTitle,
  documentTitle,
  summary,
  contentTypeLabel,
  difficulty,
  estimatedMinutes,
  estimatedReadingMinutes,
  learningObjective,
  generatedAt,
  lifecycle,
  startLearningHref,
  onStartLearningClick,
}: BlueprintHeroProps): React.JSX.Element {
  const completeCount = lifecycle.filter((stage) => stage.status === 'complete').length
  const ribbonPercent = (completeCount / lifecycle.length) * 100
  const currentStageId = lifecycle.find((stage) => stage.status === 'current')?.id
  const currentStageLabel = PROJECT_LIFECYCLE_STAGES.find((definition) => definition.id === currentStageId)?.label ?? 'In Progress'

  return (
    <section>
      <div className="flex items-center gap-2">
        <p className={TYPOGRAPHY.label}>Learning Blueprint™</p>
        <Badge variant="outline">{currentStageLabel}</Badge>
      </div>

      <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>{projectTitle}</h1>
      <p className={TYPOGRAPHY.small}>From {documentTitle}</p>
      <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-3 text-muted-foreground')}>{summary}</p>

      <p className={cn(TYPOGRAPHY.small, 'mt-3 inline-flex items-start gap-1.5')}>
        <Target className={cn(ICON_SIZE.sm, 'mt-0.5 shrink-0')} aria-hidden="true" />
        <span>
          <span className={TYPOGRAPHY.caption}>Learning Objective — </span>
          {learningObjective}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
          <FileText className={ICON_SIZE.sm} aria-hidden="true" />
          {contentTypeLabel}
        </span>
        <DifficultyBadge difficulty={difficulty} />
        <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
          <BookOpen className={ICON_SIZE.sm} aria-hidden="true" />
          ~{estimatedReadingMinutes} min reading time
        </span>
        <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
          <Clock className={ICON_SIZE.sm} aria-hidden="true" />
          ~{estimatedMinutes} min learning time
        </span>
        <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
          <CalendarClock className={ICON_SIZE.sm} aria-hidden="true" />
          Generated {formatGeneratedDate(generatedAt)}
        </span>
      </div>

      <div className="mt-6 max-w-md">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={ribbonPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Learning Project progress">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${ribbonPercent}%` }} />
        </div>
        <p className={cn(TYPOGRAPHY.caption, 'mt-1.5')}>{currentStageLabel}</p>
      </div>

      <Button asChild size="lg" className="mt-6 min-w-[220px] rounded-full">
        <Link href={startLearningHref} {...(onStartLearningClick !== undefined ? { onClick: onStartLearningClick } : {})}>
          <PlayCircle className="size-4" aria-hidden="true" />
          Start Learning
        </Link>
      </Button>
    </section>
  )
}
