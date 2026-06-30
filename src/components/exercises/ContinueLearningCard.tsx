import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProgressRing } from './ProgressRing'

type ContinueLearningCardProps = {
  eyebrow: string
  title: string
  actionLabel: string
  actionHref: string | null
  completedCount: number
  totalCount: number
  lastCompletedTitle: string | null
  isComplete: boolean
  resumeContextLabel?: string
  remainingCount?: number
  variant?: 'hero' | 'compact'
}

// Presentation only — every number and label is computed upstream by
// getContinueLearningSummary from real exercise_progress data. Used as the
// "hero" on a Lab's own landing page and as a "compact" summary on the main
// dashboard, so the two surfaces never duplicate this layout.
export function ContinueLearningCard({
  eyebrow,
  title,
  actionLabel,
  actionHref,
  completedCount,
  totalCount,
  lastCompletedTitle,
  isComplete,
  resumeContextLabel,
  remainingCount,
  variant = 'hero',
}: ContinueLearningCardProps): React.JSX.Element {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isHero = variant === 'hero'

  return (
    <div
      className={cn(
        'group rounded-2xl border bg-card transition-shadow duration-200',
        isHero
          ? 'p-8 shadow-sm hover:shadow-md text-center'
          : 'p-5 hover:shadow-sm',
      )}
    >
      <div className={cn('flex items-center gap-6', isHero ? 'flex-col' : 'flex-row')}>
        <ProgressRing
          progress={totalCount > 0 ? completedCount / totalCount : 0}
          size={isHero ? 96 : 56}
          label={isHero ? `${percent}%` : `${completedCount}/${totalCount}`}
          accessibleLabel={`${percent}% complete — ${completedCount} of ${totalCount} exercises finished`}
        />

        <div className={cn('min-w-0', isHero ? 'text-center' : 'flex-1 text-left')}>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
          <h2
            className={cn(
              'mt-1.5 font-semibold leading-snug tracking-tight text-foreground',
              isHero ? 'text-2xl' : 'text-base',
            )}
          >
            {title}
          </h2>

          {lastCompletedTitle !== null && (
            <p className="mt-1 text-sm text-muted-foreground">Last completed: {lastCompletedTitle}</p>
          )}

          {resumeContextLabel !== undefined && (
            <p className="mt-1 text-sm text-muted-foreground">{resumeContextLabel}</p>
          )}

          {!isHero && actionHref !== null && (
            <div className="mt-3">
              <Button asChild size="sm">
                <Link href={actionHref}>
                  {actionLabel}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {isHero && (
        <p className="mt-3 text-sm text-muted-foreground">
          {isComplete
            ? "You've completed every exercise in this module."
            : `${completedCount} of ${totalCount} exercises complete${
                remainingCount !== undefined ? ` — ${remainingCount} remaining` : ''
              }`}
        </p>
      )}

      {isHero && actionHref !== null && (
        <Button asChild size="lg" className="mt-6 min-w-[200px] gap-2 rounded-full" aria-label={actionLabel}>
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
