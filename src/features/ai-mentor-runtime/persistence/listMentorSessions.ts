import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { fromMentorSessionRow } from './mentorSessionRecord'
import type { MentorSession } from '../types/MentorSession'

// AI Mentor™ Sprint-4 — Session History. Real: every real mentor session
// (active or ended) for a learner, most recent first — the same
// "listByLearner" shape every other Learning Mode's own persistence
// adapter already provides, applied here to AI Mentor's own dedicated
// `mentor_sessions` table rather than the chunk-based
// `SessionPersistenceAdapter` (which AI Mentor doesn't use — see Sprint-1's
// own architectural finding).
export async function listMentorSessions(supabase: SupabaseClient<Database>, learnerId: string): Promise<readonly MentorSession[]> {
  const { data, error } = await supabase.from('mentor_sessions').select().eq('user_id', learnerId).order('started_at', { ascending: false })

  if (error) {
    logger.error('failed to list mentor sessions', { error: error.message, learnerId })
    return []
  }

  return data.map(fromMentorSessionRow)
}
