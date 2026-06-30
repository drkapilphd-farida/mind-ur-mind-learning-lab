'use client'

import { useCountUp } from '@/hooks/exercises/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { MindScoreLabel } from '@/lib/exercises/mindScore'

type MindScoreHeroCardProps = {
  score: number              // 0–1000
  scoreMeta: MindScoreLabel
  readingScore: number       // 0–100, for the ring
}

export function MindScoreHeroCard({
  score,
  scoreMeta,
  readingScore,
}: MindScoreHeroCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedScore = useCountUp(score, 1000, prefersReducedMotion)

  // Large SVG ring for reading progress
  const SIZE = 180
  const STROKE = 10
  const r = (SIZE - STROKE) / 2
  const circ = 2 * Math.PI * r
  const progress = readingScore / 100
  const offset = circ * (1 - progress)

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
        {/* Ring */}
        <div
          className="relative inline-flex shrink-0 items-center justify-center"
          style={{ width: SIZE, height: SIZE }}
          aria-label={`Mind Score ${score} out of 1000, Reading Intelligence ${readingScore} percent`}
          role="img"
        >
          <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={r}
              fill="none" strokeWidth={STROKE}
              className="stroke-foreground/[0.07]"
            />
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={r}
              fill="none" strokeWidth={STROKE}
              strokeLinecap="round"
              className={cn('stroke-primary', !prefersReducedMotion && 'transition-none')}
              style={{ strokeDasharray: circ, strokeDashoffset: offset }}
            />
          </svg>
          <div className="absolute flex flex-col items-center" aria-hidden="true">
            <span className={cn(
              'font-bold tabular-nums tracking-tight leading-none',
              score >= 1000 ? 'text-3xl' : 'text-4xl',
            )}>
              {Math.round(animatedScore)}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Mind Score™
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Overall Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {scoreMeta.label}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xs">
            {scoreMeta.description}
          </p>

          {/* Score bar */}
          <div className="mt-5 w-full max-w-xs">
            <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-medium text-foreground">{score} / 1000</span>
              <span>1000</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <div
                className={cn(
                  'h-1.5 rounded-full bg-primary',
                  !prefersReducedMotion && 'transition-[width] duration-1000 ease-out',
                )}
                style={{ width: `${(score / 1000) * 100}%` }}
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={1000}
                aria-label="Mind Score progress"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
