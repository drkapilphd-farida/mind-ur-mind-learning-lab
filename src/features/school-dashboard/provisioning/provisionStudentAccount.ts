import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import { generateSecurePassword, generateUniqueUsername, studentAuthEmailFor } from './generateUniqueCredentials'

export type ProvisionStudentAccountInput = {
  schoolId: string
  schoolSlug: string
  classId: string
  classSlug: string
  fullName: string
  rollNumber: string | null
}

export type ProvisionStudentAccountResult =
  | { success: true; username: string; password: string; fullName: string }
  | { success: false; error: string }

// The core, riskiest mechanic of the school dashboard — turns one row
// (manual form or a CSV line) into a real, login-able Supabase Auth
// account with no student email required. Called from both the manual
// add action and the bulk import action so there is exactly one code
// path to get right.
//
// Synthetic email: Supabase Auth requires a unique identifier, but most
// school-age students don't have their own email. studentAuthEmailFor()
// builds a non-routable @students.quantummind.internal address purely as
// the Auth-layer key — the credential actually shown to the school admin
// is the generated `username`, never this synthetic email. The student
// login page translates username -> synthetic email before calling the
// existing signInWithPassword flow.
//
// The plaintext password is returned once, in-memory, for the caller to
// render on a credentials sheet — it is never written to any table (Auth
// stores only its own hash, same as every normal signup).
export async function provisionStudentAccount(input: ProvisionStudentAccountInput): Promise<ProvisionStudentAccountResult> {
  const supabase = createServiceClient()

  const usernameResult = await generateUniqueUsername(supabase, {
    schoolSlug: input.schoolSlug,
    classSlug: input.classSlug,
    fullName: input.fullName,
  })
  if (!usernameResult.success) {
    return { success: false, error: usernameResult.error }
  }

  const username = usernameResult.username
  const password = generateSecurePassword()

  const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
    email: studentAuthEmailFor(username),
    password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  })

  if (createUserError || !authUser.user) {
    logger.warn('[school-dashboard] provisionStudentAccount — createUser FAIL', {
      schoolId: input.schoolId,
      classId: input.classId,
      error: createUserError?.message ?? 'no user returned',
    })
    return { success: false, error: createUserError?.message ?? 'Account creation failed.' }
  }

  // handle_new_user() fires automatically on this insert (identical to
  // every existing signup path) — the profiles row needs no extra code
  // here.

  const { data: member, error: memberError } = await supabase
    .from('school_members')
    .insert({
      school_id: input.schoolId,
      user_id: authUser.user.id,
      role: 'student',
      username,
      roll_number: input.rollNumber,
    })
    .select('id')
    .single()

  if (memberError || !member) {
    logger.warn('[school-dashboard] provisionStudentAccount — school_members insert FAIL', {
      schoolId: input.schoolId,
      userId: authUser.user.id,
      error: memberError?.message ?? 'no row returned',
    })
    return { success: false, error: memberError?.message ?? 'Membership creation failed.' }
  }

  const { error: enrollmentError } = await supabase.from('class_enrollments').insert({
    class_id: input.classId,
    school_member_id: member.id,
  })

  if (enrollmentError) {
    logger.warn('[school-dashboard] provisionStudentAccount — class_enrollments insert FAIL', {
      classId: input.classId,
      schoolMemberId: member.id,
      error: enrollmentError.message,
    })
    return { success: false, error: enrollmentError.message }
  }

  return { success: true, username, password, fullName: input.fullName }
}
