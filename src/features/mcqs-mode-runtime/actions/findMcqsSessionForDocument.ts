import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { mcqsLearningMode } from '@/core/learning-modes/mcqs-mode'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime'

// MCQs™ Sprint ALS-17. Not a new capability — LSE-3's own
// `SessionPersistenceAdapter.listByLearner` (already real, reused via the
// Shared Learning Runtime) already returns every real snapshot for a
// learner, most recent first, scoped to `'mcqs'` sessions. Mirrors Focus
// Mode™'s own `findFocusSessionForDocument.ts`.
export async function findMcqsSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, mcqsLearningMode.capabilities.sessionType)
}
