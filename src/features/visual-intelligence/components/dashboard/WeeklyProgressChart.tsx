import { cn } from '@/lib/utils'
import type { DayBucket } from '../../dashboard/weeklyProgressEngine'

const CHART_WIDTH = 280
const CHART_HEIGHT = 48

function buildSparklinePoints(values: readonly (number | null)[]): string {
  const realValues = values.filter((v): v is number => v !== null)
  const max = Math.max(1, ...realValues)
  const stepX = CHART_WIDTH / Math.max(1, values.length - 1)

  return values
    .map((value, index) => (value === null ? null : { x: index * stepX, y: CHART_HEIGHT - (value / max) * CHART_HEIGHT }))
    .filter((point): point is { x: number; y: number } => point !== null)
    .map((point) => `${point.x},${point.y}`)
    .join(' ')
}

type SparklineRowProps = {
  label: string
  values: readonly (number | null)[]
  formatLatest: (value: number | null) => string
}

function SparklineRow({ label, values, formatLatest }: SparklineRowProps): React.JSX.Element {
  const points = buildSparklinePoints(values)
  const latest = values[values.length - 1] ?? null

  return (
    <div className="flex items-center gap-4">
      <div className="w-28 shrink-0">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{formatLatest(latest)}</p>
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className={cn('h-12 flex-1 text-primary')} preserveAspectRatio="none">
        {points.length > 0 ? <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} /> : null}
      </svg>
    </div>
  )
}

type WeeklyProgressChartProps = {
  days: readonly DayBucket[]
}

// A new SVG line chart built from scratch — no charting library installed
// anywhere in this codebase. Each metric gets its own normalized
// sparkline row (different units don't share one axis); null values are
// simply skipped, never interpolated.
export function WeeklyProgressChart({ days }: WeeklyProgressChartProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Weekly Progress</p>
      <div className="mt-5 space-y-5">
        <SparklineRow label="Daily Sessions" values={days.map((d) => d.sessionsCount)} formatLatest={(v) => String(v ?? 0)} />
        <SparklineRow label="Daily Growth" values={days.map((d) => d.growthPercent)} formatLatest={(v) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v}%`)} />
        <SparklineRow label="Training Minutes" values={days.map((d) => d.trainingMinutes)} formatLatest={(v) => `${v ?? 0}m`} />
        <SparklineRow label="Observation Score" values={days.map((d) => d.observationScore)} formatLatest={(v) => (v === null ? 'Train more to unlock' : `${v}%`)} />
      </div>
    </div>
  )
}
