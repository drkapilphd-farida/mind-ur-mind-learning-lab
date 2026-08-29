// 11-Day Online Psychic & Spiritual Retreat™ — the real, hosted Razorpay
// Payment Link for enrollment. Single source of truth so every placement
// (pricing section, sticky bar, final CTA) never risks drifting to two
// different URLs. Same pattern as masterclassPaymentLink.ts: completing
// this checkout takes real payment; it does not automatically grant
// batch access — enrollment/scheduling is handled manually after
// payment, so no surrounding copy should promise instant or automatic
// access. No price is hardcoded anywhere alongside this link — Razorpay's
// own hosted checkout page is the single source of truth for the actual
// amount, so it can never drift out of sync with what's shown here.
export const RAZORPAY_RETREAT_PAYMENT_LINK = 'https://rzp.io/rzp/ULFp3DJ'
