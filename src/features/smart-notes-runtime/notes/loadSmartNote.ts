import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import type { SmartNote } from './types/SmartNote'

// Smart Notes™ Sprint-2. Real: reads this learner's real, already-saved
// notes for a document back from `smart_notes`. Returns `null`,
// honestly, for a document with no notes saved yet (a real, expected
// case — "load existing" never fabricates a blank note object) rather
// than throwing.
export async function loadSmartNote(supabase: SupabaseClient<Database>, userId: string, documentId: string): Promise<SmartNote | null> {
  const { data, error } = await supabase.from('smart_notes').select('content, updated_at').eq('user_id', userId).eq('document_id', documentId).maybeSingle()

  if (error) {
    logger.error('failed to load smart note', { error: error.message, documentId })
    return null
  }
  if (!data) return null

  return { documentId, content: data.content, updatedAt: data.updated_at }
}
