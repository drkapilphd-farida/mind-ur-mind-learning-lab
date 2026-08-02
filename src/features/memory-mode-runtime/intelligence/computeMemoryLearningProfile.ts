import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeMemorySessionTracking } from './computeMemorySessionTracking'
import { computeMemoryConfidenceScore } from './computeMemoryConfidenceScore'
import type { MemoryLearningProfile, MemoryLearningProfileTrend } from './types/MemoryLearningProfile'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Pure. A
// deterministic cross-session aggregate over a learner's real, already-
// persisted memory `SessionSnapshot`s (reused via the Shared Learning
// Runtime's own `SessionPersistenceAdapter.listByLearner`, Sprint-1) —
// never a new tracking table, never a duplicate of LSE-3's own analytics.
// `totalConceptsReviewed` counts every real completed chunk across every
// session, finished or not — a real chunk completed mid-session still
// genuinely happened. `trend` compares the mean confidence of the earlier
// half of sessions (by real `capturedAt` order) against the later half; a
// threshold of 0.05 (a deliberate, disclosed choice, not derived from
// external data) separates real movement from noise. Fewer than two
// sessions cannot show a real trend, so `'insufficient-data'` is reported
// honestly rather than guessed.
const TREND_THRESHOLD = 0.05

export function computeMemoryLearningProfile(snapshots: readonly SessionSnapshot[]): MemoryLearningProfile {
  if (snapshots.length === 0) {
    return { sessionsCompleted: 0, totalConceptsReviewed: 0, averageConfidenceScore: 0, trend: 'insufficient-data' }
  }

  const sorted = [...snapshots].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
  const confidenceScores = sorted.map((snapshot) => computeMemoryConfidenceScore(computeMemorySessionTracking(snapshot)))

  const sessionsCompleted = sorted.filter((snapshot) => snapshot.status === 'completed').length
  const totalConceptsReviewed = sorted.reduce((sum, snapshot) => sum + snapshot.metrics.completedChunks, 0)
  const averageConfidenceScore = average(confidenceScores)

  return { sessionsCompleted, totalConceptsReviewed, averageConfidenceScore, trend: computeTrend(confidenceScores) }
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

function computeTrend(confidenceScores: readonly number[]): MemoryLearningProfileTrend {
  if (confidenceScores.length < 2) return 'insufficient-data'

  const midpoint = Math.floor(confidenceScores.length / 2)
  const delta = average(confidenceScores.slice(midpoint)) - average(confidenceScores.slice(0, midpoint))

  if (delta > TREND_THRESHOLD) return 'improving'
  if (delta < -TREND_THRESHOLD) return 'declining'
  return 'steady'
}
