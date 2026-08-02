import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { fromMentorSessionRow } from './mentorSessionRecord'
import type { MentorSession } from '../types/MentorSession'

// AI Mentor™ Sprint-1 — Foundation. Real: inserts a new, real
// `mentor_sessions` row — `status` defaults to `'active'` at the
// database level (the same disclosed default convention
// `learning_sessions` already uses).
export async function createMentorSession(supabase: SupabaseClient<Database>, learnerId: string): Promise<MentorSession | null> {
  const { data, error } = await supabase.from('mentor_sessions').insert({ user_id: learnerId }).select().single()

  if (error) {
    logger.error('failed to create mentor session', { error: error.message, learnerId })
    return null
  }

  return fromMentorSessionRow(data)
}
