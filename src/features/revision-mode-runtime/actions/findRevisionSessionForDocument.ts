import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { revisionLearningMode } from '@/core/learning-modes/revision-mode'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Not a new capability — LSE-3's own
// `SessionPersistenceAdapter.listByLearner` (already real, reused via the
// Shared Learning Runtime) already returns every real snapshot for a
// learner, most recent first, scoped to `'revision'` sessions. Mirrors
// Memory Mode™'s own `findMemorySessionForDocument.ts`.
export async function findRevisionSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, revisionLearningMode.capabilities.sessionType)
}
