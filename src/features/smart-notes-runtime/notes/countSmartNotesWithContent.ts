import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Real: counts this
// learner's real `smart_notes` rows with genuinely non-empty content —
// a structural fact (how many documents have *something* saved), never
// a reading or judgment of what was written. Purely-whitespace content is
// not distinguished from real content — a real, disclosed, minor
// simplification, not worth a raw-SQL trim filter for this sprint.
export async function countSmartNotesWithContent(supabase: SupabaseClient<Database>, userId: string): Promise<number> {
  const { count, error } = await supabase.from('smart_notes').select('id', { count: 'exact', head: true }).eq('user_id', userId).neq('content', '')

  if (error) {
    logger.error('failed to count smart notes with content', { error: error.message, userId })
    return 0
  }

  return count ?? 0
}
