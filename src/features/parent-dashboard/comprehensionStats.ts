import type { QuantumDocumentSessionRecord } from '@/features/quantum-document-transformer/actions/getQuantumDocumentSessionHistory'

// Pure aggregation over already-fetched session history — no DB access,
// mirrors src/lib/exercises/practiceHistory.ts's own "fetch once, derive
// many views" convention.

function comprehensionPercent(session: QuantumDocumentSessionRecord): number {
  if (session.totalQuestionsCount === 0) return 0
  return Math.round((session.correctAnswersCount / session.totalQuestionsCount) * 100)
}

function average(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export type ComprehensionSummary = {
  averagePercent: number | null
  // Recent-half average minus earlier-half average — null until there
  // are at least 2 sessions to compare (a single session has no trend).
  trendDelta: number | null
}

// `sessions` is assumed most-recent-first (getQuantumDocumentSessionHistory's
// own order). Trend compares the newer half of the window against the
// older half, rather than a single-session delta, so one unusually
// easy/hard document doesn't swing the trend on its own.
export function computeComprehensionSummary(sessions: readonly QuantumDocumentSessionRecord[]): ComprehensionSummary {
  if (sessions.length === 0) {
    return { averagePercent: null, trendDelta: null }
  }

  const percentages = sessions.map(comprehensionPercent)
  const averagePercent = average(percentages)

  if (sessions.length < 2) {
    return { averagePercent, trendDelta: null }
  }

  const midpoint = Math.ceil(percentages.length / 2)
  const recentAverage = average(percentages.slice(0, midpoint))
  const earlierAverage = average(percentages.slice(midpoint))

  const trendDelta = recentAverage !== null && earlierAverage !== null ? recentAverage - earlierAverage : null

  return { averagePercent, trendDelta }
}

export type DocumentMasterySummary = {
  documentsCompleted: number
  averageComprehensionPercent: number | null
}

// documentsCompleted is the real quantum_documents row count (every
// transformed document, whether or not its quiz was attempted yet);
// averageComprehensionPercent only reflects documents with at least one
// recorded quiz session — a transformed-but-not-yet-quizzed document
// has no comprehension score to include.
export function computeDocumentMasterySummary(documentsCompleted: number, sessions: readonly QuantumDocumentSessionRecord[]): DocumentMasterySummary {
  return {
    documentsCompleted,
    averageComprehensionPercent: average(sessions.map(comprehensionPercent)),
  }
}
