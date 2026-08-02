// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Every function
// here is pure and framework-agnostic — no Supabase import, no
// `next/headers` — operating only on real, already-persisted
// `SessionSnapshot`/`RuntimeMetrics` data (LSE-3, the Shared Learning
// Runtime). No new AI pipeline, no new persistence, no automatic change
// to LSE-2's own runtime behavior — every decision here is a
// recommendation for a caller to use, never a silent mutation of the
// real session state.
export type { MemorySessionTracking, MemoryLearningProfile, MemoryLearningProfileTrend, AdaptiveDifficultyLevel, AdaptiveDifficultyRecommendation, SmartContinueAction, SmartContinueRecommendation, SessionCompletionIntelligence } from './types'

export { computeMemorySessionTracking } from './computeMemorySessionTracking'
export { computeMemoryConfidenceScore } from './computeMemoryConfidenceScore'
export { computeMemoryLearningProfile } from './computeMemoryLearningProfile'
export { recommendAdaptiveDifficulty } from './recommendAdaptiveDifficulty'
export { recommendContinueStrategy } from './recommendContinueStrategy'
export { computeMemoryPerformanceInsights } from './computeMemoryPerformanceInsights'
export { computeSessionCompletionIntelligence } from './computeSessionCompletionIntelligence'
