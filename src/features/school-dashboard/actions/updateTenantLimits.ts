'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const UpdateTenantLimitsInputSchema = z
  .object({
    schoolId: z.string().uuid(),
    maxStudents: z.number().int().min(1, 'Must allow at least 1 student'),
    monthlyAiQuota: z.number().int().min(0, 'Cannot be negative'),
    // Empty string means "clear the expiry" (perpetual/no billing tie) —
    // the form sends '' rather than null since HTML date inputs can't
    // represent null directly.
    expiresAt: z.string(),
  })
  .strict()

export type UpdateTenantLimitsResult = { success: true } | { success: false; error: string }

// Master-admin only — the one action backing every control on the
// /admin/tenants/[tenantId] drill-down (seat limit, AI quota "credits",
// subscription expiry): three fields on the same schools row, not three
// separate mechanisms. Re-checks ADMIN_EMAILS server-side, same pattern
// as createSchool.ts/createPartnerResource.ts — never trusts the
// (admin)/layout.tsx gate alone.
export async function updateTenantLimits(input: unknown): Promise<UpdateTenantLimitsResult> {
  const parsed = UpdateTenantLimitsInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] updateTenantLimits input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check the form for errors.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] updateTenantLimits — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('schools')
    .update({
      max_students: parsed.data.maxStudents,
      monthly_ai_quota: parsed.data.monthlyAiQuota,
      expires_at: parsed.data.expiresAt === '' ? null : new Date(parsed.data.expiresAt).toISOString(),
    })
    .eq('id', parsed.data.schoolId)

  if (error) {
    logger.warn('[school-dashboard] updateTenantLimits — update FAIL', { error: error.message })
    return { success: false, error: error.message }
  }

  return { success: true }
}
