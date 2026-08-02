import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatElapsedDuration } from '@/features/learning-mode-runtime/presentation/formatSessionDuration'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { SessionSnapshot } from '@/core/learning-session-runtime'

type RevisionSessionSummaryScreenProps = {
  documentTitle: string
  totalChunks: number
  metrics: SessionSnapshot['metrics']
  startedAt: string | null
  completedAt: string | null
  projectId: string
}

// Revision Mode™ — AI Learning Studio™ Sprint ALS-17 — Session Summary
// Screen, structurally mirroring every other mode's own completion screen.
// No score, no grade, no "improvement" claim — this platform's own
// Mastery Philosophy applies here exactly as it does everywhere else.
export function RevisionSessionSummaryScreen({ documentTitle, totalChunks, metrics, startedAt, completedAt, projectId }: RevisionSessionSummaryScreenProps): React.JSX.Element {
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
            <h1 className={TYPOGRAPHY.h2}>Revision pass complete</h1>
            <p className={TYPOGRAPHY.small}>
              You reviewed {metrics.completedChunks} of {totalChunks} sections in &quot;{documentTitle}.&quot;
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sections reviewed</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} aria-label="Sections reviewed this session" aria-valuetext={`${percentage}% of sections reviewed`} />
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
