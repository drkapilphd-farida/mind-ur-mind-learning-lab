import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime'

// Memory Mode™ Sprint-1. Not a new capability — LSE-3's own
// `SessionPersistenceAdapter.listByLearner` (already real, reused via the
// Shared Learning Runtime) already returns every real snapshot for a
// learner, most recent first, scoped to `'memory'` sessions. This is a
// thin filter over it, for the one real question a future Memory
// workspace will need answered before it can show a Resume Banner or
// start a fresh session: "does this learner already have a memory
// session for this specific document?" Mirrors Quantum Speed Reading™'s
// own `findReadingSessionForDocument.ts`.
export async function findMemorySessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, memoryLearningMode.capabilities.sessionType)
}
