import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay/verifyWebhookSignature'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

// Automated Habit Builder Access™ — sibling to /api/razorpay/masterclass-webhook,
// same shape, deliberately NOT reusing its grant mechanism. That route
// grants via public.subscriptions (read by getIsPaidUser(), which every
// other paid gate in the app also reads); this one must NOT — a Habit
// Builder purchase is required to stay fully isolated from QSR
// Masterclass-gated content (explicit founder decision), so this grants
// via public.entitlements instead — see
// 20260903000002_create_habit_builder_payments_and_entitlement.sql's own
// comment for the full reasoning. hasHabitBuilderAccess() is the only
// reader of that entitlement.
//
// Uses its own webhook secret (RAZORPAY_HABIT_BUILDER_WEBHOOK_SECRET) —
// register a THIRD webhook endpoint in the Razorpay Dashboard subscribed
// to "payment.captured" only, on RAZORPAY_QUANTUM_MINDSET_HABIT_BUILDER_PAYMENT_LINK
// specifically, so a bug here can't affect the tenant billing or
// Masterclass webhooks or vice versa.
const WEBHOOK_RATE_LIMIT = { max: 60, windowMs: 60_000 }

const RazorpayPaymentCapturedPayloadSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.string(),
        // Razorpay's payment entity field names, not ours — email/contact
        // are whatever the payer entered on Razorpay's own checkout form,
        // same payment-to-account matching caveat as the masterclass webhook.
        email: z.string().nullable().optional(),
        contact: z.string().nullable().optional(),
      }),
    }),
  }),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = await getClientIp()
  const rateLimitDecision = checkRateLimit(`razorpay-habit-builder-webhook:${clientIp}`, WEBHOOK_RATE_LIMIT)
  if (!rateLimitDecision.allowed) {
    logger.warn('[razorpay-habit-builder-webhook] rate limit exceeded', { clientIp })
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitDecision.retryAfterMs / 1000)) } },
    )
  }

  try {
    return await handleHabitBuilderWebhook(request)
  } catch (error) {
    logger.error('[razorpay-habit-builder-webhook] unhandled exception', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 })
  }
}

async function handleHabitBuilderWebhook(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (signature === null) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const webhookSecret = process.env.RAZORPAY_HABIT_BUILDER_WEBHOOK_SECRET
  if (webhookSecret === undefined) {
    logger.error('[razorpay-habit-builder-webhook] RAZORPAY_HABIT_BUILDER_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  if (!verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret)) {
    logger.warn('[razorpay-habit-builder-webhook] signature verification failed')
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = RazorpayPaymentCapturedPayloadSchema.safeParse(json)
  if (!parsed.success) {
    logger.warn('[razorpay-habit-builder-webhook] payload failed validation')
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const { event, payload } = parsed.data

  // Only ever subscribed to payment.captured in the Razorpay Dashboard,
  // but ack (200) anything else defensively — same posture as the other
  // two webhooks.
  if (event !== 'payment.captured') {
    return NextResponse.json({ received: true })
  }

  const { id: razorpayPaymentId, amount, currency, email, contact } = payload.payment.entity
  const supabase = createServiceClient()

  // Idempotent on razorpay_payment_id — Razorpay's documented
  // at-least-once redelivery, or a manual resend from the Dashboard,
  // must never grant a second entitlement row or double-count revenue.
  const { data: existingPayment } = await supabase
    .from('habit_builder_payments')
    .select('id, granted_at')
    .eq('razorpay_payment_id', razorpayPaymentId)
    .maybeSingle()

  if (existingPayment) {
    logger.warn('[razorpay-habit-builder-webhook] duplicate delivery, already recorded', { razorpayPaymentId })
    return NextResponse.json({ received: true })
  }

  const { data: insertedPayment, error: insertError } = await supabase
    .from('habit_builder_payments')
    .insert({
      razorpay_payment_id: razorpayPaymentId,
      email: email ?? null,
      phone: contact ?? null,
      amount_cents: amount,
      currency,
    })
    .select('id')
    .single()

  if (insertError || !insertedPayment) {
    // A unique-violation redelivery race (two webhook deliveries landing
    // concurrently) is the one expected case here — already logged via
    // the SELECT above in the common case; anything else is a real
    // failure worth surfacing as a 500 so Razorpay retries.
    if (insertError?.code === '23505') {
      return NextResponse.json({ received: true })
    }
    logger.error('[razorpay-habit-builder-webhook] failed to record payment', {
      razorpayPaymentId,
      error: insertError?.message,
    })
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
  }

  // Try to match an existing account immediately (signup-before-payment
  // case). If no match, the row sits unclaimed — handle_new_user() picks
  // it up the moment a matching account is created (payment-before-
  // signup case, the more common real-world ordering for a static,
  // unauthenticated Payment Link).
  let matchedUserId: string | null = null
  if (email !== null && email !== undefined) {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
    matchedUserId = data?.id ?? null
  }
  if (matchedUserId === null && contact !== null && contact !== undefined) {
    const { data } = await supabase.from('profiles').select('id').eq('phone', contact).maybeSingle()
    matchedUserId = data?.id ?? null
  }

  if (matchedUserId !== null) {
    // Grants via public.entitlements (user-level override, plan_id NULL)
    // — never public.subscriptions. See this file's own top comment for
    // why: isolation from getIsPaidUser() is the whole point.
    const { error: entitlementError } = await supabase
      .from('entitlements')
      .upsert(
        { user_id: matchedUserId, key: 'habit_builder_access', value: { granted: true } },
        { onConflict: 'user_id,key' },
      )

    if (entitlementError) {
      logger.error('[razorpay-habit-builder-webhook] failed to grant entitlement', {
        razorpayPaymentId,
        userId: matchedUserId,
        error: entitlementError.message,
      })
      return NextResponse.json({ error: 'Failed to grant access.' }, { status: 500 })
    }

    await supabase
      .from('habit_builder_payments')
      .update({ user_id: matchedUserId, granted_at: new Date().toISOString() })
      .eq('id', insertedPayment.id)
  }

  return NextResponse.json({ received: true })
}
