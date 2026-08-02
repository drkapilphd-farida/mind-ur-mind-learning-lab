import { formatElapsedTime } from '../../readingSessionEngine'
import type { PersonalBests } from '../../adaptive-intelligence/readingIntelligenceTypes'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type PersonalBestsGridProps = {
  bests: PersonalBests
}

export function PersonalBestsGrid({ bests }: PersonalBestsGridProps): React.JSX.Element {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Highest WPM</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{bests.highestWpm ?? '—'}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Highest Reading Score</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{bests.highestReadingScore ?? '—'}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Best Accuracy</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{bests.bestAccuracy !== null ? `${bests.bestAccuracy}%` : '—'}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Best Comprehension</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{bests.bestComprehension !== null ? `${bests.bestComprehension}%` : '—'}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Fastest Session</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">
          {bests.fastestSessionMs !== null ? formatElapsedTime(bests.fastestSessionMs) : '—'}
        </dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Longest Streak</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{bests.longestStreak}d</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4 sm:col-span-3">
        <dt className={LAB_STAT_LABEL_CLASS}>Best Reading Day</dt>
        <dd className="mt-1 text-sm font-semibold text-foreground">
          {bests.bestReadingDay ? `${bests.bestReadingDay.dateKey} · ${bests.bestReadingDay.sessionCount} sessions` : '—'}
        </dd>
      </div>
    </dl>
  )
}
