import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatElapsedDuration } from '@/features/learning-mode-runtime/presentation/formatSessionDuration'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { SessionSnapshot } from '@/core/learning-session-runtime'

type CompletedSessionScreenProps = {
  documentTitle: string
  totalChunks: number
  metrics: SessionSnapshot['metrics']
  projectId: string
  startedAt: string | null
  completedAt: string | null
}

// Quantum Speed Reading™ Production Sprint-2. Completed Session Screen —
// shown once the real, persisted `SessionSnapshot.status === 'completed'`
// (LSE-1's own real completion detection, reached via `completeRuntime`
// or real natural exhaustion). No score, no grade, no gamification — a
// plain, honest confirmation only, consistent with the platform's own
// Mastery Philosophy.
//
// AI Learning Studio™ Sprint ALS-9 — `projectId` (+ the "Back to Learning
// Blueprint" link) added: this route is immersive/chrome-free
// (AppShell's own IMMERSIVE_ROUTE_PATTERNS), so without it a learner who
// finished a session had no way to navigate anywhere in the UI. No
// session/runtime logic changed — a real, honest navigation link only.
//
// AI Learning Studio™ Sprint ALS-14 — real, already-persisted
// `startedAt`/`completedAt` timestamps now surface as a plain elapsed-time
// fact, reusing the exact `formatElapsedDuration` the live in-session
// timer already uses. This is a neutral duration, not a score or grade —
// consistent with, not a departure from, this screen's own "no
// gamification" rule. Both timestamps are honestly nullable
// (`SessionSnapshot`'s own real shape); the line is simply omitted rather
// than guessed at if either is missing.
//
// AI Learning Studio™ Sprint ALS-19 — Production Polish™. Rebuilt on the
// real `Card` primitive + a real `Progress` bar + `TYPOGRAPHY` tokens,
// matching the exact structural template every later mode's own summary
// screen already uses (Memory Mode™'s `MemorySessionSummaryScreen.tsx`,
// Focus Mode™'s, MCQs™'s, Revision Mode™'s). A production consistency
// audit found this was the one completion screen (of six) still on the
// older, pre-Sprint-5-polish `EmptyStateCard` layout — no new field, no
// new prop beyond the real `metrics` this screen's own caller already has
// on hand (`state.snapshot.metrics`), no changed trigger condition.
export function CompletedSessionScreen({ documentTitle, totalChunks, metrics, projectId, startedAt, completedAt }: CompletedSessionScreenProps): React.JSX.Element {
  const elapsed = startedAt !== null && completedAt !== null ? formatElapsedDuration((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000) : null
  const percentage = totalChunks > 0 ? Math.round((metrics.completedChunks / totalChunks) * 100) : 0

  return (
    <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
      <Card>
        <CardContent className="space-y-6 text-center">
          <div className="animate-in zoom-in-95 mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 duration-(--duration-slow)">
            <CheckCircle2 className={`${ICON_SIZE.lg} text-primary`} aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className={TYPOGRAPHY.h2}>You&apos;ve finished this reading session</h1>
            <p className={TYPOGRAPHY.small}>
              You read {metrics.completedChunks} of {totalChunks} sections of &quot;{documentTitle}.&quot;
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sections read</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} aria-label="Sections read this session" aria-valuetext={`${percentage}% of sections read`} />
          </div>

          {elapsed !== null && (
            <dl className="grid grid-cols-1 gap-3 border-t pt-4">
              <div>
                <dt className={TYPOGRAPHY.caption}>Time spent</dt>
                <dd className="text-sm font-medium tabular-nums text-foreground">{elapsed}</dd>
              </div>
            </dl>
          )}

          <Button asChild variant="ghost">
            <Link href={`/preview/learning-projects/${projectId}`}>Back to Learning Blueprint</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
