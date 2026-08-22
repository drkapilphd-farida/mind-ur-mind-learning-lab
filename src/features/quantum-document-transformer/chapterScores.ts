// Transparent Comprehension Scoring™ (Phase 4) — pure grouping/aggregation
// over already-fetched attempts, no DB access. Mirrors this codebase's own
// "fetch once, derive many views" convention (see
// parent-dashboard/comprehensionStats.ts, lib/exercises/practiceHistory.ts).

export type ChapterScoreAttempt = {
  quantumDocumentId: string
  title: string
  scorePercent: number
  correctAnswersCount: number
  totalQuestionsCount: number
  occurredAt: string
}

export type ChapterScoreSummary = {
  quantumDocumentId: string
  title: string
  // The score from the student's most recent attempt — what a parent
  // should act on today (re-read this chapter or move on).
  latestScorePercent: number
  latestCorrectAnswersCount: number
  latestTotalQuestionsCount: number
  // The highest score across every attempt — real proof the student can
  // master this chapter, even if their latest attempt was worse.
  bestScorePercent: number
  attemptsCount: number
  latestAttemptedAt: string
}

// Groups every real, ungated attempt by chapter/document — never blended
// across chapters, so "Chapter 3: 30%, Chapter 5: 85%" stays exact and
// per-chapter, not averaged into one number that could hide a chapter the
// student never actually understood. `attempts` is assumed most-recent-
// first (getQuantumDocumentChapterScores's own query order) — the first
// attempt seen per document is treated as the latest.
export function computeChapterScores(attempts: readonly ChapterScoreAttempt[]): readonly ChapterScoreSummary[] {
  const byDocument = new Map<string, ChapterScoreAttempt[]>()
  for (const attempt of attempts) {
    const existing = byDocument.get(attempt.quantumDocumentId)
    if (existing) {
      existing.push(attempt)
    } else {
      byDocument.set(attempt.quantumDocumentId, [attempt])
    }
  }

  const summaries: ChapterScoreSummary[] = []
  for (const documentAttempts of byDocument.values()) {
    const [latest, ...rest] = documentAttempts
    if (!latest) continue
    const bestScorePercent = Math.max(latest.scorePercent, ...rest.map((attempt) => attempt.scorePercent))

    summaries.push({
      quantumDocumentId: latest.quantumDocumentId,
      title: latest.title,
      latestScorePercent: latest.scorePercent,
      latestCorrectAnswersCount: latest.correctAnswersCount,
      latestTotalQuestionsCount: latest.totalQuestionsCount,
      bestScorePercent,
      attemptsCount: documentAttempts.length,
      latestAttemptedAt: latest.occurredAt,
    })
  }

  return summaries.sort((a, b) => new Date(b.latestAttemptedAt).getTime() - new Date(a.latestAttemptedAt).getTime())
}
