'use server'

import { createClient } from '@/lib/supabase/server'
import { isSupportedLanguage, DEFAULT_LANGUAGE, type SupportedLanguage } from '../supportedLanguages'

export type QuantumDocumentHistoryItem = {
  id: string
  title: string
  aiSummary: string | null
  targetLanguage: SupportedLanguage
  createdAt: string
}

// Document History & Library — a deliberately light list query: only what
// the sidebar needs to render one row per document (title, a one-line
// summary, language, date). The heavy fields (raw_text, spider_notes,
// quiz_questions, mnemonics, subject_lens, reading_text) are only ever
// fetched for the one document a learner actually clicks, via
// getQuantumDocumentById — never pulled in bulk just to populate a list.
export async function getQuantumDocumentHistory(): Promise<readonly QuantumDocumentHistoryItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('quantum_documents')
    .select('id, title, ai_summary, target_language, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    aiSummary: row.ai_summary,
    targetLanguage: isSupportedLanguage(row.target_language) ? row.target_language : DEFAULT_LANGUAGE,
    createdAt: row.created_at,
  }))
}
