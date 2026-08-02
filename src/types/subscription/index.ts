// Domain types for `subscription`. Mirrors `plans`, `subscriptions`,
// `entitlements` from
// supabase/migrations/20260711000005_create_plans_subscriptions_entitlements.sql
// — see docs/adr/0001-ai-learning-studio-domain-model.md.

export type BillingInterval = 'month' | 'year' | 'lifetime' | 'free'

export type Plan = {
  id: string
  key: string
  name: string
  description: string | null
  priceCents: number
  billingInterval: BillingInterval
  maxFamilyMembers: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'

export type Subscription = {
  id: string
  userId: string
  familyId: string | null
  planId: string
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

// Exactly one of planId/userId is set — a plan-level template or a
// single user's override, never both (enforced in the database via
// entitlements_plan_xor_user).
export type Entitlement = {
  id: string
  planId: string | null
  userId: string | null
  key: string
  value: unknown
  createdAt: string
  updatedAt: string
}
