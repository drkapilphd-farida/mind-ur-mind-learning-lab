import { createClient } from '@/lib/supabase/server'
import type { FixationExerciseType, FixationSessionRecord } from '../fixationTypes'

// Anonymous-safe: an anonymous visitor gets an empty list, never an error —
// mirrors getPracticeSessions.ts/imagePersistenceQueries.ts.
export async function getFixationSessions(): Promise<readonly FixationSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('fixation_sessions')
    .select('exercise_type, level, duration_seconds, completed, accuracy_percent, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  return (data ?? []).map((row) => ({
    exerciseType: row.exercise_type as FixationExerciseType,
    level: row.level,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    accuracyPercent: row.accuracy_percent,
    occurredAt: row.occurred_at,
  }))
}
