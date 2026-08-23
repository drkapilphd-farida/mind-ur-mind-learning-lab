import { CalendarClock, Video } from 'lucide-react'
import type { ActiveMasterclass } from '../queries/getActiveMasterclasses'

type UpcomingCohortScheduleProps = {
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

// Live Member Training Hub™ — real, admin-authored upcoming sessions from
// the `masterclasses` table. No countdown timer, no fabricated seat
// count — just the real date and, once set, the real join link. When
// nothing is scheduled, this renders a plain, honest empty state, never
// a sales pitch to fill the gap.
export function UpcomingCohortSchedule({ sessions }: UpcomingCohortScheduleProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Next Live Cohort</p>

      {sessions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No live session is currently scheduled. Check back soon.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="rounded-xl border border-border/60 bg-card/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{session.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{session.description}</p>
                </div>
                {session.joinUrl !== null && (
                  <a
                    href={session.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.12]"
                  >
                    <Video className="size-3.5" aria-hidden="true" />
                    Join Live Session
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
