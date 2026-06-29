'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type ProgressRingProps = {
  progress: number
  size?: number
  label?: string
  accessibleLabel?: string
}

const STROKE_WIDTH = 4

// A real 0–1 ratio in, a ring out — no lab-specific knowledge here, so any
// future Lab's progress can drive the same component.
export function ProgressRing({
  progress,
  size = 72,
  label,
  accessibleLabel,
}: ProgressRingProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const radius = (size - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const offset = circumference * (1 - clampedProgress)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      {...(accessibleLabel !== undefined ? { 'aria-label': accessibleLabel } : { 'aria-hidden': true })}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={STROKE_WIDTH} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          className={cn(
            'stroke-primary',
            !prefersReducedMotion && 'transition-[stroke-dashoffset] duration-700 ease-out',
          )}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      {label !== undefined && (
        <span className="absolute text-sm font-medium text-foreground" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  )
}
