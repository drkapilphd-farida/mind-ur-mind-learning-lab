'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type JoinLiveMasterclassWaitlistResult = { success: true } | { success: false; error: string }

// Live Masterclass™ waitlist — a real, honest interest signal for Dr.
// Kapil Dev Sharma's live QSR batches (documented product philosophy,
// not a scheduled event today — see the migration's own comment). Never
// promises a date; just records that this user wants to be notified.
// UNIQUE(user_id) at the DB level makes a repeat join a harmless no-op
// (23505), reported back as success so the UI can show "You're on the
// list" either way.
export async function joinLiveMasterclassWaitlist(): Promise<JoinLiveMasterclassWaitlistResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to join the waitlist.' }
  }

  const { error } = await supabase.from('live_masterclass_waitlist').insert({ user_id: user.id })

  if (error && error.code !== '23505') {
    logger.warn('failed to join live masterclass waitlist', { error: error.message })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
