'use client'

import { Lock } from 'lucide-react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type Dimension = {
  id: string
  label: string
  score: number | null   // null = not yet unlocked
  trend: number | null   // % change vs prior period, null = insufficient data
  status: 'active' | 'locked'
}

type DimensionScoreGridProps = {
  readingScore: number
  weeklyTrend: number | null
}

const RING_SIZE = 72
const RING_STROKE = 7

function DimensionRing({ score }: { score: number | null }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animated = useCountUp(score ?? 0, 800, prefersReducedMotion)
  const r = (RING_SIZE - RING_STROKE) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - (score ?? 0) / 100)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      aria-hidden="true"
    >
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
          fill="none" strokeWidth={RING_STROKE}
          className="stroke-foreground/[0.07]"
        />
        {score !== null && (
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
            fill="none" strokeWidth={RING_STROKE}
            strokeLinecap="round" className="stroke-primary"
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        {score !== null ? (
          <span className="text-sm font-bold tabular-nums text-foreground">
            {Math.round(animated)}
          </span>
        ) : (
          <Lock className="size-3.5 text-muted-foreground/50" />
        )}
      </div>
    </div>
  )
}

function TrendBadge({ trend }: { trend: number | null }): React.JSX.Element | null {
  if (trend === null) return null
  const positive = trend >= 0
  return (
    <span className={cn(
      'text-[10px] font-semibold tabular-nums',
      positive ? 'text-success' : 'text-destructive',
    )}>
      {positive ? '+' : ''}{trend}%
    </span>
  )
}

// Dimension scores are designed for 7 intelligence types. Right now only
// Reading is active — the others show a locked state that converts to a
// live ring when that Lab ships, without any component changes.
export function DimensionScoreGrid({ readingScore, weeklyTrend }: DimensionScoreGridProps): React.JSX.Element {
  const dimensions: Dimension[] = [
    { id: 'reading', label: 'Reading Intelligence™', score: readingScore, trend: weeklyTrend, status: 'active' },
    { id: 'memory', label: 'Memory Intelligence™', score: null, trend: null, status: 'locked' },
    { id: 'focus', label: 'Focus Intelligence™', score: null, trend: null, status: 'locked' },
    { id: 'meditation', label: 'Meditation Intelligence™', score: null, trend: null, status: 'locked' },
    { id: 'attention', label: 'Attention Intelligence™', score: null, trend: null, status: 'locked' },
    { id: 'reaction', label: 'Reaction Intelligence™', score: null, trend: null, status: 'locked' },
    { id: 'learning', label: 'Learning Intelligence™', score: null, trend: null, status: 'locked' },
  ]

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Intelligence Dimensions
      </p>

      <div
        className="mt-5 grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-7"
        role="list"
        aria-label="Mind intelligence dimensions"
      >
        {dimensions.map((dim) => (
          <div
            key={dim.id}
            className={cn(
              'flex flex-col items-center gap-2',
              dim.status === 'locked' && 'opacity-40',
            )}
            role="listitem"
            aria-label={`${dim.label}${dim.score !== null ? `: ${dim.score} out of 100` : ': locked'}`}
          >
            <DimensionRing score={dim.score} />
            <div className="text-center">
              <p className="text-[10px] font-medium text-muted-foreground leading-tight">
                {dim.label.replace(' Intelligence™', '')}
              </p>
              {dim.status === 'locked' ? (
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">Coming soon</p>
              ) : (
                <div className="mt-0.5 flex items-center justify-center">
                  <TrendBadge trend={dim.trend} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
