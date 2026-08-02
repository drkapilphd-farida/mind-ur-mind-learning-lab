import type { AdaptiveDifficultyRecommendation } from './AdaptiveDifficultyRecommendation'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. The real,
// deterministic bundle for the session-completion moment — confidence,
// a difficulty recommendation for the learner's next session, and a
// short list of honest, plain-language insights. No score, no grade —
// consistent with the platform's own Mastery Philosophy.
export type SessionCompletionIntelligence = {
  confidenceScore: number
  difficultyRecommendation: AdaptiveDifficultyRecommendation
  insights: readonly string[]
}
