import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// AI Mentor™ Sprint-4 — Session History. Real: one query for every real
// turn belonging to this learner (scoped by the table's own `user_id`,
// never joined through session ownership separately), grouped in memory
// into a real per-session count — a real, single-query aggregate rather
// than one query per session (no N+1).
export async function countMentorConversationTurnsBySession(supabase: SupabaseClient<Database>, learnerId: string): Promise<ReadonlyMap<string, number>> {
  const { data, error } = await supabase.from('mentor_conversation_turns').select('mentor_session_id').eq('user_id', learnerId)

  if (error) {
    logger.error('failed to count mentor conversation turns by session', { error: error.message, learnerId })
    return new Map()
  }

  const counts = new Map<string, number>()
  for (const row of data) {
    counts.set(row.mentor_session_id, (counts.get(row.mentor_session_id) ?? 0) + 1)
  }
  return counts
}
