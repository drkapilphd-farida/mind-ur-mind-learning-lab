'use server'

import { createClient } from '@/lib/supabase/server'
import { ForgotPasswordSchema, type AuthActionResult } from '../types'

export async function resetPassword(input: unknown): Promise<AuthActionResult> {
  const parsed = ForgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/update-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
