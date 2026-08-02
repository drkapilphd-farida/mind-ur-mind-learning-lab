import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { Json } from '@/lib/supabase/types'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved from Quantum Speed Reading™'s own
// `persistence/sessionSnapshotRecord.ts` (Sprint-1) — the concrete
// `SessionPersistenceAdapter` record shape, matching the already-existing
// `learning_sessions` table (ADR 0001, `supabase/migrations/
// 20260711000003_create_learning_sessions.sql`) — reused as-is, no new
// migration needed for session persistence.
//
// Generalized during Memory Mode™ Sprint-1's extraction: `session_type`
// was a hardcoded `'reading'` literal (both in the type and in
// `toSessionRecord`'s return value), since this file previously only
// ever served Quantum Speed Reading™. Widened then to the table's own
// real CHECK-constraint union so any Learning Mode's snapshot round-trips
// through its own real `session_type`, derived from `snapshot.sessionType`
// rather than assumed. For QSR, `snapshot.sessionType` is always
// `'reading'` in practice, so that was behavior-preserving for every
// existing QSR row and caller. `'practice'` (LSE-1's own `SessionType`)
// remains intentionally excluded — the table's CHECK constraint does not
// include it; that gap predates this file and is not this file's to fix.
//
// Smart Notes™ Sprint-1 amendment: `'smart-notes'` added, matching the
// table's own widened CHECK constraint
// (20260718000001_widen_learning_sessions_smart_notes.sql) and the ULO's
// own widened `SessionType`. Required so this type stays an honest
// description of what the database actually accepts — without it,
// `toSessionRecord`'s existing `as LearningSessionRecord['session_type']`
// cast would silently paper over a real, now-possible value the type
// claimed didn't exist. QSR's and Memory's own existing rows/behavior are
// unaffected — this is strictly additive.
//
// AI Learning Studio™ Sprint ALS-16 amendment: `'focus'` added, matching
// the table's own widened CHECK constraint
// (20260722000001_widen_learning_sessions_focus.sql).
//
// AI Learning Studio™ Sprint ALS-17 amendment: `'mcqs'` added, matching
// the table's own widened CHECK constraint
// (20260723000001_widen_learning_sessions_mcqs.sql). `'revision'` needed
// no amendment — it was already here from the very start.
export type LearningSessionRecord = {
  id: string
  user_id: string
  learning_project_id: string | null
  session_type: 'reading' | 'memory' | 'revision' | 'research' | 'smart-notes' | 'focus' | 'mcqs'
  status: 'in_progress' | 'completed' | 'abandoned'
  data: Json
  started_at: string
  completed_at: string | null
}

// Real, disclosed, lossy-in-one-direction reshape: `learning_sessions.
// status` is ADR 0001's own 3-value CHECK constraint
// ('in_progress' | 'completed' | 'abandoned'), predating and independent
// of LSE-1's real 5-value `SessionStatus`. `not-started`/`active`/
// `paused` all genuinely are, from the database's coarser point of view,
// "a session still underway" — mapped to `in_progress`, never assumed to
// be the same enum as LSE-1's own.
function toDbStatus(status: SessionSnapshot['status']): LearningSessionRecord['status'] {
  switch (status) {
    case 'completed':
      return 'completed'
    case 'cancelled':
      return 'abandoned'
    default:
      return 'in_progress'
  }
}

export function toSessionRecord(snapshot: SessionSnapshot, learningProjectId: string | null = null): LearningSessionRecord {
  return {
    id: snapshot.sessionId,
    user_id: snapshot.learnerId,
    learning_project_id: learningProjectId,
    session_type: snapshot.sessionType as LearningSessionRecord['session_type'],
    status: toDbStatus(snapshot.status),
    data: snapshot as unknown as Json,
    started_at: snapshot.startedAt ?? snapshot.capturedAt,
    completed_at: snapshot.completedAt,
  }
}

// Real, minimal shape check — the same "our own system wrote this, catch
// genuine corruption honestly, don't re-derive UCE/LSE's own construction
// guarantees" discipline as uloRecord.ts.
export function fromSessionRecord(data: Json): SessionSnapshot | null {
  if (!isSessionSnapshotShaped(data)) return null
  return data as unknown as SessionSnapshot
}

function isSessionSnapshotShaped(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.runtimeId === 'string' && typeof candidate.sessionId === 'string' && typeof candidate.uloId === 'string' && typeof candidate.status === 'string' && typeof candidate.metrics === 'object'
}
