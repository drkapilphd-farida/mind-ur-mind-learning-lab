import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatElapsedDuration } from '@/features/learning-mode-runtime/presentation/formatSessionDuration'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { getFocusVariantDefinition } from '../types/FocusVariant'
import type { FocusSessionConfig } from '../types/FocusVariant'

type FocusSessionSummaryScreenProps = {
  documentTitle: string
  totalChunks: number
  metrics: SessionSnapshot['metrics']
  startedAt: string | null
  completedAt: string | null
  config: FocusSessionConfig | null
  projectId: string
}

// Focus Mode™ (Mini) Sprint ALS-16 — Session Summary Screen, structurally
// mirroring Memory Mode™'s own `MemorySessionSummaryScreen.tsx` (and, one
// layer further back, Quantum Speed Reading™'s `CompletedSessionScreen.tsx`).
// Shown once the real, persisted `SessionSnapshot.status === 'completed'`.
// Every figure is a real, already-computed field — no score, no grade, no
// gamification, consistent with the platform's own Mastery Philosophy.
// Which real Focus variant was used (and, for Reading Sprint, its real
// target duration) is shown as a plain, neutral fact, the same way Memory
// Mode's own summary now shows which Memory Method was used.
export function FocusSessionSummaryScreen({ documentTitle, totalChunks, metrics, startedAt, completedAt, config, projectId }: FocusSessionSummaryScreenProps): React.JSX.Element {
  const elapsed = startedAt !== null && completedAt !== null ? formatElapsedDuration((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000) : null
  const percentage = totalChunks > 0 ? Math.round((metrics.completedChunks / totalChunks) * 100) : 0
  const variantLabel = config !== null ? (config.variant === 'reading-sprint' ? `${getFocusVariantDefinition(config.variant).label} (${config.targetDurationMinutes} min)` : getFocusVariantDefinition(config.variant).label) : null

  return (
    <div className="animate-in fade-in mx-auto max-w-lg px-6 py-16 duration-(--duration-slow)">
      <Card>
        <CardContent className="space-y-6 text-center">
          <div className="animate-in zoom-in-95 mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 duration-(--duration-slow)">
            <CheckCircle2 className={`${ICON_SIZE.lg} text-primary`} aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h1 className={TYPOGRAPHY.h2}>Focus session complete</h1>
            <p className={TYPOGRAPHY.small}>
              You reviewed {metrics.completedChunks} of {totalChunks} sections in &quot;{documentTitle}.&quot;
            </p>
            {variantLabel !== null && <p className={TYPOGRAPHY.caption}>Using {variantLabel}</p>}
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sections completed</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} aria-label="Sections completed this session" aria-valuetext={`${percentage}% of sections completed`} />
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
