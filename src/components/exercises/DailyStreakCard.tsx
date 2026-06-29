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
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center gap-1.5">
        <Flame
          aria-hidden="true"
          className={cn('size-3.5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground/40')}
        />
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Daily streak</p>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">
        {currentStreak}
        <span className="ml-1 text-sm font-normal text-muted-foreground">day{currentStreak !== 1 ? 's' : ''}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Best: {bestStreak} day{bestStreak !== 1 ? 's' : ''}
        {lastPracticedLabel !== null ? ` · Last practiced ${lastPracticedLabel}` : ''}
      </p>
    </div>
  )
}
