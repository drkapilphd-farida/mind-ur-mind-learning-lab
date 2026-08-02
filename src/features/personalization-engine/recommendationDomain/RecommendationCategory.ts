// "Journey Recommendation, Exercise Recommendation, Review
// Recommendation, Difficulty Recommendation, Session Recommendation" —
// the Sprint 26 brief's own Section 3 list, verbatim. Same 5 literal
// values as `executionDomain/ExecutionSequenceType`, independently
// declared — same domain-model-independence convention as
// `StrategyType` (Sprint 24) vs. `ExecutionSequenceType` (Sprint 25).
export type RecommendationCategory = 'journey' | 'exercise' | 'difficulty' | 'review' | 'session'
