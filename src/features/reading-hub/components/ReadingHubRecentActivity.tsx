import { formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'

export type ReadingHubRecentActivityRecord = {
  modeTitle: string
  durationMs: number
  completed: boolean
}

type ReadingHubRecentActivityProps = {
  record: ReadingHubRecentActivityRecord | null
}

// Sprint 3.3A — real Mode/Duration/Completed status from practice_sessions.
// Reading Pace and Completion % are deliberately NOT shown as numbers here:
// practice_sessions has no WPM/completion-percent column (only a single
// rolling Best WPM is ever persisted, to localStorage, per mode) — there is
// no real per-session WPM/completion history anywhere to read. Showing an
// honest "Not tracked yet" beats fabricating a number.
export function ReadingHubRecentActivity({ record }: ReadingHubRecentActivityProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Last Session</p>
      {record === null ? (
        <p className="text-sm text-muted-foreground">No sessions yet — start any Reading Mode above to see it here.</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Reading Mode</dt>
            <dd className="font-medium text-foreground">{record.modeTitle}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Duration</dt>
            <dd className="font-medium text-foreground">{formatElapsedTime(record.durationMs)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Reading Pace</dt>
            <dd className="font-medium text-muted-foreground/70">Not tracked yet</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Completion</dt>
            <dd className="font-medium text-foreground">{record.completed ? 'Completed' : 'Not tracked yet'}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
