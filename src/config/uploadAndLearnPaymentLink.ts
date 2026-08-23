// AI Document Supercharger™ (Upload & Learn) — the real, hosted Razorpay
// checkout link for the ₹499/month document-processing subscription. A
// single source of truth so the dashboard chip and the pricing page
// never risk drifting to two different URLs. Same disclosed scope as
// every other link in this config: it only takes a payer to Razorpay's
// hosted checkout and back — nothing in this app yet listens for the
// resulting webhook to mark the paying user's account as Pro
// (`src/lib/subscription/getIsPaidUser.ts` still reads an empty
// `subscriptions` table).
export const RAZORPAY_UPLOAD_AND_LEARN_PAYMENT_LINK = 'https://rzp.io/rzp/edgVEve'
