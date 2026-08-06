import { createHmac, timingSafeEqual } from 'node:crypto'

// Razorpay signs every webhook body with HMAC-SHA256 of the raw
// (unparsed) request body, using the webhook secret configured in the
// Razorpay dashboard, sent as the `X-Razorpay-Signature` header (hex).
// Comparison MUST be constant-time (timingSafeEqual) — a naive `===`
// leaks timing information an attacker can use to forge a valid
// signature byte-by-byte.
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret).update(rawBody).digest('hex')

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
  const providedBuffer = Buffer.from(signature, 'utf8')

  // timingSafeEqual throws on mismatched buffer lengths rather than
  // returning false — an attacker-controlled header must never crash
  // the route, so the length check happens first.
  if (expectedBuffer.length !== providedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, providedBuffer)
}
