'use client'

import { ProgressRing } from '@/components/exercises/ProgressRing'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import type { ScoreProgress } from '../../dna/dnaTypes'

function formatImprovement(percent: number | null): string {
  if (percent === null) return 'More training required'
  return `${percent > 0 ? '+' : ''}${percent}%`
}

type VisualIntelligenceScorePanelProps = {
  scoreProgress: ScoreProgress
}

export function VisualIntelligenceScorePanel({ scoreProgress }: VisualIntelligenceScorePanelProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedScore = useCountUp(scoreProgress.currentScore, 900, prefersReducedMotion)

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Score™</p>

      <div className="mt-5 flex items-center gap-6">
        <ProgressRing
          progress={scoreProgress.currentScore / 1000}
          size={120}
          label={String(Math.round(animatedScore))}
          accessibleLabel={`Visual Intelligence Score ${scoreProgress.currentScore} out of 1000`}
        />
        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-left text-xs">
          <div>
            <dt className="text-muted-foreground">Current Score</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{scoreProgress.currentScore} / 1000</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Previous Score</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{scoreProgress.previousScore ?? 'More training required'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Growth</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{formatImprovement(scoreProgress.growthPercent)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Weekly Improvement</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{formatImprovement(scoreProgress.weeklyImprovementPercent)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Monthly Improvement</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{formatImprovement(scoreProgress.monthlyImprovementPercent)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
