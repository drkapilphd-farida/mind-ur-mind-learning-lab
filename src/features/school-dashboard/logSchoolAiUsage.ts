import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

// Best-effort AI-usage attribution for the Quantum Document Transformer
// — called from the transform route's own success path. Never blocks or
// fails the request it's called from: a user who isn't part of any
// school (the common case) simply has nothing to log, and a logging
// failure is swallowed — a lost usage-count row is not worth failing an
// otherwise-successful document transformation over. Logging only, no
// enforcement: this never blocks the transform itself based on quota.
export async function logSchoolAiUsage(userId: string, quantumDocumentId: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: memberRow } = await supabase.from('school_members').select('school_id').eq('user_id', userId).eq('status', 'active').maybeSingle()

  if (!memberRow) {
    return
  }

  const { error } = await supabase.from('school_ai_usage_log').insert({
    school_id: memberRow.school_id,
    user_id: userId,
    quantum_document_id: quantumDocumentId,
  })

  if (error) {
    logger.warn('[school-dashboard] logSchoolAiUsage — insert FAIL', { userId, quantumDocumentId, error: error.message })
  }
}
