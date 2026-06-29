import { CheckCircle2, Circle } from 'lucide-react'
import { formatDurationLabel, type SessionHistoryItem } from '@/lib/exercises/practiceHistory'

type SessionHistoryListProps = {
  sessions: SessionHistoryItem[]
  formatDate: (iso: string) => string
}

// `formatDate` is injected so this reuses whatever relative-date formatter
// the page already has (e.g. the existing formatRelativeDate on /progress)
// instead of defining a second one.
export function SessionHistoryList({ sessions, formatDate }: SessionHistoryListProps): React.JSX.Element {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No practice sessions yet.</p>
  }

  return (
    <div className="divide-y rounded-xl border bg-card">
      {sessions.map((session, index) => (
        <div key={`${session.exerciseId}-${session.occurredAt}-${index}`} className="flex items-center gap-3 px-4 py-3">
          {session.completed ? (
            <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-label="Completed" />
          ) : (
            <Circle className="size-4 shrink-0 text-muted-foreground/40" aria-label="Not completed" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {session.completed ? 'Completed' : 'Exited early'} · {formatDurationLabel(session.durationMs)}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDate(session.occurredAt)}</span>
        </div>
      ))}
    </div>
  )
}
