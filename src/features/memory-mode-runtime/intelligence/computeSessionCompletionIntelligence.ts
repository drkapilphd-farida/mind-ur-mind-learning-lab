import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeMemorySessionTracking } from './computeMemorySessionTracking'
import { computeMemoryConfidenceScore } from './computeMemoryConfidenceScore'
import { recommendAdaptiveDifficulty } from './recommendAdaptiveDifficulty'
import { computeMemoryLearningProfile } from './computeMemoryLearningProfile'
import { computeMemoryPerformanceInsights } from './computeMemoryPerformanceInsights'
import type { SessionCompletionIntelligence } from './types/SessionCompletionIntelligence'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Pure. The
// real, composed bundle for the session-completion moment — confidence,
// a difficulty recommendation for the learner's next session, and honest
// plain-language insights, all derived from this sprint's own lower
// functions over already-real data. `historicalSnapshots` should include
// `snapshot` itself (the just-completed session is real history too) —
// callers pass whatever `SessionPersistenceAdapter.listByLearner` already
// returns.
export function computeSessionCompletionIntelligence(snapshot: SessionSnapshot, historicalSnapshots: readonly SessionSnapshot[]): SessionCompletionIntelligence {
  const tracking = computeMemorySessionTracking(snapshot)
  const confidenceScore = computeMemoryConfidenceScore(tracking)
  const difficultyRecommendation = recommendAdaptiveDifficulty(tracking)
  const profile = computeMemoryLearningProfile(historicalSnapshots)
  const insights = computeMemoryPerformanceInsights(profile)

  return { confidenceScore, difficultyRecommendation, insights }
}
