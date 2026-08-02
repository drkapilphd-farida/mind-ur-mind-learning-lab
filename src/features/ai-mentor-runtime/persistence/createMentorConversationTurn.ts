import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { fromMentorConversationTurnRow } from './mentorConversationTurnRecord'
import type { MentorConversationTurn, MentorConversationTurnRole } from '../types/MentorConversationTurn'

// AI Mentor™ Sprint-2. Real: inserts one real, append-only conversation
// turn — used for both the learner's real message and the mentor's real
// reply, the same real table, distinguished only by `role`.
export async function createMentorConversationTurn(
  supabase: SupabaseClient<Database>,
  learnerId: string,
  mentorSessionId: string,
  role: MentorConversationTurnRole,
  content: string,
): Promise<MentorConversationTurn | null> {
  const { data, error } = await supabase.from('mentor_conversation_turns').insert({ user_id: learnerId, mentor_session_id: mentorSessionId, role, content }).select().single()

  if (error) {
    logger.error('failed to create mentor conversation turn', { error: error.message, mentorSessionId, role })
    return null
  }

  return fromMentorConversationTurnRow(data)
}
