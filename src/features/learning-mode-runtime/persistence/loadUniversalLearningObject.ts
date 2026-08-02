import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { logger } from '@/lib/logger'
import { fromUniversalLearningObjectRecord } from './uloRecord'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own
// `persistence/loadUniversalLearningObject.ts` (Sprint-1) — the Learning
// Mode Loader. Real: reads the already-built ULO back from
// `universal_learning_objects` — never re-runs UCE-1…6, never makes a new
// AI call, never re-parses the source document. Returns `null`,
// honestly, for a document with no ULO built yet (a real, expected case
// — "load an existing" never fabricates one) rather than throwing.
// Already fully mode-agnostic — every Learning Mode loads the same ULO.
export async function loadUniversalLearningObject(supabase: SupabaseClient<Database>, documentId: string): Promise<UniversalLearningObject | null> {
  const { data, error } = await supabase.from('universal_learning_objects').select('data').eq('document_id', documentId).maybeSingle()

  if (error) {
    logger.error('failed to load universal learning object', { error: error.message, documentId })
    return null
  }
  if (!data) return null

  const ulo = fromUniversalLearningObjectRecord(data.data)
  if (!ulo) {
    logger.error('stored universal learning object row is not shaped like a real ULO', { documentId })
    return null
  }

  return ulo
}
