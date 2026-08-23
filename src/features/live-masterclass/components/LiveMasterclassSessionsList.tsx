import { CalendarClock, PlayCircle } from 'lucide-react'
import type { ActiveMasterclass } from '../queries/getActiveMasterclasses'

type LiveMasterclassSessionsListProps = {
  sessions: readonly ActiveMasterclass[]
}

function formatSessionDate(scheduledAt: string | null): string {
  if (scheduledAt === null) return 'Date to be announced'
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  }).format(new Date(scheduledAt))
}

// Dynamic Live Masterclass Backend™ (Phase 5) — real, admin-authored
// sessions from the `masterclasses` table, rendered above the hub's
// existing enrollment/waitlist cards. Every field here is real: no
// countdown timer, no fabricated seat count — just what the row actually
// says, including "Date to be announced" when scheduled_at genuinely
// hasn't been set yet.
export function LiveMasterclassSessionsList({ sessions }: LiveMasterclassSessionsListProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{session.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{session.description}</p>
            </div>
            {session.recordingUrl !== null && (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.12]"
              >
                <PlayCircle className="size-3.5" aria-hidden="true" />
                Watch Recording
              </a>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {formatSessionDate(session.scheduledAt)}
            </span>
            <span>with {session.mentorName}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
