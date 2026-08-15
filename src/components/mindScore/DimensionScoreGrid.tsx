'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import {
  SENSORY_HOLOGRAM_BUILDER_STORAGE_KEY,
  loadBestSensoryHologramBuilderStats,
} from '@/features/sensory-hologram-builder/sensoryHologramBuilderLocalHistory'

type Dimension = {
  id: string
  label: string
  score: number | null // null = real, honest "not yet attempted" — never a fabricated 0
  trend: number | null // real % growth, null = no trend signal for this dimension
  startHref: string | null // where to go to start earning this score; null for composites
}

type DimensionScoreGridProps = {
  readingSpeedScore: number | null
  readingSpeedTrend: number | null
  comprehensionScore: number | null
  visualizationDepthScore: number | null
  consistencyScore: number | null
  neuralRetrainingIndex: number | null
}

const RING_SIZE = 76
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
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" strokeWidth={RING_STROKE} className="stroke-foreground/[0.07]" />
        {score !== null && (
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={r}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            className="stroke-primary"
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        {score !== null ? (
          <span className="text-sm font-bold tabular-nums text-foreground">{Math.round(animated)}</span>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground/50">—</span>
        )}
      </div>
    </div>
  )
}

function TrendBadge({ trend }: { trend: number | null }): React.JSX.Element | null {
  if (trend === null) return null
  const positive = trend >= 0
  return (
    <span className={cn('text-[10px] font-semibold tabular-nums', positive ? 'text-success' : 'text-destructive')}>
      {positive ? '+' : ''}
      {trend}%
    </span>
  )
}

// Dimension scores are all real, all active — six cognitive metrics
// mapped to genuine tracked data (see mindScore.ts's per-dimension score
// functions for exactly what each one is computed from). A student who
// hasn't attempted a given dimension yet sees an honest empty ring with a
// "Start Now" link, never a greyed-out "Coming soon" placeholder — the
// difference between "we haven't built this" (the old state) and "this
// is yours to start" (this one).
export function DimensionScoreGrid({
  readingSpeedScore,
  readingSpeedTrend,
  comprehensionScore,
  visualizationDepthScore,
  consistencyScore,
  neuralRetrainingIndex,
}: DimensionScoreGridProps): React.JSX.Element {
  // QSR/Holographic Recall is the one dimension whose real signal (the
  // Sensory Hologram Builder's self-reported immersion score) lives in
  // localStorage, not Supabase — this component is already 'use client',
  // so it reads it directly after mount, same pattern as
  // ThirtyDayMasterclassHeroCard.tsx's own curriculum-progress read.
  const [qsrRecallScore, setQsrRecallScore] = useState<number | null>(null)
  useEffect(() => {
    const stats = loadBestSensoryHologramBuilderStats(SENSORY_HOLOGRAM_BUILDER_STORAGE_KEY)
    setQsrRecallScore(stats.bestScorePercent > 0 ? stats.bestScorePercent : null)
  }, [])

  const dimensions: Dimension[] = [
    {
      id: 'reading-speed',
      label: 'Reading Speed (WPM Growth)',
      score: readingSpeedScore,
      trend: readingSpeedTrend,
      startHref: '/labs/quantum-speed-reading/start',
    },
    {
      id: 'comprehension',
      label: 'Comprehension Accuracy',
      score: comprehensionScore,
      trend: null,
      startHref: '/labs/quantum-speed-reading/start',
    },
    {
      id: 'visualization',
      label: 'Right-Brain Visualization Depth',
      score: visualizationDepthScore,
      trend: null,
      startHref: '/labs/visual-intelligence/fixation',
    },
    {
      id: 'qsr-recall',
      label: 'QSR / Holographic Recall',
      score: qsrRecallScore,
      trend: null,
      startHref: '/labs/quantum-speed-reading/sensory-hologram-builder',
    },
    {
      id: 'consistency',
      label: 'Consistency & Streak Momentum',
      score: consistencyScore,
      trend: null,
      startHref: null,
    },
    {
      id: 'neural-retraining',
      label: 'Neural Retraining Index',
      score: neuralRetrainingIndex,
      trend: null,
      startHref: null,
    },
  ]

  return (
    <div className="glass-premium-card p-6">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Intelligence Dimensions</p>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6" role="list" aria-label="Mind intelligence dimensions">
        {dimensions.map((dim) => (
          <div key={dim.id} className="flex flex-col items-center gap-2" role="listitem" aria-label={`${dim.label}${dim.score !== null ? `: ${dim.score} out of 100` : ': not yet attempted'}`}>
            <DimensionRing score={dim.score} />
            <div className="text-center">
              <p className="text-[10px] leading-tight font-medium text-muted-foreground">{dim.label}</p>
              {dim.score !== null ? (
                <div className="mt-0.5 flex items-center justify-center">
                  <TrendBadge trend={dim.trend} />
                </div>
              ) : dim.startHref !== null ? (
                <Link href={dim.startHref} className="mt-0.5 inline-flex items-center gap-0.5 text-[9px] font-semibold text-primary hover:underline">
                  <Sparkles className="size-2.5" aria-hidden="true" />
                  Start Now
                </Link>
              ) : (
                <p className="mt-0.5 text-[9px] text-muted-foreground/60">Not started yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
