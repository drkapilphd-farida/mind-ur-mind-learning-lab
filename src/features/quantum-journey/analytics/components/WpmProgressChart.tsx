'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WpmChartPoint } from '../analyticsMath'

type WpmProgressChartProps = {
  points: readonly WpmChartPoint[]
  growthPercent: number | null
  latestWpm: number | null
  latestAccuracyPercent: number | null
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 220
const PADDING_X = 24
const PADDING_Y = 28
// How many days' worth of points to keep as labeled ticks before thinning
// them out — a full 21-day + baseline series (22 points) would otherwise
// crowd every label into illegibility.
const MAX_LABELED_TICKS = 7

function buildAriaLabel(points: readonly WpmChartPoint[], growthPercent: number | null): string {
  if (points.length === 0) return 'No reading speed data yet.'
  const first = points[0]!
  const last = points[points.length - 1]!
  const growthText = growthPercent === null ? '' : ` Overall change: ${growthPercent >= 0 ? '+' : ''}${growthPercent}%.`
  return `Reading speed from ${first.label} at ${first.wpm} words per minute to ${last.label} at ${last.wpm} words per minute.${growthText}`
}

export function WpmProgressChart({ points, growthPercent, latestWpm, latestAccuracyPercent }: WpmProgressChartProps): React.JSX.Element {
  if (points.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">WPM Progress™</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Complete your 30-Second Baseline Diagnostic to start tracking your reading speed growth here.
        </p>
      </div>
    )
  }

  const wpmValues = points.map((p) => p.wpm)
  const rawMin = Math.min(...wpmValues)
  const rawMax = Math.max(...wpmValues)
  // A flat/near-flat series (e.g. baseline-only, or two identical values)
  // still needs real vertical range so the line doesn't collapse onto one
  // edge of the chart.
  const yMin = Math.max(0, rawMin - Math.max(10, (rawMax - rawMin) * 0.15))
  const yMax = rawMax + Math.max(10, (rawMax - rawMin) * 0.15)

  const plotWidth = CHART_WIDTH - PADDING_X * 2
  const plotHeight = CHART_HEIGHT - PADDING_Y * 2

  function xFor(index: number): number {
    if (points.length === 1) return PADDING_X + plotWidth / 2
    return PADDING_X + (index / (points.length - 1)) * plotWidth
  }
  function yFor(wpm: number): number {
    const ratio = yMax === yMin ? 0.5 : (wpm - yMin) / (yMax - yMin)
    return PADDING_Y + plotHeight - ratio * plotHeight
  }

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.wpm)}`).join(' ')
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${PADDING_Y + plotHeight} L ${xFor(0)} ${PADDING_Y + plotHeight} Z`

  // Thin out labels for long series — always keep the first and last,
  // spread the rest evenly.
  const labelStep = Math.max(1, Math.ceil(points.length / MAX_LABELED_TICKS))
  const isLabeled = (index: number): boolean => index === 0 || index === points.length - 1 || index % labelStep === 0

  const isPositiveGrowth = growthPercent !== null && growthPercent >= 0

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">WPM Progress™</p>
          <p className="mt-1 text-sm text-muted-foreground">Day 1 Baseline vs. your latest session</p>
        </div>
        {growthPercent !== null && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              isPositiveGrowth ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
            )}
          >
            {isPositiveGrowth ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
            {isPositiveGrowth ? '+' : ''}
            {growthPercent}% speed growth
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-6">
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{points[0]!.wpm}</p>
          <p className="text-[11px] text-muted-foreground">Baseline WPM</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{latestWpm ?? '—'}</p>
          <p className="text-[11px] text-muted-foreground">Latest WPM{latestAccuracyPercent !== null ? ` · ${latestAccuracyPercent}%` : ''}</p>
        </div>
      </div>

      <div className="mt-5" role="img" aria-label={buildAriaLabel(points, growthPercent)}>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-auto w-full" aria-hidden="true">
          <defs>
            <linearGradient id="wpm-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" className="text-primary" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
            </linearGradient>
          </defs>

          {/* Baseline reference line */}
          <line
            x1={PADDING_X}
            x2={CHART_WIDTH - PADDING_X}
            y1={yFor(points[0]!.wpm)}
            y2={yFor(points[0]!.wpm)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          <path d={areaPath} fill="url(#wpm-chart-fill)" stroke="none" />
          <path d={linePath} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => (
            <circle
              key={`${point.label}-${index}`}
              cx={xFor(index)}
              cy={yFor(point.wpm)}
              r={point.isBaseline || index === points.length - 1 ? 5 : 3}
              className={point.isBaseline ? 'fill-muted-foreground' : 'fill-primary'}
            />
          ))}

          {points.map(
            (point, index) =>
              isLabeled(index) && (
                <text
                  key={`label-${point.label}-${index}`}
                  x={xFor(index)}
                  y={CHART_HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {point.label}
                </text>
              ),
          )}
        </svg>
      </div>
    </div>
  )
}
