import { createClient } from '@/lib/supabase/server'
import type { PersistenceChallengeSessionRecord, ReflectionResponse } from '../persistenceChallengeTypes'

// Anonymous-safe: an anonymous visitor gets an empty list, never an error —
// mirrors getFixationSessions.ts/imagePersistenceQueries.ts.
export async function getPersistenceChallengeSessions(): Promise<readonly PersistenceChallengeSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('persistence_challenge_sessions')
    .select('image_id, reflection_response, journal_notes, duration_seconds, completed, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  return (data ?? []).map((row) => ({
    imageId: row.image_id,
    reflectionResponse: row.reflection_response as ReflectionResponse,
    journalNotes: row.journal_notes,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    occurredAt: row.occurred_at,
  }))
}

// Anonymous-safe count, used to pick the next rotated challenge image.
export async function getPersistenceChallengeSessionCount(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { count } = await supabase
    .from('persistence_challenge_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count ?? 0
}
