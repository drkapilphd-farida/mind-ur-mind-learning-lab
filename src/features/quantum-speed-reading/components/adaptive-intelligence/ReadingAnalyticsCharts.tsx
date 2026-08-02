'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { PASSAGE_CATEGORY_LABEL } from '../../passageDifficulty'
import type { ReadingSessionRecord, CategoryPerformance } from '../../adaptive-intelligence/readingIntelligenceTypes'

type ReadingAnalyticsChartsProps = {
  sessions: readonly ReadingSessionRecord[] // newest-first
  categoryPerformance: readonly CategoryPerformance[]
}

const MAX_HEIGHT = 72
const MIN_HEIGHT = 3
const MAX_POINTS = 10

// Same hand-built Tailwind bar-chart convention as GrowthTrendChart.tsx —
// no charting library exists in this app, and this keeps things minimal.
function MetricBarChart({ title, values }: { title: string; values: readonly number[] }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const max = Math.max(...values, 1)

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-1.5" role="img" aria-label={`${title} over the last ${values.length} sessions`}>
        {values.map((value, index) => {
          const heightPx = Math.max(MIN_HEIGHT, Math.round((value / max) * MAX_HEIGHT))
          return (
            <div
              key={index}
              className={cn(
                'w-full max-w-6 rounded-full bg-primary/70',
                !prefersReducedMotion && 'transition-[height] duration-500 ease-out',
              )}
              style={{ height: `${heightPx}px` }}
              title={String(value)}
            />
          )
        })}
      </div>
    </div>
  )
}

function CategoryPerformanceChart({ performance }: { performance: readonly CategoryPerformance[] }): React.JSX.Element {
  const max = Math.max(...performance.map((p) => p.averageAccuracy), 1)

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:col-span-2">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Category Performance</p>
      <div className="mt-4 space-y-3">
        {performance.map((entry) => (
          <div key={entry.category} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs text-muted-foreground">{PASSAGE_CATEGORY_LABEL[entry.category]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary/60 transition-[width] duration-500"
                style={{ width: `${(entry.averageAccuracy / max) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-foreground">{entry.averageAccuracy}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReadingAnalyticsCharts({ sessions, categoryPerformance }: ReadingAnalyticsChartsProps): React.JSX.Element {
  // Chronological (oldest -> newest) over the most recent MAX_POINTS sessions.
  const chronological = [...sessions].reverse().slice(-MAX_POINTS)

  if (chronological.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">No sessions yet — analytics will appear after your first reading session.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MetricBarChart title="Reading Speed (WPM)" values={chronological.map((s) => s.wpm)} />
      <MetricBarChart title="Accuracy" values={chronological.map((s) => s.accuracyPercent)} />
      <MetricBarChart title="Comprehension" values={chronological.map((s) => s.comprehensionPercent)} />
      <MetricBarChart title="Reading Intelligence Score" values={chronological.map((s) => s.readingIntelligenceScore)} />
      {categoryPerformance.length > 0 && <CategoryPerformanceChart performance={categoryPerformance} />}
    </div>
  )
}
