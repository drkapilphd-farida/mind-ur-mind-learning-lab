import { FAMILY_PRO_MONTHLY_699, FAMILY_PRO_YEARLY, STARTER_MONTHLY_399, STARTER_YEARLY } from '@/config/pricingLinks'

// Live Razorpay Subscription Links™ — grouped by plan/period for the
// pricing grid's billing-period toggle. The underlying URLs live in
// src/config/pricingLinks.ts (this app's single source of truth for
// every real Razorpay checkout link); this file just re-shapes them into
// the { plan: { monthly, yearly } } lookup PricingPlansGrid.tsx wants —
// auditing "does every button point at the right plan" still only means
// checking one file for the actual literal URLs.
//
// Scope, disclosed: these links only take a payer to Razorpay's hosted
// checkout and back. Nothing in this app yet listens for the resulting
// payment/subscription webhook to mark the paying user's account as Pro
// (`src/lib/subscription/getIsPaidUser.ts` still reads an empty
// `subscriptions` table — see that file's own comments). Wiring these
// buttons is a real, complete frontend change; reconciling a completed
// Razorpay payment back to account entitlements is a separate backend
// task (a Razorpay webhook route + writing to `subscriptions`) not
// included here.
export const RAZORPAY_SUBSCRIPTION_LINKS = {
  starter: {
    monthly: STARTER_MONTHLY_399,
    yearly: STARTER_YEARLY,
  },
  family: {
    monthly: FAMILY_PRO_MONTHLY_699,
    yearly: FAMILY_PRO_YEARLY,
  },
  // Institutional/School (50+ students) — a single Yearly/Custom link,
  // not split by billing period like the two plans above.
  institutional: 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgIqQ4qemnjN4',
} as const

export type BillingPeriod = 'monthly' | 'yearly'
