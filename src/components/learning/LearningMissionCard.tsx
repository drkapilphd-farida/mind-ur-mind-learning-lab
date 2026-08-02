import Link from 'next/link'
import { BookOpen, PlayCircle } from 'lucide-react'
import { DifficultyBadge } from '@/components/learning/DifficultyBadge'
import { Button } from '@/components/ui/button'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { BlueprintDifficulty } from '@/types/learning/blueprint'

type LearningMissionCardProps = {
  projectTitle: string
  documentTitle: string
  startingChapterTitle: string | null
  estimatedReadingMinutes: number
  difficulty: BlueprintDifficulty
  recommendedModeEmoji: string
  recommendedModeTitle: string
  recommendedReason: string
  startLearningHref: string
  onStartLearningClick?: () => void
}

// AI Learning Studio™ V1 Launch UX Transformation — Screen 6, "Today's
// Mission." Consolidates what used to be two separate sections
// (BlueprintHero + AIRecommendationHero, plus a couple of AIObservationCards
// stats) into one concise, immediately-actionable card — the first thing a
// learner sees, above everything else this page still honestly preserves
// below. Every value here is real, already-computed data (the same real
// LearningBlueprint fields BlueprintHero/AIRecommendationHero already
// rendered) — nothing new is derived, only presented differently.
export function LearningMissionCard({
  projectTitle,
  documentTitle,
  startingChapterTitle,
  estimatedReadingMinutes,
  difficulty,
  recommendedModeEmoji,
  recommendedModeTitle,
  recommendedReason,
  startLearningHref,
  onStartLearningClick,
}: LearningMissionCardProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-background/60 px-8 py-10 text-center shadow-lg backdrop-blur-sm sm:px-12 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.06] to-transparent" aria-hidden="true" />

      <p className={cn(TYPOGRAPHY.label, 'text-primary')}>Today&rsquo;s Mission</p>
      <h1 className={cn(TYPOGRAPHY.display, 'mt-2')}>{projectTitle}</h1>
      <p className={TYPOGRAPHY.small}>From {documentTitle}</p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <DifficultyBadge difficulty={difficulty} />
        <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>
          <BookOpen className={ICON_SIZE.sm} aria-hidden="true" />
          ~{estimatedReadingMinutes} min
        </span>
        {startingChapterTitle && <span className={cn(TYPOGRAPHY.small, 'inline-flex items-center gap-1.5')}>Start with &ldquo;{startingChapterTitle}&rdquo;</span>}
      </div>

      <p className="mt-6 text-4xl" aria-hidden="true">
        {recommendedModeEmoji}
      </p>
      <h2 className={cn(TYPOGRAPHY.h2, 'mt-2')}>{recommendedModeTitle}</h2>
      <p className={cn(TYPOGRAPHY.body, 'mx-auto mt-3 max-w-lg text-muted-foreground')}>{recommendedReason}</p>

      <Button asChild size="lg" className="mt-8 min-w-[260px] rounded-full">
        <Link href={startLearningHref} {...(onStartLearningClick !== undefined ? { onClick: onStartLearningClick } : {})}>
          <PlayCircle className="size-4" aria-hidden="true" />
          Start Learning
        </Link>
      </Button>
    </section>
  )
}
