'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const CreatePartnerResourceInputSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().nullable(),
    resourceType: z.enum(['zoom_session', 'marketing_material', 'sales_guide']),
    url: z.string().url('Please enter a valid URL'),
    scheduledAt: z.string().datetime().nullable(),
    displayOrder: z.number().int(),
  })
  .strict()

export type CreatePartnerResourceResult = { success: true; id: string } | { success: false; error: string }

// Master-admin only — writes to partner_resources are service-role only
// (no client INSERT policy), matching the read side's is_franchise_partner()
// gate: only master admin decides what every partner sees.
export async function createPartnerResource(input: unknown): Promise<CreatePartnerResourceResult> {
  const parsed = CreatePartnerResourceInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] createPartnerResource input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check the form for errors.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] createPartnerResource — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const { data: row, error } = await serviceClient
    .from('partner_resources')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      resource_type: parsed.data.resourceType,
      url: parsed.data.url,
      scheduled_at: parsed.data.scheduledAt,
      display_order: parsed.data.displayOrder,
    })
    .select('id')
    .single()

  if (error || !row) {
    logger.warn('[school-dashboard] createPartnerResource — insert FAIL', { error: error?.message })
    return { success: false, error: error?.message ?? 'Could not create the resource.' }
  }

  return { success: true, id: row.id }
}
