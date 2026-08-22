'use server'

import { createClient } from '@/lib/supabase/server'
import { computeChapterScores, type ChapterScoreSummary } from '../chapterScores'

export type { ChapterScoreSummary }

// Transparent Comprehension Scoring™ (Phase 4) — the real, per-chapter
// breakdown a parent needs ("Chapter 3: 30%", "Chapter 5: 85%"), not just
// the single cross-document average getQuantumDocumentSessionHistory
// already powers (a different, complementary view — see
// ComprehensionScoreCard). Every attempt is read exactly as recorded:
// no chapter is ever hidden or excluded for scoring below any threshold
// — a student is never blocked from completing a chapter regardless of
// score (see saveQuantumDocumentSession.ts / QuantumDocumentDetailView's
// own unconditional `setSessionPhase('complete')`), so a low score here
// is real, undeniable signal for a parent, not a gap left by a gate.
//
// Reads the signed-in account's own attempts only (RLS:
// quantum_document_sessions_select_own / quantum_documents_select_own) —
// the same self-view scope as the rest of the Parent Dashboard today
// (see ParentDashboard.tsx's own comment on why there is no real
// parent→child account link yet).
export async function getQuantumDocumentChapterScores(): Promise<readonly ChapterScoreSummary[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('quantum_document_sessions')
    .select('quantum_document_id, correct_answers_count, total_questions_count, score_percent, occurred_at, quantum_documents(title)')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  if (error || !data) return []

  const attempts = data.flatMap((row) => {
    // score_percent is a GENERATED ALWAYS ... STORED column derived from
    // total_questions_count (CHECK > 0) and correct_answers_count (both
    // NOT NULL) — it is never actually null for a real row, but the
    // generated type can't express that, so this is a real, honest guard,
    // not a defensive fabrication.
    if (row.score_percent === null || row.quantum_documents === null) return []
    return [
      {
        quantumDocumentId: row.quantum_document_id,
        title: row.quantum_documents.title,
        scorePercent: row.score_percent,
        correctAnswersCount: row.correct_answers_count,
        totalQuestionsCount: row.total_questions_count,
        occurredAt: row.occurred_at,
      },
    ]
  })

  return computeChapterScores(attempts)
}
