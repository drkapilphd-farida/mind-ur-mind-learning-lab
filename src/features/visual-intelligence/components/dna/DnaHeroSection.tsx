'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// A stylized double-helix illustration — two interleaved columns of dots
// connected by rungs, built in plain SVG (no illustration library
// installed). Gently pulses/drifts when motion is allowed.
function DnaIllustration({ prefersReducedMotion }: { prefersReducedMotion: boolean }): React.JSX.Element {
  const rows = 7
  const width = 120
  const height = 140
  const amplitude = 34

  const points = Array.from({ length: rows }, (_, i) => {
    const t = i / (rows - 1)
    const y = t * height
    const phase = t * Math.PI * 2.2
    const xLeft = width / 2 - Math.sin(phase) * amplitude
    const xRight = width / 2 + Math.sin(phase) * amplitude
    return { y, xLeft, xRight }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('size-28 text-primary', !prefersReducedMotion && 'animate-pulse')}
      style={{ animationDuration: !prefersReducedMotion ? '3200ms' : undefined }}
      aria-hidden="true"
    >
      {points.map((point, i) => (
        <line key={`rung-${i}`} x1={point.xLeft} y1={point.y} x2={point.xRight} y2={point.y} stroke="currentColor" strokeOpacity={0.25} strokeWidth={2} />
      ))}
      <path
        d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.xLeft} ${p.y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.5}
        strokeWidth={2.5}
      />
      <path
        d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.xRight} ${p.y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.5}
        strokeWidth={2.5}
      />
      {points.map((point, i) => (
        <g key={`dots-${i}`}>
          <circle cx={point.xLeft} cy={point.y} r={4} fill="currentColor" />
          <circle cx={point.xRight} cy={point.y} r={4} fill="currentColor" />
        </g>
      ))}
    </svg>
  )
}

export function DnaHeroSection(): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/[0.08] via-card to-card p-8 text-center shadow-sm backdrop-blur-sm',
        fadeClass,
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <DnaIllustration prefersReducedMotion={prefersReducedMotion} />
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Lab™</p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-foreground">Visual DNA™</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Your visual intelligence has now been analyzed. This profile evolves automatically every time you train.
          </p>
        </div>
      </div>
    </div>
  )
}
