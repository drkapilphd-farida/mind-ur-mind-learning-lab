import { createClient } from '@/lib/supabase/server'
import type { ImagePersistenceSessionRecord } from '../types/visualPreparationTypes'

// Sprint-7 — a new, standalone getter for image_persistence_sessions
// (Sprint-3B's imagePersistenceQueries.ts only exports a count and a
// recent-ids getter, no full-row getter — adding one there would count as
// modifying Sprint-3B, so this reads the same table from a wholly separate
// file instead). Anonymous-safe: an anonymous visitor gets an empty list,
// never an error, same convention as every other query in this lab.
export async function getImagePersistenceSessionsFull(): Promise<readonly ImagePersistenceSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('image_persistence_sessions')
    .select('duration_seconds, completed, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  return (data ?? []).map((row) => ({
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    occurredAt: row.occurred_at,
  }))
}
