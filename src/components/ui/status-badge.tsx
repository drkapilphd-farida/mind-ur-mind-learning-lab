import type { VariantProps } from 'class-variance-authority'
import { Badge, badgeVariants } from './badge'

export type StatusBadgeStatus = 'active' | 'pending' | 'completed' | 'locked' | 'draft' | 'expiring' | 'error'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

// Deliberately monochrome by default — per docs/DESIGN_SYSTEM.md §9,
// "Completed/locked/current... intentionally stay monochrome," not green
// checkmarks. Only 'expiring' (warning) and 'error' (destructive) are
// genuine cautionary/error states and earn color; every routine lifecycle
// status maps to a neutral Badge variant.
const STATUS_CONFIG: Record<StatusBadgeStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'outline' },
  pending: { label: 'Pending', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  locked: { label: 'Locked', variant: 'secondary' },
  draft: { label: 'Draft', variant: 'secondary' },
  expiring: { label: 'Expiring soon', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
}

type StatusBadgeProps = {
  status: StatusBadgeStatus
  // Override the default label (e.g. "3 days left" instead of "Expiring
  // soon") while keeping the status's semantic colour.
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant={config.variant} className={className}>
      {label ?? config.label}
    </Badge>
  )
}
