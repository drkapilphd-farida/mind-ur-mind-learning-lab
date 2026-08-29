'use server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'
import { AppLoginVerifyOtpSchema, type AuthActionResult } from '../types'

// Quantum Mind App™ login, step 2 — verifying the code creates the real
// Supabase session. Immediately after, signOut({ scope: 'others' })
// invalidates every OTHER refresh token for this account (Supabase's own
// built-in single-active-session primitive — see its docs on
// auth.signOut scopes) while leaving the session just created intact.
// This is what actually enforces "one device at a time": the previous
// device's refresh token stops working the next time it needs to renew
// its (short-lived) access token, which is within the hour by default —
// not an instant kill of an already-issued access token, since that
// token is a self-contained JWT nothing server-side can revoke early.
// That's Supabase's real, documented behavior for this feature, not a
// limitation of this implementation.
const VERIFY_OTP_RATE_LIMIT = { max: 10, windowMs: 60_000 }

export async function verifyAppLoginEmailOtp(input: unknown): Promise<AuthActionResult> {
  const parsed = AppLoginVerifyOtpSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Enter the 6-digit code sent to your email.' }
  }

  const clientIp = await getClientIp()
  if (!checkRateLimit(`app-otp-verify:${clientIp}`, VERIFY_OTP_RATE_LIMIT).allowed) {
    return { success: false, error: 'Too many attempts. Please wait a moment and try again.' }
  }

  const supabase = await createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: 'email',
  })

  if (verifyError) {
    return { success: false, error: 'That code is incorrect or expired.' }
  }

  const { error: signOutOthersError } = await supabase.auth.signOut({ scope: 'others' })
  if (signOutOthersError) {
    // Non-fatal to the login itself — the new session is real and valid
    // either way, so this is logged, not surfaced as a login failure.
    logger.warn('[verifyAppLoginEmailOtp] failed to invalidate other sessions', { error: signOutOthersError.message })
  }

  return { success: true }
}
