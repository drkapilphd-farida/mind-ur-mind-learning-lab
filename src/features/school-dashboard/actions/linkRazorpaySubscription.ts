'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const LinkRazorpaySubscriptionInputSchema = z
  .object({
    schoolId: z.string().uuid(),
    razorpaySubscriptionId: z.string().trim().min(1, 'Subscription ID is required'),
    billingCycle: z.enum(['monthly', 'yearly']),
  })
  .strict()

export type LinkRazorpaySubscriptionResult = { success: true } | { success: false; error: string }

// Master-admin only. This app never calls Razorpay's API to CREATE a
// subscription — the subscription is created out-of-band (Razorpay
// dashboard, or a hosted Subscription Link, same pattern as the
// existing consumer plans in razorpaySubscriptionLinks.ts) and the
// master admin links the resulting id here. payment_status starts at
// 'created' (not 'active') — the webhook handler is what confirms
// activation once Razorpay actually sends subscription.activated.
export async function linkRazorpaySubscription(input: unknown): Promise<LinkRazorpaySubscriptionResult> {
  const parsed = LinkRazorpaySubscriptionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] linkRazorpaySubscription input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check the form for errors.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] linkRazorpaySubscription — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('schools')
    .update({
      razorpay_subscription_id: parsed.data.razorpaySubscriptionId,
      billing_cycle: parsed.data.billingCycle,
      payment_status: 'created',
    })
    .eq('id', parsed.data.schoolId)

  if (error) {
    logger.warn('[school-dashboard] linkRazorpaySubscription — update FAIL', { error: error.message })
    if (error.code === '23505') {
      return { success: false, error: 'This subscription ID is already linked to another tenant.' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}
