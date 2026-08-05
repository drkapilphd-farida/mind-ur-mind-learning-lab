'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { provisionStudentAccount } from '../provisioning/provisionStudentAccount'
import { TENANT_ADMIN_ROLES, type SchoolMemberRole } from '../types'

const AddStudentManuallyInputSchema = z
  .object({
    schoolId: z.string().uuid(),
    schoolSlug: z.string().min(1),
    classId: z.string().uuid(),
    classSlug: z.string().min(1),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    rollNumber: z.string().nullable(),
  })
  .strict()

export type AddStudentManuallyResult =
  | { success: true; username: string; password: string; fullName: string }
  | { success: false; error: string; seatLimitExceeded?: true }

// school_admin only (re-derived server-side, never trusted from the
// client). Enforces the seat limit BEFORE provisioning — the same
// all-or-nothing pre-check bulkImportStudents will use for a whole CSV
// batch, here applied to a batch of one.
export async function addStudentManually(input: unknown): Promise<AddStudentManuallyResult> {
  const parsed = AddStudentManuallyInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] addStudentManually input failed validation', { issues: parsed.error.issues })
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
    logger.warn('[school-dashboard] addStudentManually — unauthorized attempt', { userId: user.id, schoolId: parsed.data.schoolId })
    return { success: false, error: 'Not authorized.' }
  }

  const { data: school } = await supabase.from('schools').select('max_students').eq('id', parsed.data.schoolId).maybeSingle()

  if (!school) {
    return { success: false, error: 'Tenant not found.' }
  }

  const { count: currentStudentCount } = await supabase
    .from('school_members')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', parsed.data.schoolId)
    .eq('role', 'student')
    .eq('status', 'active')

  if ((currentStudentCount ?? 0) >= school.max_students) {
    return { success: false, error: `This school has reached its ${school.max_students}-student limit.`, seatLimitExceeded: true }
  }

  const result = await provisionStudentAccount({
    schoolId: parsed.data.schoolId,
    schoolSlug: parsed.data.schoolSlug,
    classId: parsed.data.classId,
    classSlug: parsed.data.classSlug,
    fullName: parsed.data.fullName,
    rollNumber: parsed.data.rollNumber,
  })

  return result
}
