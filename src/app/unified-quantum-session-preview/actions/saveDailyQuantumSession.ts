'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { DailyQuantumSessionInputSchema } from './dailyQuantumSessionSchema'

export type SaveDailyQuantumSessionResult = { success: true } | { success: false; error: string }

// Persists one summary row for a completed FULL 4-step Daily Quantum
// Session — never for a single-phase "Practice Again" replay (that still
// logs its own practice_sessions attempt for personal-best tracking, via
// the calling component's own distinct exerciseId, but does not belong
// here). Anonymous visitors: a silent no-op returning success, matching
// savePracticeSession's existing posture for this same situation.
export async function saveDailyQuantumSession(input: unknown): Promise<SaveDailyQuantumSessionResult> {
  const parsed = DailyQuantumSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('daily quantum session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: true }
  }

  const { readingWpm, accuracyPercent, readingScore, xpEarned } = parsed.data

  const { error } = await supabase.from('daily_quantum_sessions').insert({
    user_id: user.id,
    reading_wpm: readingWpm,
    accuracy_percent: accuracyPercent,
    reading_score: readingScore,
    xp_earned: xpEarned,
  })

  if (error) {
    logger.warn('failed to save daily quantum session', { error: error.message })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
