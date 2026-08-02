import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { MemoryTimelinePoint } from '../analytics'

type MemoryPerformanceTimelineProps = {
  timeline: readonly MemoryTimelinePoint[]
}

const MAX_POINTS_SHOWN = 12

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Memory
// Performance Timeline (item 3). A hand-rolled, dependency-free bar
// visualization — no charting library exists in this project yet, and
// adding one for a handful of real points would be new tooling this
// sprint never asked for. Real confidence per real session, bar height
// proportional to the real score; the most recent `MAX_POINTS_SHOWN`
// sessions are shown, oldest first, so the visual reads left-to-right as
// real chronological progress.
//
// Memory Mode™ Sprint-5 polish: each bar's entrance is staggered by a
// small, real per-index delay (`animationDelay`) so the row draws in
// left-to-right rather than all at once — a real micro-interaction, still
// governed by the same global `prefers-reduced-motion` fallback as every
// other animation in this codebase (that fallback zeroes animation
// duration outright, which correctly neutralizes a delay too).
export function MemoryPerformanceTimeline({ timeline }: MemoryPerformanceTimelineProps): React.JSX.Element {
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
          <div className="flex h-32 items-end gap-2" role="img" aria-label="Confidence across recent memory sessions, oldest to most recent">
            {points.map((point, index) => (
              <div key={point.sessionId} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-muted">
                  <div
                    className="animate-in fade-in slide-in-from-bottom-2 w-full rounded-md bg-primary duration-(--duration-slow) fill-mode-backwards"
                    style={{ height: `${Math.max(4, Math.round(point.confidenceScore * 100))}%`, animationDelay: `${index * 40}ms` }}
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
