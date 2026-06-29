import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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
  variant = 'hero',
}: ContinueLearningCardProps): React.JSX.Element {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isHero = variant === 'hero'

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br from-primary/8 to-primary/4',
        isHero ? 'p-8 text-center' : 'p-6',
      )}
    >
      <div className={cn('flex items-center gap-6', isHero ? 'flex-col' : 'flex-row')}>
        <ProgressRing
          progress={totalCount > 0 ? completedCount / totalCount : 0}
          size={isHero ? 88 : 64}
          label={`${completedCount}/${totalCount}`}
          accessibleLabel={`${percent}% complete — ${completedCount} of ${totalCount} exercises finished`}
        />

        <div className={cn('min-w-0', isHero ? 'text-center' : 'flex-1 text-left')}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
          <h2 className={cn('mt-1 font-bold leading-snug tracking-tight', isHero ? 'text-2xl' : 'text-lg')}>
            {title}
          </h2>

          {lastCompletedTitle !== null && (
            <p className="mt-1 text-sm text-muted-foreground">Last completed: {lastCompletedTitle}</p>
          )}

          {!isHero && (
            <div className="mt-3">
              {actionHref !== null && (
                <Button asChild size="sm">
                  <Link href={actionHref}>
                    {actionLabel}
                    <ChevronRight className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {isHero && (
        <p className="mt-2 text-sm text-muted-foreground">
          {isComplete
            ? "You've completed every exercise in this module."
            : `${completedCount} of ${totalCount} exercises complete`}
        </p>
      )}

      {isHero && actionHref !== null && (
        <Button asChild size="lg" className="mt-6 min-w-[220px] rounded-full shadow-sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
