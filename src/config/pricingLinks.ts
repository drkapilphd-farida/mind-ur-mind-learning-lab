import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from './masterclassPaymentLink'

// Live Razorpay Subscription/Payment Links™ — the single source of truth
// for every real "Subscribe"/"Upgrade"/"Enroll" checkout URL in the app.
// These are Razorpay's hosted Payment/Subscription Links
// (api.razorpay.com/v1/l/subscriptions/<id> or rzp.io/rzp/<id>) — real,
// live, plain URLs that need no client-side SDK, API key, or server
// round trip to use; a plain <a target="_blank"> is the correct,
// complete integration for this link format.
//
// Scope, disclosed: these links only take a payer to Razorpay's hosted
// checkout and back. Nothing in this app yet listens for the resulting
// payment/subscription webhook to mark the paying user's account as Pro
// (`src/lib/subscription/getIsPaidUser.ts` still reads an empty
// `subscriptions` table).
export const STARTER_MONTHLY_399 = 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgFpFD4K5xNPU'
export const STARTER_YEARLY = 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgF04HiTKMPsP'
export const FAMILY_PRO_MONTHLY_699 = 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgGZWko1Bpq5v'
export const FAMILY_PRO_YEARLY = 'https://api.razorpay.com/v1/l/subscriptions/sub_TLgH5ZTb2slwOc'

// Re-exported (not duplicated) from masterclassPaymentLink.ts, which
// stays the literal source of truth for this one URL — it's also
// consumed on its own by the dashboard hero card and /reviews page.
export const FLAGSHIP_4999 = RAZORPAY_MASTERCLASS_PAYMENT_LINK
