import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatElapsedDuration } from '@/features/learning-mode-runtime/presentation/formatSessionDuration'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { getMemoryMethodDefinition } from '../types/MemoryMethod'
import type { MemoryMethodId } from '../types/MemoryMethod'

type MemorySessionSummaryScreenProps = {
  documentTitle: string
  totalChunks: number
  metrics: SessionSnapshot['metrics']
  startedAt: string | null
  completedAt: string | null
  method: MemoryMethodId | null
  projectId: string
}

// Memory Mode™ Sprint-2 — Session Summary Screen. Shown once the real,
// persisted `SessionSnapshot.status === 'completed'` (LSE-1's own real
// completion detection, reached via `completeRuntime` or real natural
// exhaustion) — the same trigger Quantum Speed Reading™'s own
// `CompletedSessionScreen` uses. Every figure here is a real,
// already-computed field: `metrics.completedChunks`/`totalChunks`/
// `revisitedChunks` (LSE-3's own `RuntimeMetrics`, mode-agnostic, no new
// metric), and elapsed time derived from the session's own real
// `startedAt`/`completedAt` timestamps via the same shared duration
// formatter the Session Timer uses. No score, no grade, no gamification —
// consistent with the platform's own Mastery Philosophy and its ban on
// quiz/test/score language.
//
// Memory Mode™ Sprint-5 polish: rebuilt on the real `Card` primitive
// (matching the Memory Progress Dashboard's own premium-card convention)
// with a real typography hierarchy and a real `Progress` bar visualizing
// `completedChunks`/`totalChunks` — the exact same figures the previous,
// plainer `EmptyStateCard` layout already showed as text, now also shown
// visually. No new field, no new prop, no changed trigger condition.
// AI Learning Studio™ Sprint ALS-9 — `projectId` (+ the "Back to Learning
// Blueprint" link below) added: this route is immersive/chrome-free, so
// without it a learner who finished a session had no way to navigate
// anywhere in the UI. No session/runtime logic changed.
//
// AI Learning Studio™ Sprint ALS-19 — Production Polish™. Icon swapped
// from `Sparkles` to `CheckCircle2`, matching the "session complete"
// checkmark every other stepped-session mode's own summary screen uses
// (Quantum Speed Reading™, Focus Mode™, MCQs™, Revision Mode™) — a
// production consistency audit found this was the one real deviation
// from an otherwise-unanimous icon convention. Purely cosmetic.
export function MemorySessionSummaryScreen({ documentTitle, totalChunks, metrics, startedAt, completedAt, method, projectId }: MemorySessionSummaryScreenProps): React.JSX.Element {
  const elapsed = startedAt !== null && completedAt !== null ? formatElapsedDuration((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000) : null
  const percentage = totalChunks > 0 ? Math.round((metrics.completedChunks / totalChunks) * 100) : 0
  const methodLabel = method !== null ? getMemoryMethodDefinition(method).label : null

  return (
    <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
      <Card>
        <CardContent className="space-y-6 text-center">
          <div className="animate-in zoom-in-95 mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 duration-(--duration-slow)">
            <CheckCircle2 className={`${ICON_SIZE.lg} text-primary`} aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className={TYPOGRAPHY.h2}>Session summary</h1>
            <p className={TYPOGRAPHY.small}>
              You reviewed {metrics.completedChunks} of {totalChunks} concepts in &quot;{documentTitle}.&quot;
            </p>
            {methodLabel !== null && <p className={TYPOGRAPHY.caption}>Using {methodLabel}</p>}
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Concepts reviewed</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} aria-label="Concepts reviewed this session" aria-valuetext={`${percentage}% of concepts reviewed`} />
          </div>

          {(elapsed !== null || metrics.revisitedChunks > 0) && (
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {elapsed !== null && (
                <div>
                  <dt className={TYPOGRAPHY.caption}>Time spent</dt>
                  <dd className="text-sm font-medium tabular-nums text-foreground">{elapsed}</dd>
                </div>
              )}
              {metrics.revisitedChunks > 0 && (
                <div>
                  <dt className={TYPOGRAPHY.caption}>Concepts revisited</dt>
                  <dd className="text-sm font-medium tabular-nums text-foreground">{metrics.revisitedChunks}</dd>
                </div>
              )}
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
