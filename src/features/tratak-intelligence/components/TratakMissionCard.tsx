import Link from 'next/link'
import { CheckCircle2, Clock, Lock, Sparkles, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TratakDifficulty } from '../tratakMissions'
import type { TratakMissionStatus } from '../tratakMissionEngine'

// Mirrors JourneyProgressTimeline.tsx's status-based node styling
// (completed/active/available treatment), adapted to Tratak's 3-status
// mission model — a local copy, not a shared import, since that component
// is scoped to Sprint-9's 9-stage dashboard timeline.
const STATUS_BADGE_CLASS: Record<TratakMissionStatus, string> = {
  completed: 'bg-success/15 text-success border-success/30',
  unlocked: 'bg-primary/15 text-primary border-primary/30',
  locked: 'bg-muted/50 text-muted-foreground border-dashed border-border',
}

function formatEstimatedTime(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}

type TratakMissionCardProps = {
  order: number
  title: string
  description: string
  icon: LucideIcon
  difficulty: TratakDifficulty
  estimatedTimeSeconds: number
  xpReward: number
  status: TratakMissionStatus
  /** Sprint 10B+: set once a mission has a real, playable route. Missions
   * without one yet keep the original disabled "Coming Soon" button. */
  href?: string | undefined
}

// Renders a real link once a mission has a playable route (href); missions
// without one yet keep the original disabled "Coming Soon" button — never
// a dead link.
export function TratakMissionCard({
  order,
  title,
  description,
  icon: Icon,
  difficulty,
  estimatedTimeSeconds,
  xpReward,
  status,
  href,
}: TratakMissionCardProps): React.JSX.Element {
  const isLocked = status === 'locked'

  return (
    <div className={cn('rounded-3xl border bg-card p-6 shadow-sm', isLocked && 'opacity-70')}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full border',
            STATUS_BADGE_CLASS[status],
          )}
        >
          {isLocked ? <Lock className="size-4" aria-hidden="true" /> : <Icon className="size-5" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Mission {order}</span>
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                Completed
              </span>
            )}
          </div>
          <p className="mt-0.5 text-base font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border bg-muted/30 px-2.5 py-1">{difficulty}</span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2.5 py-1">
          <Clock className="size-3" aria-hidden="true" />
          {formatEstimatedTime(estimatedTimeSeconds)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2.5 py-1">
          <Sparkles className="size-3" aria-hidden="true" />+{xpReward} XP
        </span>
      </div>

      {isLocked ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
          Locked — complete the previous mission first
        </p>
      ) : href !== undefined ? (
        <Button asChild size="lg" className="mt-4 w-full gap-2 rounded-full">
          <Link href={href}>{status === 'completed' ? 'Practice Again' : 'Continue'}</Link>
        </Button>
      ) : (
        <Button size="lg" disabled className="mt-4 w-full gap-2 rounded-full">
          Coming Soon
        </Button>
      )}
    </div>
  )
}
