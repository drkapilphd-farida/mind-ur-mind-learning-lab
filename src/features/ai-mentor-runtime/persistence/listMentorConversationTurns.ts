import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { fromMentorConversationTurnRow } from './mentorConversationTurnRecord'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'

// AI Mentor™ Sprint-2. Real: every real turn for a real, caller-owned
// mentor session, chronological (oldest first) — the real order a
// conversation actually happened in, and the same order the Anthropic
// `messages` array needs.
export async function listMentorConversationTurns(supabase: SupabaseClient<Database>, mentorSessionId: string): Promise<readonly MentorConversationTurn[]> {
  const { data, error } = await supabase.from('mentor_conversation_turns').select().eq('mentor_session_id', mentorSessionId).order('created_at', { ascending: true })

  if (error) {
    logger.error('failed to list mentor conversation turns', { error: error.message, mentorSessionId })
    return []
  }

  return data.map(fromMentorConversationTurnRow)
}
