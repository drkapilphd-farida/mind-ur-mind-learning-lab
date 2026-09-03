'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { computeDigitalDetoxStreak } from '../computeDigitalDetoxStreak'

const STREAK_HISTORY_LIMIT = 60

export type SaveDigitalDetoxCheckinResult = { success: true; streak: number } | { success: false; error: string }

// Digital Detox Check-in™ — one real row per answer, RLS-scoped to the
// signed-in user (same createClient()/auth.getUser() pattern every other
// journey Server Action in this feature already uses). Returns the
// resulting streak computed fresh from real rows right after the insert,
// so the check-in UI can show "3-day streak" immediately without a
// second round-trip.
export async function saveDigitalDetoxCheckin(keptPhoneAway: boolean): Promise<SaveDigitalDetoxCheckinResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not signed in.' }
  }

  const { error: insertError } = await supabase.from('digital_detox_checkins').insert({
    user_id: user.id,
    kept_phone_away: keptPhoneAway,
  })

  if (insertError) {
    logger.warn('[digital-detox] failed to save check-in', { error: insertError.message })
    return { success: false, error: 'Could not save your check-in.' }
  }

  const { data: history } = await supabase
    .from('digital_detox_checkins')
    .select('kept_phone_away, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(STREAK_HISTORY_LIMIT)

  const streak = computeDigitalDetoxStreak(
    (history ?? []).map((row) => ({ keptPhoneAway: row.kept_phone_away, occurredAt: row.occurred_at })),
  )

  return { success: true, streak }
}
