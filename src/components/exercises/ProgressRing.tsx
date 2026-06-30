'use client'

import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'
import { cn } from '@/lib/utils'

type ProgressRingProps = {
  progress: number
  size?: number
  label?: string
  accessibleLabel?: string
}

// Stroke widens with size so it stays visually proportionate — 6px for
// standard rings, 8px for the large hero ring (≥88px).
function getStrokeWidth(size: number): number {
  return size >= 88 ? 8 : 6
}

// A real 0–1 ratio in, a premium animated ring out. No lab-specific logic
// here — any future Lab's progress drives the same component.
export function ProgressRing({
  progress,
  size = 72,
  label,
  accessibleLabel,
}: ProgressRingProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const strokeWidth = getStrokeWidth(size)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(1, Math.max(0, progress))

  // Animate the stroke from 0 to its target on first render.
  const animatedProgress = useCountUp(clampedProgress, 700, prefersReducedMotion)
  const offset = circumference * (1 - animatedProgress)

  // Label font scales with ring size: large rings (≥88px) show a bold percent
  // in a readable size; smaller rings show a compact label in a smaller font.
  const isLarge = size >= 88
  const labelClass = isLarge
    ? 'text-xl font-bold tabular-nums tracking-tight'
    : size >= 48
      ? 'text-xs font-semibold tabular-nums'
      : 'text-[10px] font-semibold tabular-nums'

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      {...(accessibleLabel !== undefined ? { 'aria-label': accessibleLabel } : { 'aria-hidden': true })}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-foreground/[0.08]"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn('stroke-primary', !prefersReducedMotion && 'transition-none')}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      {label !== undefined && (
        <span className={cn('absolute text-foreground', labelClass)} aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  )
}
