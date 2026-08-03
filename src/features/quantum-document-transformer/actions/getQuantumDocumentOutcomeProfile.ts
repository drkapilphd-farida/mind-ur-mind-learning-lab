'use server'

import { createClient } from '@/lib/supabase/server'

export type QuantumDocumentOutcomeProfile = {
  attemptsCount: number
  bestScorePercent: number | null
  latestScorePercent: number | null
  latestAttemptedAt: string | null
}

const EMPTY_PROFILE: QuantumDocumentOutcomeProfile = {
  attemptsCount: 0,
  bestScorePercent: null,
  latestScorePercent: null,
  latestAttemptedAt: null,
}

// Document Outcome Profile™ — per-document mastery, not the global
// cross-document streak/XP tracking getQuantumDocumentSessionHistory.ts
// already covers. quantum_document_sessions has always had a
// quantum_document_id FK (see saveQuantumDocumentSession.ts); this is the
// first query to actually filter on it, so a learner (or, viewing the
// same page, a parent) can see exactly how this one document went rather
// than an all-documents blend.
export async function getQuantumDocumentOutcomeProfile(quantumDocumentId: string): Promise<QuantumDocumentOutcomeProfile> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return EMPTY_PROFILE

  const { data, error } = await supabase
    .from('quantum_document_sessions')
    .select('correct_answers_count, total_questions_count, occurred_at')
    .eq('user_id', user.id)
    .eq('quantum_document_id', quantumDocumentId)
    .order('occurred_at', { ascending: false })

  if (error || !data || data.length === 0) return EMPTY_PROFILE

  const scores = data.map((row) => Math.round((row.correct_answers_count / row.total_questions_count) * 100))
  const latestRow = data[0]

  return {
    attemptsCount: data.length,
    bestScorePercent: Math.max(...scores),
    latestScorePercent: scores[0] ?? null,
    latestAttemptedAt: latestRow?.occurred_at ?? null,
  }
}
