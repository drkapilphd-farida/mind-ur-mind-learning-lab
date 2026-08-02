import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// Smart Notes™ Sprint-2. Real: upserts this learner's notes for a
// document, keyed by the table's own `UNIQUE (user_id, document_id)`
// constraint — one row per real learner+document pair, never a growing
// history of edits. Returns the real, database-assigned `updated_at` on
// success (never a client-side approximation of "now") so a caller can
// show a genuinely accurate "last saved" moment.
export async function saveSmartNote(supabase: SupabaseClient<Database>, userId: string, documentId: string, content: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('smart_notes')
    .upsert({ user_id: userId, document_id: documentId, content }, { onConflict: 'user_id,document_id' })
    .select('updated_at')
    .single()

  if (error) {
    logger.error('failed to save smart note', { error: error.message, documentId })
    return null
  }

  return data.updated_at
}
