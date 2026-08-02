import { createClient } from '@/lib/supabase/server'

// Sprint-3B — feeds the category rotation index (completedSessionCount % 5).
// Mirrors every other query in this codebase's anonymous-safe pattern:
// an anonymous visitor gets 0, never an error.
export async function getImagePersistenceSessionCount(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { count } = await supabase
    .from('image_persistence_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count ?? 0
}

// Sprint-3B — feeds the "avoid immediate repetition within a category"
// check. Anonymous visitors get an empty list, never an error.
export async function getRecentImagePersistenceImageIds(limit = 5): Promise<readonly string[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('image_persistence_sessions')
    .select('image_used')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((row) => row.image_used)
}
