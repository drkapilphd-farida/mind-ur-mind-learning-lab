import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeSmartNotesSessionTracking } from './computeSmartNotesSessionTracking'
import { computeSmartNotesEngagementScore } from './computeSmartNotesEngagementScore'
import type { SmartNotesLearningProfile, SmartNotesLearningProfileTrend } from './types/SmartNotesLearningProfile'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Pure. A deterministic
// cross-session aggregate over a learner's real, already-persisted
// smart-notes `SessionSnapshot`s. Mirrors Memory Mode™'s own
// `computeMemoryLearningProfile` (Sprint-3) exactly, with one addition:
// `documentsWithNotes` is passed in already-computed (a real count from
// the `smart_notes` table, Sprint-2) rather than queried here — this
// function stays pure and framework-agnostic, never touching Supabase
// itself; the Server Action boundary is responsible for the real query.
// `trend` compares the mean engagement of the earlier half of sessions
// against the later half; a threshold of 0.05 (the same disclosed
// choice Memory Mode's own profile uses) separates real movement from
// noise. Fewer than two sessions cannot show a real trend.
const TREND_THRESHOLD = 0.05

export function computeSmartNotesLearningProfile(snapshots: readonly SessionSnapshot[], documentsWithNotes: number): SmartNotesLearningProfile {
  if (snapshots.length === 0) {
    return { sessionsCompleted: 0, totalConceptsReviewed: 0, averageEngagementScore: 0, trend: 'insufficient-data', documentsWithNotes }
  }

  const sorted = [...snapshots].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
  const engagementScores = sorted.map((snapshot) => computeSmartNotesEngagementScore(computeSmartNotesSessionTracking(snapshot)))

  const sessionsCompleted = sorted.filter((snapshot) => snapshot.status === 'completed').length
  const totalConceptsReviewed = sorted.reduce((sum, snapshot) => sum + snapshot.metrics.completedChunks, 0)
  const averageEngagementScore = average(engagementScores)

  return { sessionsCompleted, totalConceptsReviewed, averageEngagementScore, trend: computeTrend(engagementScores), documentsWithNotes }
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

function computeTrend(engagementScores: readonly number[]): SmartNotesLearningProfileTrend {
  if (engagementScores.length < 2) return 'insufficient-data'

  const midpoint = Math.floor(engagementScores.length / 2)
  const delta = average(engagementScores.slice(midpoint)) - average(engagementScores.slice(0, midpoint))

  if (delta > TREND_THRESHOLD) return 'improving'
  if (delta < -TREND_THRESHOLD) return 'declining'
  return 'steady'
}
