import { CheckCircle2, Clock, Lock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MandalaLevelDifficulty, MandalaLevelStatus } from '../../mandalaLevels'

// Mirrors TratakMissionCard.tsx's status-badge styling (Sprint-10A), a new
// local copy scoped to Mandala Tratak's own 5-level roadmap.
const STATUS_BADGE_CLASS: Record<MandalaLevelStatus, string> = {
  completed: 'bg-success/15 text-success border-success/30',
  unlocked: 'bg-primary/15 text-primary border-primary/30',
  locked: 'bg-muted/50 text-muted-foreground border-dashed border-border',
}

function formatDuration(seconds: number): string {
  return `${seconds} sec`
}

type MandalaLevelCardProps = {
  order: number
  title: string
  difficulty: MandalaLevelDifficulty
  durationSeconds: number
  xpReward: number
  status: MandalaLevelStatus
  isCurrent: boolean
  canSelect: boolean
  onSelect: () => void
}

export function MandalaLevelCard({
  order,
  title,
  difficulty,
  durationSeconds,
  xpReward,
  status,
  isCurrent,
  canSelect,
  onSelect,
}: MandalaLevelCardProps): React.JSX.Element {
  const isLocked = status === 'locked'

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!canSelect}
      className={cn(
        'w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition-all duration-150',
        isLocked && 'opacity-70',
        canSelect && 'hover:border-foreground/20 hover:-translate-y-0.5 active:scale-[0.99]',
        !canSelect && 'cursor-not-allowed',
        isCurrent && 'border-primary/40 ring-1 ring-primary/20',
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border', STATUS_BADGE_CLASS[status])}>
          {status === 'completed' ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : isLocked ? (
            <Lock className="size-4" aria-hidden="true" />
          ) : (
            <span className="text-xs font-semibold">{order}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Level {order}</span>
            {isCurrent && status !== 'completed' && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Current</span>
            )}
          </div>
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-full border bg-muted/30 px-2 py-0.5">{difficulty}</span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2 py-0.5">
          <Clock className="size-3" aria-hidden="true" />
          {formatDuration(durationSeconds)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-2 py-0.5">
          <Sparkles className="size-3" aria-hidden="true" />+{xpReward} XP
        </span>
      </div>
    </button>
  )
}
