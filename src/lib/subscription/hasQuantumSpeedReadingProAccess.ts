import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from './getIsPaidUser'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'

// Quantum Speed Reading Paywall™ — the one real, server-side check behind
// every gate in this file's callers (exercise pages, stage hub pages, the
// 21-Day Journey day pages). Visual Activation™ (a separate lab/labId,
// 'visual-intelligence') is never gated by this — only Reading
// Preparation™, Core Reading Journey™, Reading Intelligence™, and the
// 21-Day Journey's Day 4+ sessions require it. An anonymous (logged-out)
// visitor is treated as free/unpaid, same as `getIsPaidUser` already does
// for a real signed-in free user — never a special case that's easier to
// bypass than being logged in and free.
export async function hasQuantumSpeedReadingProAccess(): Promise<boolean> {
  if (isDevUnlockEnabled()) return true

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  return getIsPaidUser(user.id)
}
