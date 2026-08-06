'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const UnlinkRazorpaySubscriptionInputSchema = z.object({ schoolId: z.string().uuid() }).strict()

export type UnlinkRazorpaySubscriptionResult = { success: true } | { success: false; error: string }

// Master-admin only — undoes linkRazorpaySubscription.ts (e.g. the
// admin pasted the wrong id). Deliberately does not touch expires_at —
// that's a separate, already-existing control (updateTenantLimits.ts).
export async function unlinkRazorpaySubscription(input: unknown): Promise<UnlinkRazorpaySubscriptionResult> {
  const parsed = UnlinkRazorpaySubscriptionInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid tenant id.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] unlinkRazorpaySubscription — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('schools')
    .update({
      razorpay_subscription_id: null,
      razorpay_customer_id: null,
      billing_cycle: null,
      payment_status: 'unlinked',
    })
    .eq('id', parsed.data.schoolId)

  if (error) {
    logger.warn('[school-dashboard] unlinkRazorpaySubscription — update FAIL', { error: error.message })
    return { success: false, error: error.message }
  }

  return { success: true }
}
