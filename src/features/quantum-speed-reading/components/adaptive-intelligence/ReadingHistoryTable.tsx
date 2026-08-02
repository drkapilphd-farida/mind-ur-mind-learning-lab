import { CheckCircle2, Circle } from 'lucide-react'
import { PASSAGE_CATEGORY_LABEL, PASSAGE_DIFFICULTY_LABEL } from '../../passageDifficulty'
import type { ReadingSessionRecord } from '../../adaptive-intelligence/readingIntelligenceTypes'

type ReadingHistoryTableProps = {
  sessions: readonly ReadingSessionRecord[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Row/date convention mirrors SessionHistoryList.tsx exactly. Sessions
// already arrive newest-first from getReadingIntelligenceSessions.
export function ReadingHistoryTable({ sessions }: ReadingHistoryTableProps): React.JSX.Element {
  if (sessions.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No reading sessions yet — your first session starts your history.</p>
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5 last:border-0 transition-colors duration-150 hover:bg-muted/40"
        >
          {session.completed ? (
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completed" />
          ) : (
            <Circle className="size-4 shrink-0 text-muted-foreground/40" aria-label="Not completed" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {PASSAGE_CATEGORY_LABEL[session.category]} · {PASSAGE_DIFFICULTY_LABEL[session.difficulty]}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session.wpm} WPM · {session.accuracyPercent}% accuracy · {session.comprehensionPercent}% comprehension · Score {session.readingIntelligenceScore}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDate(session.occurredAt)}</span>
        </div>
      ))}
    </div>
  )
}
