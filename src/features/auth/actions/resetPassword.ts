'use server'

import { createClient } from '@/lib/supabase/server'
import { getRequestOrigin } from '@/lib/domains/appDomain'
import { ForgotPasswordSchema, type AuthActionResult } from '../types'

export async function resetPassword(input: unknown): Promise<AuthActionResult> {
  const parsed = ForgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  // Domain Split™ — the reset link must return the user to whichever
  // domain (habit.mindurmind.org.in vs. app.mindurmind.org.in) they
  // actually requested it from, never a single hardcoded env var (that
  // would always bounce the link to one fixed domain regardless of where
  // the user started — see getRequestOrigin's own doc comment).
  const origin = await getRequestOrigin()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
