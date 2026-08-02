import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { listMentorSessions } from '../persistence/listMentorSessions'
import { countMentorConversationTurnsBySession } from '../persistence/countMentorConversationTurnsBySession'
import type { MentorSessionHistoryEntry } from '../types/MentorSessionHistoryEntry'

// AI Mentor™ Sprint-4 — Session History. Composes the two real queries
// above into the one real shape the workspace and Server Action both
// need — real sessions, real turn counts, most recent first (both
// queries already return the same real ownership scope, `learnerId`).
// Reused by both `page.tsx` (initial server-rendered load) and
// `getMentorSessionHistory` (the Server Action), the same "one real
// composer, two real callers" shape `buildMentorSessionContext` already
// established in Sprint-1.
export async function buildMentorSessionHistory(supabase: SupabaseClient<Database>, learnerId: string): Promise<readonly MentorSessionHistoryEntry[]> {
  const [sessions, turnCounts] = await Promise.all([listMentorSessions(supabase, learnerId), countMentorConversationTurnsBySession(supabase, learnerId)])

  return sessions.map((session) => ({
    id: session.id,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    turnCount: turnCounts.get(session.id) ?? 0,
  }))
}
