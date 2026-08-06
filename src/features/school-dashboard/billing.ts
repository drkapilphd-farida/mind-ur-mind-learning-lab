import type { StatusBadgeStatus } from '@/components/ui/status-badge'
import type { BillingEventType } from './queries/getTenantDetail'
import type { PaymentStatus } from './types'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unlinked: 'Not linked',
  created: 'Pending activation',
  active: 'Active',
  past_due: 'Past Due',
  canceled: 'Canceled',
}

// Maps onto StatusBadge's existing semantic colour scale (see
// subscriptionStatus.ts's own SUBSCRIPTION_STATUS_BADGE for the same
// pattern) — 'past_due' is the one genuine warning state, 'canceled' the
// one genuine error state; everything else stays neutral per
// DESIGN_SYSTEM.md §9.
export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { status: StatusBadgeStatus; label: string }> = {
  unlinked: { status: 'draft', label: 'Not linked' },
  created: { status: 'pending', label: 'Pending activation' },
  active: { status: 'active', label: 'Active' },
  past_due: { status: 'expiring', label: 'Past Due' },
  canceled: { status: 'error', label: 'Canceled' },
}

export const BILLING_EVENT_LABELS: Record<BillingEventType, string> = {
  activated: 'Subscription activated',
  charged: 'Payment received',
  halted: 'Payments halted',
  cancelled: 'Subscription canceled',
}

export function formatBillingAmount(amountCents: number | null, currency: string | null): string {
  if (amountCents === null || currency === null) {
    return '—'
  }
  // Razorpay amounts are in the smallest currency unit (e.g. paise for
  // INR, cents for USD) — divide by 100 to get the display amount,
  // mirroring price_cents' own convention in the plans table.
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amountCents / 100)
}
