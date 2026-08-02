import type { Database } from '@/lib/supabase/types'
import type { MentorSession } from '../types/MentorSession'

// AI Mentor™ Sprint-1 — Foundation. Real mapping between the
// `mentor_sessions` table row shape and this feature's own real
// `MentorSession` type — the same "real record ↔ real domain type"
// mapping convention every other persistence file in this codebase
// already follows (`sessionSnapshotRecord.ts`, `uloRecord.ts`).
type MentorSessionRow = Database['public']['Tables']['mentor_sessions']['Row']

export function fromMentorSessionRow(row: MentorSessionRow): MentorSession {
  return {
    id: row.id,
    learnerId: row.user_id,
    status: row.status === 'ended' ? 'ended' : 'active',
    startedAt: row.started_at,
    endedAt: row.ended_at,
  }
}
