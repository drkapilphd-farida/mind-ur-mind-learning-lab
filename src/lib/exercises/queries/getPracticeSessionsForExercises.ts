import { createClient } from '@/lib/supabase/server'
import type { LabId } from '../types'
import type { PracticeSessionRecord } from './getPracticeSessions'

// Sprint 3.3A — same shape/auth-resolution as getPracticeSessions, but
// filtered server-side to a specific set of exercise ids (that function has
// no exercise_id filter at all, only labId) — needed by the Reading Hub to
// query just the Master Reading Engine modes without over-fetching the
// whole lab's history and filtering in memory.
export async function getPracticeSessionsForExercises(
  labId: LabId,
  exerciseIds: readonly string[],
  limit = 200,
): Promise<PracticeSessionRecord[]> {
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
    .in('exercise_id', exerciseIds)
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
