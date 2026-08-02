import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { logger } from '@/lib/logger'
import { toUniversalLearningObjectRecord } from './uloRecord'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own
// `persistence/saveUniversalLearningObject.ts` (Sprint-1) — persists an
// already-built ULO (real output of UCE-1…6, built elsewhere) so the
// Learning Mode Loader has something real to load. Never builds a ULO
// itself — this is persistence only, not a new pipeline. One row per
// document (`document_id` unique) — a re-aggregation replaces the row in
// place. Already fully mode-agnostic.
export async function saveUniversalLearningObject(supabase: SupabaseClient<Database>, ulo: UniversalLearningObject): Promise<boolean> {
  const record = toUniversalLearningObjectRecord(ulo)
  const { error } = await supabase.from('universal_learning_objects').upsert(record, { onConflict: 'document_id' })

  if (error) {
    logger.error('failed to save universal learning object', { error: error.message, documentId: ulo.documentId })
    return false
  }

  return true
}
