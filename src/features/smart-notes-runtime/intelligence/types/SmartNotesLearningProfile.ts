// Smart Notes™ Sprint-3 — Adaptive Intelligence™. A deterministic
// cross-session aggregate — real, already-persisted `SessionSnapshot`s
// for one learner's smart-notes sessions (via the Shared Learning
// Runtime's own `SessionPersistenceAdapter.listByLearner`, Sprint-1).
// `documentsWithNotes` is a real, structural fact (a count of documents
// with real, non-empty saved content) — never a judgment of what was
// written; no note content is ever read or scored. `'insufficient-data'`
// is a real, honest trend value — never a guessed direction from too few
// sessions to mean anything.
export type SmartNotesLearningProfileTrend = 'improving' | 'steady' | 'declining' | 'insufficient-data'

export type SmartNotesLearningProfile = {
  sessionsCompleted: number
  totalConceptsReviewed: number
  averageEngagementScore: number
  trend: SmartNotesLearningProfileTrend
  documentsWithNotes: number
}
