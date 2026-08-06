'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolvePostSignInPath } from '@/features/school-dashboard/queries/resolvePostSignInPath'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { SignInSchema } from '../types'

// Per-IP, not per-account — the point is slowing down credential
// stuffing against this endpoint generally, before we even know which
// account (if any) is being targeted.
const SIGN_IN_RATE_LIMIT = { max: 10, windowMs: 60_000 }

export async function signIn(
  input: unknown,
  next: string = '/dashboard',
): Promise<{ success: false; error: string }> {
  const parsed = SignInSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email and password.' }
  }

  const clientIp = await getClientIp()
  if (!checkRateLimit(`sign-in:${clientIp}`, SIGN_IN_RATE_LIMIT).allowed) {
    return { success: false, error: 'Too many sign-in attempts. Please wait a moment and try again.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // A caller-specified `next` (e.g. middleware bounced someone here with a
  // real deep link) always wins; only the untouched default gets the
  // role-based override, so a school_admin/franchise_partner lands on
  // their own portal instead of the student dashboard.
  redirect(next === '/dashboard' ? await resolvePostSignInPath() : next)
}
