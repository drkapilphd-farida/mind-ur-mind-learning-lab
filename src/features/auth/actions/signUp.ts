'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignUpSchema } from '../types'

const DISCOVERY_ENTRY_PATH = '/discover-learning-potential'

export async function signUp(
  input: unknown,
): Promise<{ success: false; error: string }> {
  const parsed = SignUpSchema.safeParse(input)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message ?? 'Invalid input.' }
  }

  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${appUrl}/auth/callback?next=${DISCOVERY_ENTRY_PATH}`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Projects with email confirmation OFF get a session back immediately —
  // send them straight into the Discover Your Learning Potential™ entry
  // experience. Projects with it ON return no session here; the user must
  // click the confirmation email first, which the emailRedirectTo above
  // routes to the same destination via /auth/callback.
  if (data.session !== null) {
    redirect(DISCOVERY_ENTRY_PATH)
  }

  redirect('/login?message=check-email')
}
