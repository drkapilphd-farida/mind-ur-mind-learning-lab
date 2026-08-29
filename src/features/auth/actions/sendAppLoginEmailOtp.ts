'use server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { AppLoginEmailSchema, type AuthActionResult } from '../types'

// Quantum Mind App™ login, step 1 — email OTP via Supabase's built-in
// signInWithOtp({ email }), which sends a 6-digit code through Supabase's
// own email sending (or your configured SMTP), at no per-login cost.
// Deliberately not phone/SMS — see types.ts's AppLoginEmailSchema comment.
const SEND_OTP_RATE_LIMIT = { max: 5, windowMs: 60_000 }

export async function sendAppLoginEmailOtp(input: unknown): Promise<AuthActionResult> {
  const parsed = AppLoginEmailSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Enter a valid email address.' }
  }

  const clientIp = await getClientIp()
  if (!checkRateLimit(`app-otp-send:${clientIp}`, SEND_OTP_RATE_LIMIT).allowed) {
    return { success: false, error: 'Too many attempts. Please wait a moment and try again.' }
  }

  const supabase = await createClient()
  // shouldCreateUser: true — the Quantum Mind App is meant to be
  // self-serve: a first-time email creates the account on the spot,
  // same as the marketing site's normal sign-up would, just without a
  // password step.
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
