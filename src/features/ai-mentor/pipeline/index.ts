// The Integration Layer (Sprint 4, Chunk 4) — bridges
// `@/features/learning-intelligence` (Sprint 3) with this feature's own
// Mentor Intelligence (Chunk 2) and Conversation Layer (Chunk 3).
// `createMentorOrchestrator` is the intended top-level entry point for
// any future caller (a Server Action, a hook) — never construct the
// individual composers or call the pipeline directly from outside this
// feature.

export { createMentorOrchestrator, type MentorOrchestratorDependencies } from './createMentorOrchestrator'
export { createMentorPipeline, type MentorPipelineDependencies } from './createMentorPipeline'
export { createLearningSessionAdapter, DefaultLearningSessionAdapter } from './DefaultLearningSessionAdapter'
export { createMentorInsightComposer, DefaultMentorInsightComposer, type MentorInsightComposerDependencies } from './DefaultMentorInsightComposer'
export { createMentorRecommendationComposer, DefaultMentorRecommendationComposer, type MentorRecommendationComposerDependencies } from './DefaultMentorRecommendationComposer'
export { createMentorResponseComposer, DefaultMentorResponseComposer } from './DefaultMentorResponseComposer'
