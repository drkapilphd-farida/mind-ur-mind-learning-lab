// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. A deterministic
// cross-session aggregate — real, already-persisted `SessionSnapshot`s for
// one learner's memory sessions (via the Shared Learning Runtime's own
// `SessionPersistenceAdapter.listByLearner`, Sprint-1), never a new
// tracking table. `'insufficient-data'` is a real, honest trend value —
// never a guessed direction from too few sessions to mean anything.
export type MemoryLearningProfileTrend = 'improving' | 'steady' | 'declining' | 'insufficient-data'

export type MemoryLearningProfile = {
  sessionsCompleted: number
  totalConceptsReviewed: number
  averageConfidenceScore: number
  trend: MemoryLearningProfileTrend
}
