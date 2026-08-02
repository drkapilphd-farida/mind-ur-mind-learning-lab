'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignUpSchema } from '../types'

const ONBOARDING_ENTRY_PATH = '/welcome/choose-method'

export async function signUp(
  input: unknown,
  next: string = ONBOARDING_ENTRY_PATH,
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
      // encodeURIComponent is load-bearing, not defensive — `next` can be
      // e.g. "/dashboard#upload-document" (the Gateway Auth Modal's Upload
      // & Learn destination), and an un-encoded `#` would be parsed as this
      // URL's OWN fragment rather than part of the `next` query value,
      // silently truncating it before /auth/callback ever sees it.
      emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Projects with email confirmation OFF get a session back immediately —
  // send them straight to `next` (defaults to Choose Your Path™, but a
  // caller like the Gateway Auth Modal can pass the exact onboarding
  // destination the user originally clicked). Projects with it ON return
  // no session here; the user must click the confirmation email first,
  // which the emailRedirectTo above routes to the same destination via
  // /auth/callback.
  if (data.session !== null) {
    redirect(next)
  }

  redirect('/login?message=check-email')
}
