import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { cn } from '@/lib/utils'
import type { MemorySessionComparison } from '../analytics'

type SessionComparisonCardProps = {
  comparison: MemorySessionComparison | null
}

function DeltaRow({ label, delta }: { label: string; delta: number }): React.JSX.Element {
  const percentagePoints = Math.round(delta * 100)
  const isFlat = percentagePoints === 0
  const isUp = percentagePoints > 0
  const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown
  const colorClass = isFlat ? 'text-muted-foreground' : isUp ? 'text-success' : 'text-warning'

  return (
    <div className="flex items-center justify-between">
      <span className={TYPOGRAPHY.small}>{label}</span>
      <span className={cn('flex items-center gap-1 text-sm font-medium tabular-nums', colorClass)}>
        <Icon className={ICON_SIZE.sm} aria-hidden="true" />
        {isFlat ? 'No change' : `${Math.abs(percentagePoints)} pts`}
      </span>
    </div>
  )
}

// Memory Mode™ Sprint-4 — Memory Analytics & Insights™. Session
// Comparison (item 6). A real, honest delta between the two most recent
// real sessions — a rise or fall in percentage points, never a score. A
// learner with fewer than two real sessions sees an honest "not enough
// data yet" state, never a fabricated comparison.
export function SessionComparisonCard({ comparison }: SessionComparisonCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {comparison === null ? (
          <p className={TYPOGRAPHY.small}>Complete a second memory session to see how it compares to your last one.</p>
        ) : (
          <>
            <DeltaRow label="Confidence" delta={comparison.confidenceScoreDelta} />
            <DeltaRow label="Completion" delta={comparison.completionRateDelta} />
            <DeltaRow label="Revisits" delta={-comparison.revisitRateDelta} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
