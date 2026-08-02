'use server'

import { createClient } from '@/lib/supabase/server'
import { computeReadingStreak } from '../presentation/computeReadingStreak'

export type GetReadingStreakResult = { success: true; streak: number } | { success: false; error: string }

// Quantum Speed Reading Hub Experience™ (Sprint-1) — Current Streak's own
// real read path. Unlike `getReadingSpeedHistory` (scoped to one
// document, for Speed Ladder), this reads every real completion
// timestamp this learner has ever recorded across every document — a
// reading streak is honestly about the learner's own consistency, not
// one chapter — and reduces it with the same real, pure
// `computeReadingStreak` every test exercises directly.
export async function getReadingStreak(): Promise<GetReadingStreakResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { data, error } = await supabase.from('qsr_reading_speed_samples').select('recorded_at').eq('user_id', user.id).order('recorded_at', { ascending: false })

  if (error) return { success: false, error: 'Failed to load your reading streak.' }

  return { success: true, streak: computeReadingStreak((data ?? []).map((row) => row.recorded_at)) }
}
