'use server'

import { hasQuantumSpeedReadingProAccess } from '@/lib/subscription/hasQuantumSpeedReadingProAccess'

export type AppAccessResult =
  | { status: 'unpaid' }
  | { status: 'granted' }

// Called once, immediately after a successful login (see
// verifyAppLoginEmailOtp.ts). Single-device enforcement is no longer
// checked here — it's handled at login time via
// supabase.auth.signOut({ scope: 'others' }), Supabase's own real
// session-invalidation primitive. This action now only re-checks the
// real paywall: hasQuantumSpeedReadingProAccess() (which now also
// covers the 60-day free window — see getIsPaidUser.ts), reused rather
// than duplicated so this stays in sync with every other paid gate in
// the app.
export async function checkAppAccess(): Promise<AppAccessResult> {
  const hasAccess = await hasQuantumSpeedReadingProAccess()
  return hasAccess ? { status: 'granted' } : { status: 'unpaid' }
}
