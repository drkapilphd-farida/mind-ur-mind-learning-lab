'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { TENANT_ADMIN_ROLES, type SchoolMemberRole } from '../types'

const UpdateTenantBrandingInputSchema = z
  .object({
    schoolId: z.string().uuid(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    logoUrl: z.string().url().nullable(),
  })
  .strict()

export type UpdateTenantBrandingResult = { success: true } | { success: false; error: string }

// school_admin or franchise_partner of that specific tenant only
// (re-derived server-side). The logo file itself is uploaded directly
// from the browser to the school-assets bucket before this is called
// (see BrandingForm.tsx) — this just persists the resulting public URL
// + display name onto the schools row.
export async function updateTenantBranding(input: unknown): Promise<UpdateTenantBrandingResult> {
  const parsed = UpdateTenantBrandingInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] updateTenantBranding input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check the form for errors.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not signed in.' }
  }

  const { data: callerMember } = await supabase
    .from('school_members')
    .select('role')
    .eq('school_id', parsed.data.schoolId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!callerMember || !TENANT_ADMIN_ROLES.includes(callerMember.role as SchoolMemberRole)) {
    logger.warn('[school-dashboard] updateTenantBranding — unauthorized attempt', { userId: user.id, schoolId: parsed.data.schoolId })
    return { success: false, error: 'Not authorized.' }
  }

  const { error } = await supabase
    .from('schools')
    .update({ name: parsed.data.name, logo_url: parsed.data.logoUrl })
    .eq('id', parsed.data.schoolId)

  if (error) {
    logger.warn('[school-dashboard] updateTenantBranding — update FAIL', { error: error.message })
    return { success: false, error: error.message }
  }

  return { success: true }
}
