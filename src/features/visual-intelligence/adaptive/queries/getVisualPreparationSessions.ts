import { createClient } from '@/lib/supabase/server'
import type { VisualPreparationSessionRecord } from '../types/visualPreparationTypes'

// Sprint-7 — the first query/getter ever written for
// visual_preparation_sessions (Sprint-4 shipped only a save action and no
// route — this table likely has zero real rows for most learners today,
// but the getter exists so the adaptive engine honestly counts them if any
// exist, and so Sprint-4 shipping a route later needs no engine change).
// Anonymous-safe: an anonymous visitor gets an empty list, never an error.
export async function getVisualPreparationSessions(): Promise<readonly VisualPreparationSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('visual_preparation_sessions')
    .select('duration_seconds, completed, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  return (data ?? []).map((row) => ({
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    occurredAt: row.occurred_at,
  }))
}
