import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { fromMentorSessionRow } from './mentorSessionRecord'
import type { MentorSession } from '../types/MentorSession'

// AI Mentor™ Sprint-1 — Foundation. Real: the one real question the
// route needs answered before it can decide whether to offer "Start" or
// "Continue" — does this learner already have a real, active mentor
// session? Most recent first, `maybeSingle` since a learner may have
// zero.
export async function findActiveMentorSession(supabase: SupabaseClient<Database>, learnerId: string): Promise<MentorSession | null> {
  const { data, error } = await supabase.from('mentor_sessions').select().eq('user_id', learnerId).eq('status', 'active').order('started_at', { ascending: false }).limit(1).maybeSingle()

  if (error) {
    logger.error('failed to find active mentor session', { error: error.message, learnerId })
    return null
  }
  if (!data) return null

  return fromMentorSessionRow(data)
}
