import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type ComprehensionScoreCardProps = {
  averagePercent: number | null
  trendDelta: number | null
}

// Section 3 — Comprehension Score: average % across every completed
// AI Document Transformer quiz (quantum_document_sessions), with a
// recent-half-vs-earlier-half trend rather than a single-session delta.
export function ComprehensionScoreCard({ averagePercent, trendDelta }: ComprehensionScoreCardProps): React.JSX.Element {
  const hasTrend = trendDelta !== null && trendDelta !== 0
  const isImproving = trendDelta !== null && trendDelta > 0

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Comprehension Score</p>
      {averagePercent === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Complete a quiz on an uploaded document to see your comprehension score here.</p>
      ) : (
        <div className="mt-4 flex items-center gap-4">
          <p className="text-4xl font-bold tabular-nums text-foreground">{averagePercent}%</p>
          {hasTrend && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                isImproving ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
              )}
            >
              {isImproving ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
              {isImproving ? '+' : ''}
              {trendDelta}%
            </div>
          )}
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">Average across all quiz attempts</p>
    </div>
  )
}
