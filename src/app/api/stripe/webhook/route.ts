import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured.' },
      { status: 500 },
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const metadata = session.metadata
    if (metadata === null) {
      return NextResponse.json({ error: 'No metadata.' }, { status: 400 })
    }

    const user_id = metadata['user_id']
    const course_id = metadata['course_id']

    if (user_id === undefined || course_id === undefined) {
      return NextResponse.json(
        { error: 'Missing metadata fields.' },
        { status: 400 },
      )
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('enrollments')
      .insert({ user_id, course_id })

    if (error && error.code !== '23505') {
      return NextResponse.json(
        { error: 'Failed to create enrollment.' },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ received: true })
}
