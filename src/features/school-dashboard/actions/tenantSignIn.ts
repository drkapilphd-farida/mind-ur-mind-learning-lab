'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { getSchoolForUser } from '../queries/getSchoolForUser'
import type { SchoolType } from '../types'

const TENANT_SIGN_IN_RATE_LIMIT = { max: 10, windowMs: 60_000 }

const TenantSignInSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict()

const PORTAL_HOME: Record<SchoolType, string> = {
  school: '/school-admin',
  franchise_partner: '/partner-admin',
}

const PORTAL_REJECTION_MESSAGE: Record<SchoolType, string> = {
  school: 'This login is for school administrators only.',
  franchise_partner: 'This login is for franchise partners only.',
}

// Dedicated login for one tenant type's portal — backs both
// /school-admin/login (type: 'school') and /partner-admin/login
// (type: 'franchise_partner'), so neither ever needs the shared
// consumer /login page or its Google-signup flow.
//
// A correct password alone is never enough: the account must genuinely
// belong to an active, non-student membership of a tenant of the
// REQUESTED type, verified server-side via the same getSchoolForUser()
// every portal layout already trusts. A mismatch (wrong tenant type,
// student account, or no tenant membership at all) tears the session
// back down immediately — a valid password for the wrong kind of
// account must never leave a live, authenticated cookie behind, even
// briefly.
export async function tenantSignIn(input: unknown, type: SchoolType, next?: string): Promise<{ success: false; error: string }> {
  const parsed = TenantSignInSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email and password.' }
  }

  const clientIp = await getClientIp()
  if (!checkRateLimit(`tenant-sign-in:${type}:${clientIp}`, TENANT_SIGN_IN_RATE_LIMIT).allowed) {
    return { success: false, error: 'Too many sign-in attempts. Please wait a moment and try again.' }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (signInError) {
    return { success: false, error: 'Incorrect email or password.' }
  }

  const membership = await getSchoolForUser()
  const isValidMember = membership !== null && membership.member.role !== 'student' && membership.school.type === type

  if (!isValidMember) {
    await supabase.auth.signOut()
    return { success: false, error: PORTAL_REJECTION_MESSAGE[type] }
  }

  const portalHome = PORTAL_HOME[type]
  // Only ever redirect within this same portal's own URL space — next is
  // client-controllable (a query param), so a value pointing anywhere
  // else is ignored rather than trusted as an open redirect target.
  const destination = next !== undefined && next.startsWith(portalHome) ? next : portalHome
  redirect(destination)
}
