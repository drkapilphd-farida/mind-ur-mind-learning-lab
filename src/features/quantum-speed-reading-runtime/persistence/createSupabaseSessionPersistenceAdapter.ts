import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionPersistenceAdapter } from '@/core/learning-session-runtime'
import { createSupabaseSessionPersistenceAdapter as createSharedSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime/persistence/createSupabaseSessionPersistenceAdapter'

// Quantum Speed Reading™ Production Sprint-1, refactored during Memory
// Mode™ Sprint-1's shared-extraction. The real implementation (including
// the `SessionPersistenceAdapter` construction logic) now lives in the
// Shared Learning Runtime (`src/features/learning-mode-runtime/`),
// generalized to take an explicit `sessionType` so it can serve any
// Learning Mode. This thin wrapper preserves QSR's own exact original
// 2-argument signature — every existing QSR call site keeps working
// unchanged — by pinning `sessionType` to `'reading'`, exactly what this
// function always meant before the extraction.
export function createSupabaseSessionPersistenceAdapter(supabase: SupabaseClient<Database>, scopedLearnerId: string): SessionPersistenceAdapter {
  return createSharedSupabaseSessionPersistenceAdapter(supabase, scopedLearnerId, 'reading')
}
