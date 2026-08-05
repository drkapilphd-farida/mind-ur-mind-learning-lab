'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const DeletePartnerResourceInputSchema = z.object({ id: z.string().uuid() }).strict()

export type DeletePartnerResourceResult = { success: true } | { success: false; error: string }

export async function deletePartnerResource(input: unknown): Promise<DeletePartnerResourceResult> {
  const parsed = DeletePartnerResourceInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid resource id.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] deletePartnerResource — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient.from('partner_resources').delete().eq('id', parsed.data.id)

  if (error) {
    logger.warn('[school-dashboard] deletePartnerResource — delete FAIL', { error: error.message })
    return { success: false, error: error.message }
  }

  return { success: true }
}
