'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignUpSchema } from '../types'

export async function signUp(
  input: unknown,
): Promise<{ success: false; error: string }> {
  const parsed = SignUpSchema.safeParse(input)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message ?? 'Invalid input.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Redirect to login with confirmation message regardless of whether email
  // confirmation is required — the login page displays the banner when present.
  redirect('/login?message=check-email')
}
