'use client'

// IntelligenceRing — a ProgressRing that understands IntelligenceDimension.
// Generates accessible labels and scales stroke automatically.
// Any Lab passes its real score (0–100) and dimension type; the ring does the rest.

import { ProgressRing } from '@/components/exercises/ProgressRing'
import { DIMENSION_LABELS, DIMENSION_SHORT_LABELS } from '@/lib/intelligence/engine'
import type { IntelligenceDimensionType, ActivationStatus } from '@/types/intelligence'

type IntelligenceRingProps = {
  dimension: IntelligenceDimensionType
  score: number           // 0–100
  status: ActivationStatus
  size?: number
  showLabel?: boolean     // show score inside ring; defaults to true
}

export function IntelligenceRing({
  dimension,
  score,
  status,
  size = 72,
  showLabel = true,
}: IntelligenceRingProps): React.JSX.Element {
  const isActive = status !== 'not-started'
  const label = showLabel ? (isActive ? `${score}` : undefined) : undefined
  const fullLabel = `${DIMENSION_LABELS[dimension]}: ${isActive ? `${score} out of 100` : 'not yet started'}`

  return (
    <div className="flex flex-col items-center gap-1.5">
      <ProgressRing
        progress={isActive ? score / 100 : 0}
        size={size}
        {...(label !== undefined ? { label } : {})}
        accessibleLabel={fullLabel}
      />
      <span className="text-[10px] font-medium text-muted-foreground">
        {DIMENSION_SHORT_LABELS[dimension]}
      </span>
    </div>
  )
}
