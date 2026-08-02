import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { findModeSessionForDocument } from '@/features/learning-mode-runtime/actions/findModeSessionForDocument'

// Quantum Speed Reading™ Production Sprint-2, refactored during Memory
// Mode™ Sprint-1's shared-extraction. The real mechanics now live in the
// Shared Learning Runtime's `findModeSessionForDocument`, generalized to
// take an explicit `sessionType` (the underlying adapter no longer
// pre-filters to `'reading'` unconditionally — every caller must now say
// which mode it means). This thin wrapper preserves QSR's own exact
// original 3-argument signature and behavior by pinning `sessionType` to
// `'reading'`, exactly what this function always meant before the
// extraction: "does this learner already have a *reading* session for
// this document?" — never confused with a session of another mode for
// the same document.
export async function findReadingSessionForDocument(supabase: SupabaseClient<Database>, learnerId: string, documentId: string): Promise<SessionSnapshot | null> {
  return findModeSessionForDocument(supabase, learnerId, documentId, 'reading')
}
