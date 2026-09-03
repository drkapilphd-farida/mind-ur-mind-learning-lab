'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const FRANCHISE_LEAD_STATUSES = ['new', 'contacted', 'approved', 'rejected'] as const
export type FranchiseLeadStatus = (typeof FRANCHISE_LEAD_STATUSES)[number]

const UpdateFranchiseLeadStatusInputSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(FRANCHISE_LEAD_STATUSES),
})

export type UpdateFranchiseLeadStatusResult = { success: true } | { success: false; error: string }

// Admin-only. `(admin)/layout.tsx` already gates the /admin/franchise-leads
// page itself, but Server Actions are directly invokable independent of
// which page rendered the button that called them, so this re-checks
// ADMIN_EMAILS itself — same defense-in-depth as createSchool.ts.
//
// Deliberately just a status flip, nothing else: approving a lead here
// does NOT create a tenant/partner row. Per the site owner's own
// instruction, that stays a manual step through /admin/partners/new.
export async function updateFranchiseLeadStatus(input: unknown): Promise<UpdateFranchiseLeadStatusResult> {
  const parsed = UpdateFranchiseLeadStatusInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[franchise-leads] updateStatus input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid request.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[franchise-leads] updateStatus — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('franchise_leads')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) {
    logger.warn('[franchise-leads] updateStatus — update FAIL', { error: error.message })
    return { success: false, error: 'Could not update status.' }
  }

  revalidatePath('/admin/franchise-leads')
  return { success: true }
}
