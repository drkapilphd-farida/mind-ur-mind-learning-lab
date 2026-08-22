'use client'

import { Lock } from 'lucide-react'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type SubScore = { label: string; value: number | null }

type MindScoreBreakdownCardProps = {
  mindScore: number // 0-1000
  retentionAccuracyScore: number | null
  brainGymAccuracyScore: number | null
}

// Own-copy ring component rather than importing MindScoreCard's local
// SmallRing — that one lives unexported inside a different feature's
// dashboard card, and this project's own convention (see
// readingContent/types.ts's comment) is an independent copy per module
// rather than a cross-feature import for a small shared visual primitive.
function SubScoreRing({ value, size = 44 }: { value: number | null; size?: number }): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animated = useCountUp(value ?? 0, 700, prefersReducedMotion)
  const r = (size - 5) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - (value ?? 0) / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} className="stroke-foreground/[0.07]" />
        {value !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
            className="stroke-primary"
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        )}
      </svg>
      {value !== null ? (
        <span className="absolute text-xs font-bold tabular-nums text-foreground" aria-hidden="true">
          {Math.round(animated)}
        </span>
      ) : (
        <Lock className="absolute size-3 text-muted-foreground/50" aria-hidden="true" />
      )}
    </div>
  )
}

// Mind Score™ — computed only from real, already-persisted data (never
// fabricated). Retention Accuracy comes from daily_quantum_sessions' own
// accuracy_percent (the Retention Check quiz across every pillar the
// journey covers, not just its reading exercises — see
// analyticsMath.ts's computeAverageAccuracyPercent for why this is never
// labeled "Reading Comprehension" here, per Habit App Isolation™);
// Brain-Gym Accuracy from domain_performance_sessions (Intuition/Right
// Brain/Visualisation combined — see getDomainPerformanceSummary's own
// comment). Focus has no real tracked source anywhere in the app today,
// so it renders locked — the exact same "no fake numbers, ever"
// convention MindScoreCard already established on the main dashboard.
export function MindScoreBreakdownCard({
  mindScore,
  retentionAccuracyScore,
  brainGymAccuracyScore,
}: MindScoreBreakdownCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedScore = useCountUp(mindScore, 900, prefersReducedMotion)

  const subScores: SubScore[] = [
    { label: 'Retention Accuracy', value: retentionAccuracyScore },
    { label: 'Brain-Gym Accuracy', value: brainGymAccuracyScore },
    { label: 'Focus', value: null },
  ]

  const STROKE = 12
  const SIZE = 140
  const r = (SIZE - STROKE) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - mindScore / 1000)

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Mind Score™</p>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative inline-flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE} className="stroke-foreground/[0.07]" />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={r}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              className={cn('stroke-primary', prefersReducedMotion && 'transition-none')}
              style={{ strokeDasharray: circ, strokeDashoffset: offset }}
            />
          </svg>
          <div className="absolute flex flex-col items-center" aria-hidden="true">
            <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">{Math.round(animatedScore)}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">out of 1000</span>
          </div>
        </div>

        <div className="mt-6 grid w-full grid-cols-3 gap-4" role="list" aria-label="Mind score breakdown">
          {subScores.map((sub) => (
            <div key={sub.label} className="flex flex-col items-center gap-1.5 text-center" role="listitem">
              <SubScoreRing value={sub.value} />
              <span className={cn('text-[10px] font-medium leading-tight', sub.value !== null ? 'text-muted-foreground' : 'text-muted-foreground/50')}>
                {sub.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
