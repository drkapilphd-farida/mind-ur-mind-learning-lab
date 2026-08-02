'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type SubScore = {
  label: string
  value: number | null // null = not yet unlocked
}

type MindScoreCardProps = {
  mindScore: number  // 0–100
  readingScore: number
}

// Draws a compact SVG ring for a sub-score — separate from the main ProgressRing
// so this card doesn't introduce a dependency loop.
function SmallRing({ value, size = 40 }: { value: number | null; size?: number }): React.JSX.Element {
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
            cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5}
            strokeLinecap="round" stroke="url(#mind-score-ring-gradient)"
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        )}
      </svg>
      {value !== null ? (
        <span className="absolute text-[10px] font-bold tabular-nums text-foreground" aria-hidden="true">
          {Math.round(animated)}
        </span>
      ) : (
        <Lock className="absolute size-2.5 text-muted-foreground/50" aria-hidden="true" />
      )}
    </div>
  )
}

// Mind Score is computed from real practice data — never fabricated.
// Sub-disciplines show real scores for active Labs and a locked state for
// Labs that haven't launched yet, so no fake numbers are ever displayed.
export function MindScoreCard({ mindScore, readingScore }: MindScoreCardProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedScore = useCountUp(mindScore, 900, prefersReducedMotion)

  const subScores: SubScore[] = [
    { label: 'Reading', value: readingScore },
    { label: 'Memory', value: null },
    { label: 'Focus', value: null },
  ]

  const STROKE = 10
  const SIZE = 120
  const r = (SIZE - STROKE) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - mindScore / 100)

  return (
    <div className="glass-premium-card glass-premium-lift flex h-full flex-col p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Mind Score™</p>

      {/* Main ring */}
      <div className="mt-4 flex flex-col items-center">
        <div className="relative inline-flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
          {/* Defines #mind-score-ring-gradient once — SVG url(#id)
              references resolve document-wide, so the glow halo below and
              every SmallRing sub-score instance can reuse this same
              definition without redeclaring it. Painted first (behind, via
              DOM order) and blurred, so the crisp ring painted after it
              reads clearly on top. */}
          <svg width={SIZE} height={SIZE} className="absolute -rotate-90" style={{ filter: 'blur(8px)', opacity: 'var(--ring-glow-opacity, 0)' }} aria-hidden="true">
            <defs>
              <linearGradient id="mind-score-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: 'var(--ambient-a, var(--primary))' }} />
                <stop offset="100%" style={{ stopColor: 'var(--ambient-b, var(--primary))' }} />
              </linearGradient>
            </defs>
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE}
              strokeLinecap="round" stroke="url(#mind-score-ring-gradient)"
              style={{ strokeDasharray: circ, strokeDashoffset: offset }}
            />
          </svg>
          <svg width={SIZE} height={SIZE} className="absolute -rotate-90" aria-hidden="true">
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE} className="stroke-foreground/[0.07]" />
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE}
              strokeLinecap="round" stroke="url(#mind-score-ring-gradient)" className={cn(!prefersReducedMotion && 'transition-none')}
              style={{ strokeDasharray: circ, strokeDashoffset: offset }}
            />
          </svg>
          <div className="relative flex flex-col items-center" aria-hidden="true">
            <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {Math.round(animatedScore)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Mind Score</span>
          </div>
        </div>

        {/* Sub-scores */}
        <div
          className="mt-5 grid grid-cols-3 gap-4 w-full"
          role="list"
          aria-label="Mind score breakdown"
        >
          {subScores.map((sub) => (
            <div key={sub.label} className="flex flex-col items-center gap-1.5" role="listitem">
              <SmallRing value={sub.value} />
              <span className={cn(
                'text-[10px] font-medium',
                sub.value !== null ? 'text-muted-foreground' : 'text-muted-foreground/50',
              )}>
                {sub.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
