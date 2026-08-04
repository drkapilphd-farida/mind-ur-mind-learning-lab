// Live Razorpay Subscription Links™ — the single source of truth for
// every "Subscribe"/"Upgrade" CTA in the app. Deliberately centralized
// here rather than scattered as string literals across the pricing page
// and every in-app upsell — auditing "does every button point at the
// right plan" means checking one file, not grepping the whole repo.
//
// These are Razorpay's hosted Payment/Subscription Links
// (api.razorpay.com/v1/l/subscriptions/<id>) — real, live, plain URLs
// that need no client-side SDK, API key, or server round trip to use; a
// plain <a target="_blank"> is the correct, complete integration for
// this link format.
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
    monthly: 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgFpFD4K5xNPU',
    yearly: 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgF04HiTKMPsP',
  },
  family: {
    monthly: 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgGZWko1Bpq5v',
    yearly: 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgH5ZTb2slwOc',
  },
  // Institutional/School (50+ students) — a single Yearly/Custom link,
  // not split by billing period like the two plans above.
  institutional: 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgIqQ4qemnjN4',
} as const

export type BillingPeriod = 'monthly' | 'yearly'
