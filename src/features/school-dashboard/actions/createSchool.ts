'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import { generateSecurePassword, slugify } from '../provisioning/generateUniqueCredentials'
import { SCHOOL_TIER_DEFAULT_MAX_STUDENTS, type SchoolTier } from '../types'

const CreateSchoolInputSchema = z
  .object({
    type: z.enum(['school', 'franchise_partner']),
    schoolName: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    tier: z.enum(['tier_50', 'tier_100', 'tier_200', 'tier_500_plus']),
    adminFullName: z.string().min(2, 'Admin name must be at least 2 characters'),
    adminEmail: z.string().email('Please enter a valid email address'),
  })
  .strict()

export type CreateSchoolResult =
  | { success: true; schoolId: string; adminEmail: string; adminPassword: string }
  | { success: false; error: string }

// Master-admin only. Creates either tenant type — a franchise partner is
// structurally identical to a school (see tenantCopy.ts), so this one
// action provisions both, distinguished only by `type` (which also
// picks the initial membership row's role: school_admin vs
// franchise_partner — see is_school_admin() treating both the same).
// No student email required (schools/students are the ones needing
// synthetic-email provisioning), but a tenant's FIRST admin does have a
// real email, so this creates their real, login-able account directly
// (mirrors provisionStudentAccount's mechanics, minus the synthetic-
// email/username indirection) in the same step as the tenant row
// itself, rather than requiring the admin to sign up first and then be
// "found" by email — Supabase's admin API has no search-by-email
// lookup, so creating fresh here is both simpler and the only reliable
// option.
export async function createSchool(input: unknown): Promise<CreateSchoolResult> {
  const parsed = CreateSchoolInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] createSchool input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check the form for errors.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] createSchool — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()
  const slug = slugify(parsed.data.slug)
  const adminPassword = generateSecurePassword()

  const { data: authUser, error: createUserError } = await serviceClient.auth.admin.createUser({
    email: parsed.data.adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.adminFullName },
  })

  if (createUserError || !authUser.user) {
    logger.warn('[school-dashboard] createSchool — admin createUser FAIL', { error: createUserError?.message })
    return { success: false, error: createUserError?.message ?? 'Could not create the admin account.' }
  }

  const maxStudents = SCHOOL_TIER_DEFAULT_MAX_STUDENTS[parsed.data.tier as SchoolTier]

  const { data: school, error: schoolError } = await serviceClient
    .from('schools')
    .insert({
      name: parsed.data.schoolName,
      slug,
      type: parsed.data.type,
      tier: parsed.data.tier,
      max_students: maxStudents,
      owner_id: authUser.user.id,
    })
    .select('id')
    .single()

  if (schoolError || !school) {
    logger.warn('[school-dashboard] createSchool — schools insert FAIL', { error: schoolError?.message })
    return { success: false, error: schoolError?.message ?? 'Could not create the tenant.' }
  }

  const { error: memberError } = await serviceClient.from('school_members').insert({
    school_id: school.id,
    user_id: authUser.user.id,
    role: parsed.data.type === 'franchise_partner' ? 'franchise_partner' : 'school_admin',
  })

  if (memberError) {
    logger.warn('[school-dashboard] createSchool — school_members insert FAIL', { error: memberError.message })
    return { success: false, error: memberError.message }
  }

  return { success: true, schoolId: school.id, adminEmail: parsed.data.adminEmail, adminPassword }
}
