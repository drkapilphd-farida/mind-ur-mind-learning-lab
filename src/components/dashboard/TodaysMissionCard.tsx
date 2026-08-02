import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MissionExercise = {
  id: string
  title: string
  status: 'completed' | 'current' | 'upcoming'
}

type TodaysMissionCardProps = {
  exercises: MissionExercise[]
  actionHref: string | null
  actionLabel: string
  isAllDone: boolean
  mindScoreGoal?: number   // optional Sprint 3E addition; renders a score goal row when provided
}

// Average duration per exercise in minutes — used for the estimated time label.
const MINUTES_PER_EXERCISE = 4

export function TodaysMissionCard({
  exercises,
  actionHref,
  actionLabel,
  isAllDone,
  mindScoreGoal,
}: TodaysMissionCardProps): React.JSX.Element {
  const remaining = exercises.filter((e) => e.status !== 'completed').length
  const estimatedMinutes = remaining * MINUTES_PER_EXERCISE

  return (
    <div className="glass-premium-card glass-premium-lift flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Today&apos;s Mission™
        </p>
        {!isAllDone && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            ~{estimatedMinutes} min
          </span>
        )}
      </div>

      {mindScoreGoal !== undefined && (
        <div className="mt-3 flex items-center gap-2.5">
          <div className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/30" aria-label="Goal" />
          <span className="text-sm text-muted-foreground">
            Reach Mind Score <span className="font-semibold text-foreground">{mindScoreGoal}</span>
          </span>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2.5" role="list" aria-label="Today's mission exercises">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="flex items-center gap-2.5">
            {exercise.status === 'completed' ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completed" />
            ) : exercise.status === 'current' ? (
              <div className="size-4 shrink-0 rounded-full border-2 border-primary" aria-label="Current" />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground/30" aria-label="Upcoming" />
            )}
            <span
              className={cn(
                'text-sm',
                exercise.status === 'completed' && 'text-muted-foreground line-through',
                exercise.status === 'current' && 'font-medium text-foreground',
                exercise.status === 'upcoming' && 'text-muted-foreground',
              )}
            >
              {exercise.title}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1 flex items-end">
        {isAllDone ? (
          <p className="text-sm font-medium text-success">
            Mission complete — your mind grew stronger today.
          </p>
        ) : actionHref !== null ? (
          <Button asChild size="lg" className="w-full gap-2 rounded-full">
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
