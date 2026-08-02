import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { smartNotesMode } from '@/core/learning-modes/smart-notes'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime'

// Smart Notes™ Sprint-1. Not a new capability — LSE-3's own
// `SessionPersistenceAdapter.listByLearner` (already real, reused via the
// Shared Learning Runtime) already returns every real snapshot for a
// learner, most recent first, scoped to `'smart-notes'` sessions. This is
// a thin filter over it, for the one real question the Smart Notes route
// needs answered before it can show a Resume Banner or start a fresh
// session: "does this learner already have a smart notes session for
// this specific document?" Mirrors Memory Mode™'s own
// `findMemorySessionForDocument.ts`.
export async function findSmartNotesSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, smartNotesMode.capabilities.sessionType)
}
