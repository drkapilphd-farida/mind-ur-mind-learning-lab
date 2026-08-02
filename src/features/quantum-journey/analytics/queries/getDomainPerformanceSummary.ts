'use server'

import { createClient } from '@/lib/supabase/server'

export type DomainPerformanceSummary = {
  averageAccuracyPercent: number
  sessionCount: number
}

const MIN_SESSIONS_TO_SCORE = 2
const SAMPLE_SIZE = 60

// Brain-Gym Accuracy™ — the real, already-persisted accuracy history
// across the 3 non-reading tracked domains (Intuition, Right Brain,
// Visualisation — see domain_performance_sessions' own migration comment).
// Reading has its own separate source (daily_quantum_sessions) and is
// deliberately excluded here — the same domain split getWeakestDomain
// already relies on. Returns null before there's enough real data to
// honestly score (same MIN_SESSIONS_TO_SCORE floor used elsewhere in this
// feature), never a fabricated placeholder.
export async function getDomainPerformanceSummary(): Promise<DomainPerformanceSummary | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('domain_performance_sessions')
    .select('accuracy_percent')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(SAMPLE_SIZE)

  if (error || data === null || data.length < MIN_SESSIONS_TO_SCORE) return null

  const averageAccuracyPercent = Math.round(data.reduce((sum, row) => sum + row.accuracy_percent, 0) / data.length)
  return { averageAccuracyPercent, sessionCount: data.length }
}
