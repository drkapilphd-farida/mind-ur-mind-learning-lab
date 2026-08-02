// Compile-time constants for the `subscription` domain. Mirrors the
// CHECK constraints in
// supabase/migrations/20260711000005_create_plans_subscriptions_entitlements.sql.
// No actual Plan rows exist yet (no seed data shipped in Chunk 3) — these
// are the anticipated keys a future seed migration would use.

export const BILLING_INTERVALS = ['month', 'year', 'lifetime', 'free'] as const

export const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'canceled', 'expired'] as const

export const ANTICIPATED_PLAN_KEYS = ['free', 'individual', 'family'] as const
