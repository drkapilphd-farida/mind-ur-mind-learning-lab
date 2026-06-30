// IntelligenceCard — a standardized premium card container for any Lab.
// Renders the dimension header (label + score + status badge) and accepts
// children as the card body, so every Lab gets visual consistency for free.

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { IntelligenceRing } from './IntelligenceRing'
import { DIMENSION_LABELS } from '@/lib/intelligence/engine'
import type { IntelligenceDimension } from '@/types/intelligence'

type IntelligenceCardProps = {
  dimension: IntelligenceDimension
  children?: React.ReactNode
  className?: string
  compact?: boolean
}

function statusBadge(status: IntelligenceDimension['status']): React.JSX.Element {
  if (status === 'activated') return <Badge variant="default">Activated</Badge>
  if (status === 'in-progress') return <Badge variant="secondary">In Progress</Badge>
  return <Badge variant="outline">Not Started</Badge>
}

export function IntelligenceCard({
  dimension,
  children,
  className,
  compact = false,
}: IntelligenceCardProps): React.JSX.Element {
  const label = DIMENSION_LABELS[dimension.type]

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card shadow-sm transition-shadow duration-150',
        compact ? 'p-5' : 'p-6',
        !compact && 'hover:shadow-md',
        className,
      )}
    >
      <div className={cn('flex gap-5', compact ? 'items-center' : 'flex-col sm:flex-row sm:items-start')}>
        <IntelligenceRing
          dimension={dimension.type}
          score={dimension.score}
          status={dimension.status}
          size={compact ? 56 : 72}
          showLabel
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
            {statusBadge(dimension.status)}
          </div>

          {dimension.trend !== null && (
            <p className={cn('mt-1 text-xs', dimension.trend >= 0 ? 'text-success' : 'text-destructive')}>
              {dimension.trend >= 0 ? '↑' : '↓'} {Math.abs(dimension.trend)}% this week
            </p>
          )}
        </div>
      </div>

      {children !== undefined && <div className={cn(compact ? 'mt-4' : 'mt-5')}>{children}</div>}
    </div>
  )
}
