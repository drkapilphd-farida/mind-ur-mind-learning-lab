'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolvePostSignInPath } from '@/features/school-dashboard/queries/resolvePostSignInPath'
import { SignInSchema } from '../types'

export async function signIn(
  input: unknown,
  next: string = '/dashboard',
): Promise<{ success: false; error: string }> {
  const parsed = SignInSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email and password.' }
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
