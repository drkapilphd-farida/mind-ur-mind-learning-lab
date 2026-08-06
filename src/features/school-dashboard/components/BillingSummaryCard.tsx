import { Calendar, CreditCard } from 'lucide-react'
import { PAYMENT_STATUS_BADGE } from '../billing'
import { SCHOOL_TIER_LABELS, type SchoolTier, type PaymentStatus } from '../types'
import { StatusBadge } from '@/components/ui/status-badge'

type BillingSummaryCardProps = {
  tier: SchoolTier
  paymentStatus: PaymentStatus
  expiresAt: string | null
}

// Portal-facing (school-admin / partner-admin) read-only billing
// summary — current plan, payment status, and next renewal date.
// Deliberately read-only: linking/unlinking a subscription is a
// master-admin-only action (see TenantBillingForm.tsx).
export function BillingSummaryCard({ tier, paymentStatus, expiresAt }: BillingSummaryCardProps): React.JSX.Element {
  const badge = PAYMENT_STATUS_BADGE[paymentStatus]

  return (
    <div className="bg-gradient-to-br from-card to-muted/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Current plan</p>
          <p className="mt-1 text-xl font-bold tracking-tight">{SCHOOL_TIER_LABELS[tier]}</p>
          <div className="mt-2">
            <StatusBadge status={badge.status} label={badge.label} />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs font-medium">
              <Calendar className="size-3.5" />
              Next renewal
            </div>
            <p className="mt-1 text-lg font-semibold">{expiresAt !== null ? new Date(expiresAt).toLocaleDateString() : '—'}</p>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs font-medium">
              <CreditCard className="size-3.5" />
              Billing
            </div>
            <p className="mt-1 text-lg font-semibold">Managed by HQ</p>
          </div>
        </div>
      </div>
    </div>
  )
}
