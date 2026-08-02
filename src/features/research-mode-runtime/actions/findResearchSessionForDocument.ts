import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { researchLearningMode } from '@/core/learning-modes/research-mode'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Not a new
// capability — LSE-3's own `SessionPersistenceAdapter.listByLearner`
// (already real, reused via the Shared Learning Runtime) already returns
// every real snapshot for a learner, most recent first, scoped to
// `'research'` sessions. Mirrors Revision Mode™'s own
// `findRevisionSessionForDocument.ts`.
export async function findResearchSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, researchLearningMode.capabilities.sessionType)
}
