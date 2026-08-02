import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { SessionType } from '@/core/universal-learning-engine/universal-learning-object'
import { createSupabaseSessionPersistenceAdapter } from '../persistence/createSupabaseSessionPersistenceAdapter'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved and renamed from Quantum Speed Reading™'s own
// `actions/findReadingSessionForDocument.ts` (Sprint-2) — "Smart Resume":
// does a learner already have a session, of a given mode, for this
// document? `sessionType` is now an explicit parameter (the underlying
// adapter used to pre-filter to `'reading'` unconditionally; now the
// caller states which mode it's asking about, and the adapter's own
// `listByLearner` filters accordingly) — a document can genuinely have
// both a reading session and a memory session for the same learner, and
// this must never confuse one for the other.
export async function findModeSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string, sessionType: SessionType): Promise<SessionSnapshot | null> {
  const persistence = createSupabaseSessionPersistenceAdapter(supabase, learnerId, sessionType)
  const snapshots = await persistence.listByLearner(learnerId)
  return snapshots.find((snapshot) => snapshot.documentId === documentId) ?? null
}
