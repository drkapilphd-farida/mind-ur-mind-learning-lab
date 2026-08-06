import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay/verifyWebhookSignature'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const RazorpayWebhookPayloadSchema = z.object({
  event: z.string(),
  payload: z.object({
    subscription: z
      .object({
        entity: z.object({
          id: z.string(),
          current_end: z.number().nullable().optional(),
        }),
      })
      .optional(),
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number(),
          currency: z.string(),
        }),
      })
      .optional(),
  }),
})

// The three events the product asked to react to, plus 'cancelled' —
// necessary to ever reach payment_status='canceled' at all (none of the
// other three ever transition there), and a standard Razorpay
// subscription lifecycle event. Anything else is acknowledged (200) but
// ignored, per standard webhook practice — Razorpay retries on non-2xx,
// and this app has no opinion on events outside this set.
const HANDLED_EVENTS = new Set(['subscription.activated', 'subscription.charged', 'subscription.halted', 'subscription.cancelled'])

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (signature === null) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (webhookSecret === undefined) {
    logger.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  if (!verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret)) {
    logger.warn('[razorpay-webhook] signature verification failed')
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = RazorpayWebhookPayloadSchema.safeParse(json)
  if (!parsed.success) {
    logger.warn('[razorpay-webhook] payload failed validation')
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const { event, payload } = parsed.data

  if (!HANDLED_EVENTS.has(event)) {
    return NextResponse.json({ received: true })
  }

  const subscriptionId = payload.subscription?.entity.id
  if (subscriptionId === undefined) {
    return NextResponse.json({ error: 'Missing subscription id.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: school } = await supabase.from('schools').select('id').eq('razorpay_subscription_id', subscriptionId).maybeSingle()

  if (!school) {
    // A webhook for a subscription that isn't linked to a tenant yet
    // (e.g. created in Razorpay but not yet pasted into the admin UI —
    // see linkRazorpaySubscription.ts) is an expected, transient state,
    // not an error — ack it so Razorpay doesn't retry.
    logger.warn('[razorpay-webhook] no tenant linked to this subscription', { subscriptionId, event })
    return NextResponse.json({ received: true })
  }

  const occurredAt = new Date().toISOString()

  if (event === 'subscription.activated') {
    await supabase.from('schools').update({ payment_status: 'active' }).eq('id', school.id)
    await supabase.from('school_billing_events').insert({
      school_id: school.id,
      event_type: 'activated',
      razorpay_subscription_id: subscriptionId,
      occurred_at: occurredAt,
    })
  } else if (event === 'subscription.charged') {
    const currentEnd = payload.subscription?.entity.current_end
    const schoolUpdate: { payment_status: 'active'; expires_at?: string } = { payment_status: 'active' }
    if (currentEnd !== undefined && currentEnd !== null) {
      schoolUpdate.expires_at = new Date(currentEnd * 1000).toISOString()
    }
    await supabase.from('schools').update(schoolUpdate).eq('id', school.id)

    const paymentEntity = payload.payment?.entity
    const { error: insertError } = await supabase.from('school_billing_events').insert({
      school_id: school.id,
      event_type: 'charged',
      razorpay_subscription_id: subscriptionId,
      razorpay_payment_id: paymentEntity?.id ?? null,
      amount_cents: paymentEntity?.amount ?? null,
      currency: paymentEntity?.currency ?? null,
      occurred_at: occurredAt,
    })
    // A unique violation on razorpay_payment_id means Razorpay
    // redelivered this exact charge webhook — already logged, not a
    // real error.
    if (insertError && insertError.code !== '23505') {
      logger.error('[razorpay-webhook] failed to log charged event', { schoolId: school.id, error: insertError.message })
    }
  } else if (event === 'subscription.halted') {
    await supabase.from('schools').update({ payment_status: 'past_due' }).eq('id', school.id)
    await supabase.from('school_billing_events').insert({
      school_id: school.id,
      event_type: 'halted',
      razorpay_subscription_id: subscriptionId,
      occurred_at: occurredAt,
    })
  } else if (event === 'subscription.cancelled') {
    await supabase.from('schools').update({ payment_status: 'canceled' }).eq('id', school.id)
    await supabase.from('school_billing_events').insert({
      school_id: school.id,
      event_type: 'cancelled',
      razorpay_subscription_id: subscriptionId,
      occurred_at: occurredAt,
    })
  }

  return NextResponse.json({ received: true })
}
