'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { RadarAxis } from '../../dna/dnaTypes'

const SIZE = 280
const CENTER = SIZE / 2
const MAX_RADIUS = 100
const RING_STEPS = [0.25, 0.5, 0.75, 1]

function axisPoint(index: number, total: number, radius: number): { x: number; y: number } {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius }
}

type VisualIntelligenceRadarProps = {
  axes: readonly RadarAxis[]
}

// Built from scratch in plain SVG — no charting library installed in this
// codebase. Null values are honestly pulled to the center of the polygon
// (a visible gap) rather than rendered as a fabricated mid-level point.
export function VisualIntelligenceRadar({ axes }: VisualIntelligenceRadarProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const total = axes.length

  const polygonPoints = axes
    .map((axis, i) => {
      const radius = ((axis.value ?? 0) / 100) * MAX_RADIUS
      const point = axisPoint(i, total, radius)
      return `${point.x},${point.y}`
    })
    .join(' ')

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Radar™</p>
      <div className="mt-4 flex justify-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-72" role="img" aria-label="Visual Intelligence Radar chart across 7 dimensions">
          {RING_STEPS.map((step) => (
            <circle key={step} cx={CENTER} cy={CENTER} r={MAX_RADIUS * step} fill="none" stroke="currentColor" className="text-border" strokeWidth={1} />
          ))}

          {axes.map((_, i) => {
            const outer = axisPoint(i, total, MAX_RADIUS)
            return <line key={i} x1={CENTER} y1={CENTER} x2={outer.x} y2={outer.y} stroke="currentColor" className="text-border" strokeWidth={1} />
          })}

          <polygon
            points={polygonPoints}
            className={cn('fill-primary/15 stroke-primary', !prefersReducedMotion && 'transition-all duration-700')}
            strokeWidth={2}
          />

          {axes.map((axis, i) => {
            const hasData = axis.value !== null
            const radius = ((axis.value ?? 0) / 100) * MAX_RADIUS
            const point = axisPoint(i, total, radius)
            return hasData ? (
              <circle key={axis.id} cx={point.x} cy={point.y} r={4} className="fill-primary" />
            ) : (
              <circle key={axis.id} cx={CENTER} cy={CENTER} r={3} className="fill-none stroke-muted-foreground" strokeDasharray="2 2" />
            )
          })}

          {axes.map((axis, i) => {
            const labelPoint = axisPoint(i, total, MAX_RADIUS + 22)
            return (
              <text
                key={axis.id}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn('text-[9px] font-medium uppercase', axis.value === null ? 'fill-muted-foreground/60' : 'fill-foreground')}
              >
                {axis.label}
              </text>
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">Dashed markers indicate an axis with no data yet.</p>
    </div>
  )
}
