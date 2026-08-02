'use server'

import { createClient } from '@/lib/supabase/server'

export type DailyQuantumSessionRecord = {
  readingWpm: number
  accuracyPercent: number
  readingScore: number
  xpEarned: number
  occurredAt: string
}

const DEFAULT_HISTORY_LIMIT = 30

// Reads the signed-in user's own Daily Quantum Session history, most
// recent first. An anonymous visitor (or a fetch error) gets an empty
// history rather than an error — there is nothing to show yet, not a
// failure.
export async function getDailyQuantumSessionHistory(limit: number = DEFAULT_HISTORY_LIMIT): Promise<readonly DailyQuantumSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('daily_quantum_sessions')
    .select('reading_wpm, accuracy_percent, reading_score, xp_earned, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (error || data === null) return []

  return data.map((row) => ({
    readingWpm: row.reading_wpm,
    accuracyPercent: row.accuracy_percent,
    readingScore: row.reading_score,
    xpEarned: row.xp_earned,
    occurredAt: row.occurred_at,
  }))
}
