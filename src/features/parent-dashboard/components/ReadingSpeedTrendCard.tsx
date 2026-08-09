'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DailyQuantumSessionRecord } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'
import { buildReadingSpeedTrendPoints, computeAverageWpm, type ReadingSpeedWindowDays } from '../readingSpeedTrend'

type ReadingSpeedTrendCardProps = {
  sessions: readonly DailyQuantumSessionRecord[]
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 200
const PADDING_X = 24
const PADDING_Y = 24
const WINDOW_OPTIONS: readonly ReadingSpeedWindowDays[] = [7, 14, 30]

// Section 2 — Reading Speed Trend: the 7/14/30-day toggle re-slices
// already-fetched history client-side (see readingSpeedTrend.ts) rather
// than a fresh server round-trip per click — the parent Server Component
// fetches up to 90 days once, this just re-derives points from it. Same
// SVG line-chart technique as WpmProgressChart.tsx (the only other chart
// in this codebase — no charting library exists or is warranted for one
// more line chart).
export function ReadingSpeedTrendCard({ sessions }: ReadingSpeedTrendCardProps): React.JSX.Element {
  const [windowDays, setWindowDays] = useState<ReadingSpeedWindowDays>(7)

  const points = useMemo(() => buildReadingSpeedTrendPoints(sessions, windowDays), [sessions, windowDays])
  const averageWpm = useMemo(() => computeAverageWpm(points), [points])

  const plotWidth = CHART_WIDTH - PADDING_X * 2
  const plotHeight = CHART_HEIGHT - PADDING_Y * 2

  const wpmValues = points.map((point) => point.wpm)
  const rawMin = wpmValues.length > 0 ? Math.min(...wpmValues) : 0
  const rawMax = wpmValues.length > 0 ? Math.max(...wpmValues) : 0
  const yMin = Math.max(0, rawMin - Math.max(10, (rawMax - rawMin) * 0.15))
  const yMax = rawMax + Math.max(10, (rawMax - rawMin) * 0.15)

  function xFor(index: number): number {
    if (points.length <= 1) return PADDING_X + plotWidth / 2
    return PADDING_X + (index / (points.length - 1)) * plotWidth
  }
  function yFor(wpm: number): number {
    const ratio = yMax === yMin ? 0.5 : (wpm - yMin) / (yMax - yMin)
    return PADDING_Y + plotHeight - ratio * plotHeight
  }

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.wpm)}`).join(' ')
  const areaPath = points.length > 0 ? `${linePath} L ${xFor(points.length - 1)} ${PADDING_Y + plotHeight} L ${xFor(0)} ${PADDING_Y + plotHeight} Z` : ''

  const labelStep = Math.max(1, Math.ceil(points.length / 6))
  const isLabeled = (index: number): boolean => index === 0 || index === points.length - 1 || index % labelStep === 0

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Reading Speed Trend</p>
          <p className="mt-1 text-sm text-muted-foreground">{averageWpm !== null ? `${averageWpm} WPM average` : 'No sessions in this window yet'}</p>
        </div>
        <Tabs value={String(windowDays)} onValueChange={(value) => setWindowDays(Number(value) as ReadingSpeedWindowDays)}>
          <TabsList>
            {WINDOW_OPTIONS.map((option) => (
              <TabsTrigger key={option} value={String(option)}>
                {option}d
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {points.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Complete a reading session to start tracking speed here.</p>
      ) : (
        <div className="mt-5" role="img" aria-label={`Reading speed from ${points[0]!.label} to ${points[points.length - 1]!.label}, averaging ${averageWpm} words per minute.`}>
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-auto w-full" aria-hidden="true">
            <defs>
              <linearGradient id="parent-wpm-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" className="text-primary" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
              </linearGradient>
            </defs>

            <path d={areaPath} fill="url(#parent-wpm-chart-fill)" stroke="none" />
            <path d={linePath} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {points.map((point, index) => (
              <circle key={point.dateKey} cx={xFor(index)} cy={yFor(point.wpm)} r={index === points.length - 1 ? 5 : 3} className="fill-primary" />
            ))}

            {points.map(
              (point, index) =>
                isLabeled(index) && (
                  <text key={`label-${point.dateKey}`} x={xFor(index)} y={CHART_HEIGHT - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                    {point.label}
                  </text>
                ),
            )}
          </svg>
        </div>
      )}
    </div>
  )
}
