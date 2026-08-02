import type { PerformanceMetrics } from '../../adaptive/types/adaptiveTypes'

type MetricTile = {
  label: string
  value: number
}

type PerformanceMetricsGridProps = {
  performance: PerformanceMetrics
}

// Performance Engine display — 6 tiles, all 0-100, all computed only from
// real stored session data (see performanceEngine.ts).
export function PerformanceMetricsGrid({ performance }: PerformanceMetricsGridProps): React.JSX.Element {
  const tiles: readonly MetricTile[] = [
    { label: 'Visual Stability', value: performance.visualStability },
    { label: 'Observation Consistency', value: performance.observationConsistency },
    { label: 'Focus Growth', value: performance.focusGrowth },
    { label: 'Training Frequency', value: performance.trainingFrequency },
    { label: 'Persistence Level', value: performance.persistenceLevel },
    { label: 'Visual Readiness', value: performance.visualReadiness },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{tile.label}</p>
          <p className="mt-1 text-lg font-semibold text-foreground tabular-nums">{tile.value}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
            <div className="h-full rounded-full bg-primary" style={{ width: `${tile.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
