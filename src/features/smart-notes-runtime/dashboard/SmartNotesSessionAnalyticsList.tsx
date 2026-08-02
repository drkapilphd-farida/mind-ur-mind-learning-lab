import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { SmartNotesSessionAnalytics } from '../analytics'

type SmartNotesSessionAnalyticsListProps = {
  sessionAnalytics: readonly SmartNotesSessionAnalytics[]
}

const MAX_SESSIONS_SHOWN = 10

const ENGAGEMENT_BADGE: Record<SmartNotesSessionAnalytics['engagementLevel'], { label: string; variant: 'success' | 'secondary' | 'warning' }> = {
  strong: { label: 'Strong', variant: 'success' },
  developing: { label: 'Developing', variant: 'secondary' },
  'needs-review': { label: 'Needs review', variant: 'warning' },
}

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Smart Notes™ Sprint-4 — Analytics & Insights™. Session Analytics. The
// most recent real sessions, each showing its own real date, status,
// completion, and engagement — reusing the same `SmartNotesSessionAnalytics`
// record every other dashboard widget reads from. Mirrors Memory Mode™'s
// own `MemorySessionAnalyticsList` (Sprint-4) exactly.
export function SmartNotesSessionAnalyticsList({ sessionAnalytics }: SmartNotesSessionAnalyticsListProps): React.JSX.Element {
  const sessions = [...sessionAnalytics].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()).slice(0, MAX_SESSIONS_SHOWN)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className={TYPOGRAPHY.small}>No smart notes sessions yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((session) => (
              <li key={session.sessionId} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40">
                <div>
                  <p className={TYPOGRAPHY.body}>{formatSessionDate(session.capturedAt)}</p>
                  <p className={TYPOGRAPHY.caption}>
                    {Math.round(session.tracking.completionRate * 100)}% complete · {session.status}
                  </p>
                </div>
                <Badge variant={ENGAGEMENT_BADGE[session.engagementLevel].variant}>{ENGAGEMENT_BADGE[session.engagementLevel].label}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
