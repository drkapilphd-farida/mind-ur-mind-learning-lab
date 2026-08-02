import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { fromMentorSessionRow } from './mentorSessionRecord'
import type { MentorSession } from '../types/MentorSession'

// AI Mentor™ Sprint-1 — Foundation. Real: marks a real, already-existing
// mentor session as ended, scoped to its real owner (`user_id`) so one
// learner can never end another's session. Returns `null`, honestly,
// if no matching row was found or updated — never a silent no-op
// mistaken for success.
export async function endMentorSession(supabase: SupabaseClient<Database>, learnerId: string, sessionId: string): Promise<MentorSession | null> {
  const { data, error } = await supabase.from('mentor_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId).eq('user_id', learnerId).select().maybeSingle()

  if (error) {
    logger.error('failed to end mentor session', { error: error.message, sessionId, learnerId })
    return null
  }
  if (!data) return null

  return fromMentorSessionRow(data)
}
