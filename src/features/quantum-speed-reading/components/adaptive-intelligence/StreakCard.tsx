import { Flame } from 'lucide-react'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type StreakCardProps = {
  currentStreak: number
  longestStreak: number
  lastReadingDate: string | null
}

export function StreakCard({ currentStreak, longestStreak, lastReadingDate }: StreakCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <Flame className="size-6" aria-hidden="true" />
        </div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <p className={LAB_STAT_LABEL_CLASS}>Current Streak</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{currentStreak}d</p>
          </div>
          <div>
            <p className={LAB_STAT_LABEL_CLASS}>Longest Streak</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{longestStreak}d</p>
          </div>
          <div className="text-right">
            <p className={LAB_STAT_LABEL_CLASS}>Last Session</p>
            <p className="text-sm font-semibold text-foreground">{lastReadingDate ?? 'Start today'}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Every streak day is another rep for your reading brain.</p>
    </div>
  )
}
