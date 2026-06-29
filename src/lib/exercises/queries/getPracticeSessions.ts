import { createClient } from '@/lib/supabase/server'
import type { LabId } from '../types'

export type PracticeSessionRecord = {
  exerciseId: string
  durationMs: number
  completed: boolean
  occurredAt: string
}

// Raw history rows for one Lab, most recent first. No user (these routes
// don't require sign-in) means no history exists yet — same convention as
// getModuleProgress.
export async function getPracticeSessions(labId: LabId, limit = 200): Promise<PracticeSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: rows } = await supabase
    .from('practice_sessions')
    .select('exercise_id, duration_ms, completed, occurred_at')
    .eq('user_id', user.id)
    .eq('lab_id', labId)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (!rows) {
    return []
  }

  return rows.map((row) => ({
    exerciseId: row.exercise_id,
    durationMs: row.duration_ms,
    completed: row.completed,
    occurredAt: row.occurred_at,
  }))
}
