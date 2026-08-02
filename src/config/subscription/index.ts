// Runtime feature flags for the `subscription` domain. `false` — the
// Stripe webhook handler is not wired to the new `subscriptions` table
// yet (the existing billing flow, createCheckoutSession.ts, is untouched
// and unrelated to this table).
export const SUBSCRIPTION_CONFIG = {
  billingEnabled: false,
} as const
