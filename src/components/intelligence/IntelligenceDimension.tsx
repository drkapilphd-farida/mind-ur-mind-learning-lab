// IntelligenceDimension — renders one dimension as a self-contained row.
// Used inside grid layouts on any Lab's analytics page. Completely lab-agnostic.

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IntelligenceRing } from './IntelligenceRing'
import type { IntelligenceDimension as IntelligenceDimensionType } from '@/types/intelligence'
import { DIMENSION_LABELS } from '@/lib/intelligence/engine'

type IntelligenceDimensionProps = {
  dimension: IntelligenceDimensionType
  className?: string
}

function TrendLabel({ trend }: { trend: number | null }): React.JSX.Element | null {
  if (trend === null) return null
  const up = trend >= 0
  return (
    <span className={cn('text-[10px] font-semibold tabular-nums', up ? 'text-success' : 'text-destructive')}>
      {up ? '+' : ''}{trend}%
    </span>
  )
}

export function IntelligenceDimension({ dimension, className }: IntelligenceDimensionProps): React.JSX.Element {
  const isLocked = !dimension.isActive
  const label = DIMENSION_LABELS[dimension.type]

  return (
    <div
      className={cn('flex flex-col items-center gap-2', isLocked && 'opacity-40', className)}
      role="listitem"
      aria-label={`${label}: ${isLocked ? 'locked' : `${dimension.score} out of 100`}`}
    >
      {isLocked ? (
        <div className="flex size-[72px] items-center justify-center rounded-full bg-foreground/[0.04] ring-1 ring-border">
          <Lock className="size-3.5 text-muted-foreground/50" aria-hidden="true" />
        </div>
      ) : (
        <IntelligenceRing dimension={dimension.type} score={dimension.score} status={dimension.status} showLabel />
      )}
      <div className="flex items-center gap-1">
        <TrendLabel trend={isLocked ? null : dimension.trend} />
      </div>
      {isLocked && (
        <p className="text-[9px] text-muted-foreground/60">Coming soon</p>
      )}
    </div>
  )
}
