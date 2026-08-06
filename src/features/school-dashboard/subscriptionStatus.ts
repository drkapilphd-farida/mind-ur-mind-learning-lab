import type { StatusBadgeStatus } from '@/components/ui/status-badge'

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired'

const EXPIRING_SOON_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
}

// Single source of truth for the 14-day "expiring soon" window — used by
// both the platform overview cards and the tenants table, so the two
// never drift out of sync. A null expiresAt (no live billing tied to
// this tenant, the default for every school/partner today) is always
// 'active' — there's nothing to expire.
export function deriveSubscriptionStatus(expiresAt: string | null, now: Date = new Date()): SubscriptionStatus {
  if (expiresAt === null) {
    return 'active'
  }

  const expiryTime = new Date(expiresAt).getTime()
  const nowTime = now.getTime()

  if (expiryTime <= nowTime) {
    return 'expired'
  }

  if (expiryTime - nowTime <= EXPIRING_SOON_WINDOW_MS) {
    return 'expiring_soon'
  }

  return 'active'
}

// Maps onto the existing StatusBadge component's semantic colour scale
// (src/components/ui/status-badge.tsx) rather than inventing a parallel
// one — 'expiring' and 'error' are its two genuine cautionary/error
// variants, exactly matching "Expiring Soon"/"Expired" here.
export const SUBSCRIPTION_STATUS_BADGE: Record<SubscriptionStatus, { status: StatusBadgeStatus; label: string }> = {
  active: { status: 'active', label: 'Active' },
  expiring_soon: { status: 'expiring', label: 'Expiring Soon' },
  expired: { status: 'error', label: 'Expired' },
}
