import type { Database } from '@/lib/supabase/types'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'

// AI Mentor™ Sprint-2. Real mapping between the
// `mentor_conversation_turns` row shape and this feature's own real
// `MentorConversationTurn` type — the same "real record ↔ real domain
// type" convention every persistence file in this codebase follows.
type MentorConversationTurnRow = Database['public']['Tables']['mentor_conversation_turns']['Row']

export function fromMentorConversationTurnRow(row: MentorConversationTurnRow): MentorConversationTurn {
  return {
    id: row.id,
    mentorSessionId: row.mentor_session_id,
    role: row.role === 'mentor' ? 'mentor' : 'learner',
    content: row.content,
    createdAt: row.created_at,
  }
}
