import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { focusLearningMode } from '@/core/learning-modes/focus-mode'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime'

// Focus Mode™ (Mini) Sprint ALS-16. Not a new capability — LSE-3's own
// `SessionPersistenceAdapter.listByLearner` (already real, reused via the
// Shared Learning Runtime) already returns every real snapshot for a
// learner, most recent first, scoped to `'focus'` sessions. Mirrors Memory
// Mode™'s own `findMemorySessionForDocument.ts`.
export async function findFocusSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, focusLearningMode.capabilities.sessionType)
}
