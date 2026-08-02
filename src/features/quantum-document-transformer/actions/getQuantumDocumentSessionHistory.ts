'use server'

import { createClient } from '@/lib/supabase/server'

export type QuantumDocumentSessionRecord = {
  xpEarned: number
  correctAnswersCount: number
  totalQuestionsCount: number
  occurredAt: string
}

const DEFAULT_HISTORY_LIMIT = 30

// Reads the signed-in user's own Quantum Document session history, most
// recent first. An anonymous visitor (or a fetch error) gets an empty
// history rather than an error — there is nothing to show yet, not a
// failure.
export async function getQuantumDocumentSessionHistory(limit: number = DEFAULT_HISTORY_LIMIT): Promise<readonly QuantumDocumentSessionRecord[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('quantum_document_sessions')
    .select('xp_earned, correct_answers_count, total_questions_count, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (error || data === null) return []

  return data.map((row) => ({
    xpEarned: row.xp_earned,
    correctAnswersCount: row.correct_answers_count,
    totalQuestionsCount: row.total_questions_count,
    occurredAt: row.occurred_at,
  }))
}
