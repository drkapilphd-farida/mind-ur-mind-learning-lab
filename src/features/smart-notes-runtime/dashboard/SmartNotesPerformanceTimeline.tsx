import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { SmartNotesTimelinePoint } from '../analytics'

type SmartNotesPerformanceTimelineProps = {
  timeline: readonly SmartNotesTimelinePoint[]
}

const MAX_POINTS_SHOWN = 12

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Smart Notes™ Sprint-4 — Analytics & Insights™. Performance Timeline. A
// hand-rolled, dependency-free bar visualization — no charting library
// exists in this project. Real engagement per real session, bar height
// proportional to the real score; the most recent sessions are shown,
// oldest first. Mirrors Memory Mode™'s own `MemoryPerformanceTimeline`
// (Sprint-4) exactly.
//
// Smart Notes™ Sprint-5 polish: bars stagger in left-to-right
// (`animationDelay`, 40ms/index) rather than appearing all at once,
// matching Memory's own Sprint-5 timeline treatment exactly.
export function SmartNotesPerformanceTimeline({ timeline }: SmartNotesPerformanceTimelineProps): React.JSX.Element {
  const points = timeline.slice(-MAX_POINTS_SHOWN)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <p className={TYPOGRAPHY.small}>No sessions yet — your timeline will appear after your first one.</p>
        ) : (
          <div className="flex h-32 items-end gap-2" role="img" aria-label="Engagement across recent smart notes sessions, oldest to most recent">
            {points.map((point, index) => (
              <div key={point.sessionId} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-muted">
                  <div
                    className="animate-in fade-in slide-in-from-bottom-2 w-full rounded-md bg-primary duration-(--duration-slow) fill-mode-backwards"
                    style={{ height: `${Math.max(4, Math.round(point.engagementScore * 100))}%`, animationDelay: `${index * 40}ms` }}
                  />
                </div>
                <span className={TYPOGRAPHY.caption}>{formatShortDate(point.capturedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
