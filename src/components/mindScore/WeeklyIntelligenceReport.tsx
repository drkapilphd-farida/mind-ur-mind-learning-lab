import { cn } from '@/lib/utils'

type DimensionReport = {
  id: string
  label: string
  trend: 'up' | 'down' | 'stable' | 'inactive'
  score: number | null
}

type WeeklyIntelligenceReportProps = {
  readingTrend: 'up' | 'down' | 'stable'
  readingScore: number
  overallGrowth: 'Excellent' | 'Good' | 'Steady' | 'Recovering' | 'Beginning'
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→', inactive: '—' }
const TREND_COLOR: Record<string, string> = {
  up: 'text-success',
  down: 'text-destructive',
  stable: 'text-muted-foreground',
  inactive: 'text-muted-foreground/40',
}

export function WeeklyIntelligenceReport({
  readingTrend,
  readingScore,
  overallGrowth,
}: WeeklyIntelligenceReportProps): React.JSX.Element {
  const dimensions: DimensionReport[] = [
    { id: 'reading', label: 'Reading', trend: readingTrend, score: readingScore },
    { id: 'memory', label: 'Memory', trend: 'inactive', score: null },
    { id: 'focus', label: 'Focus', trend: 'inactive', score: null },
    { id: 'meditation', label: 'Meditation', trend: 'inactive', score: null },
    { id: 'attention', label: 'Attention', trend: 'inactive', score: null },
    { id: 'reaction', label: 'Reaction', trend: 'inactive', score: null },
  ]

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Weekly Intelligence Report™
        </p>
        <span className={cn(
          'text-xs font-semibold',
          overallGrowth === 'Excellent' || overallGrowth === 'Good' ? 'text-success' :
          overallGrowth === 'Recovering' ? 'text-destructive' : 'text-muted-foreground',
        )}>
          Overall: {overallGrowth}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {dimensions.map((dim) => (
          <div
            key={dim.id}
            className={cn(
              'flex flex-col items-center rounded-xl py-3 px-2',
              dim.trend !== 'inactive' ? 'bg-foreground/[0.03] ring-1 ring-border' : 'bg-muted/20 opacity-50',
            )}
            aria-label={`${dim.label}: ${dim.trend}`}
          >
            <span className={cn('text-xl font-bold', TREND_COLOR[dim.trend])} aria-hidden="true">
              {TREND_ICON[dim.trend]}
            </span>
            <span className="mt-1 text-[10px] font-medium text-muted-foreground">{dim.label}</span>
            {dim.score !== null && (
              <span className="text-[10px] tabular-nums text-foreground/60">{dim.score}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
