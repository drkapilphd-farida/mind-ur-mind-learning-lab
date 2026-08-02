import type { ExerciseAnalyticsBar } from '../../dashboard/exerciseAnalyticsEngine'

type ExerciseAnalyticsChartProps = {
  bars: readonly ExerciseAnalyticsBar[]
}

// A new SVG-free bar chart (plain divs) — no charting library installed.
export function ExerciseAnalyticsChart({ bars }: ExerciseAnalyticsChartProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Exercise Analytics™</p>
      <div className="mt-5 space-y-3">
        {bars.map((bar) => (
          <div key={bar.id} className="flex items-center gap-3">
            <p className="w-24 shrink-0 text-xs font-medium text-foreground">{bar.label}</p>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="presentation">
              <div className="h-full rounded-full bg-primary" style={{ width: `${bar.completionPercent ?? 0}%` }} />
            </div>
            <p className="w-28 shrink-0 text-right text-xs text-muted-foreground">
              {bar.completionPercent === null ? 'Train more to unlock' : `${bar.completionPercent}%`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
