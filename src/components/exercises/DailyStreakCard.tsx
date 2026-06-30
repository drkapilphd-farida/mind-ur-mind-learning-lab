import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

type DailyStreakCardProps = {
  currentStreak: number
  bestStreak: number
  lastPracticedLabel: string | null
}

export function DailyStreakCard({
  currentStreak,
  bestStreak,
  lastPracticedLabel,
}: DailyStreakCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Flame
          aria-hidden="true"
          className={cn('size-3.5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')}
        />
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Daily streak</p>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-foreground">
        {currentStreak}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          day{currentStreak !== 1 ? 's' : ''}
        </span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Best: {bestStreak} day{bestStreak !== 1 ? 's' : ''}
        {lastPracticedLabel !== null ? ` · ${lastPracticedLabel}` : ''}
      </p>
    </div>
  )
}
