import { PASSAGE_CATEGORY_LABEL, PASSAGE_DIFFICULTY_LABEL } from '../../passageDifficulty'
import { formatElapsedTime } from '../../readingSessionEngine'
import type { ReadingProfile } from '../../adaptive-intelligence/readingIntelligenceTypes'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type ReadingProfileStatsProps = {
  profile: ReadingProfile
}

export function ReadingProfileStats({ profile }: ReadingProfileStatsProps): React.JSX.Element {
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">These numbers track how your reading brain is changing over time.</p>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Average WPM</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{profile.averageWpm}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Average Accuracy</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{profile.averageAccuracy}%</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Average Comprehension</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{profile.averageComprehension}%</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Average Reading Score</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{profile.averageReadingScore}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Best Category</dt>
        <dd className="mt-1 text-sm font-semibold text-foreground">
          {profile.bestCategory ? PASSAGE_CATEGORY_LABEL[profile.bestCategory] : '—'}
        </dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Growth Area</dt>
        <dd className="mt-1 text-sm font-semibold text-foreground">
          {profile.weakestCategory ? PASSAGE_CATEGORY_LABEL[profile.weakestCategory] : '—'}
        </dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Current Difficulty</dt>
        <dd className="mt-1 text-sm font-semibold text-foreground">
          {profile.currentDifficulty ? PASSAGE_DIFFICULTY_LABEL[profile.currentDifficulty] : '—'}
        </dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Sessions Completed</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{profile.sessionsCompleted}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Total Reading Time</dt>
        <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatElapsedTime(profile.totalReadingTimeMs)}</dd>
      </div>
      <div className="rounded-xl bg-muted/40 px-3 py-4">
        <dt className={LAB_STAT_LABEL_CLASS}>Last Reading Date</dt>
        <dd className="mt-1 text-sm font-semibold text-foreground">{profile.lastReadingDate ?? '—'}</dd>
      </div>
      </dl>
    </div>
  )
}
