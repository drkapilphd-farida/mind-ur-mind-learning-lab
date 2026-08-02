// Dependency-inversion interfaces for the AI Mentor™ Foundation
// (Sprint 4). engine/ (Chunk 2) and conversation/ (Chunk 3) each
// implement one of these with deterministic mock logic; Chunk 4's
// integration layer composes them. Same convention as
// `@/features/learning-intelligence/contracts`.

// Chunk 2 — Mentor Intelligence Engine
export type { ProgressAnalyzer } from './ProgressAnalyzer'
export type { LearningPatternAnalyzer } from './LearningPatternAnalyzer'
export type { WeaknessDetector } from './WeaknessDetector'
export type { StrengthDetector } from './StrengthDetector'
export type { MotivationEngine } from './MotivationEngine'
export type { GoalTrackingEngine } from './GoalTrackingEngine'
export type { RecommendationEngine } from './RecommendationEngine'

// Chunk 3 — Conversation Layer
export type { ConversationStore } from './ConversationStore'
export type { MentorMemory } from './MentorMemory'
export type { ContextBuilder, ContextBuilderInput } from './ContextBuilder'
export type { PromptBuilder, MentorPromptRole, MentorPromptMessage, MentorPrompt } from './PromptBuilder'
export type { ProviderAdapter, MentorProviderReply } from './ProviderAdapter'

// Sprint 4, Chunk 3 additions — additive only, nothing above this line changed.
export type { Clock } from './Clock'
export type { IdGenerator } from './IdGenerator'
export type { ConversationOrchestrator, StartSessionResult, SendMessageResult } from './ConversationOrchestrator'

// Sprint 4, Chunk 4 — Integration Layer. Bridges this feature with
// `@/features/learning-intelligence` (Sprint 3). Additive only,
// nothing above this line changed.
export type { LearningSessionAdapter, LearningSessionInput } from './LearningSessionAdapter'
export type { MentorInsightComposer } from './MentorInsightComposer'
export type { MentorRecommendationComposer } from './MentorRecommendationComposer'
export type { MentorResponseComposer, MentorResponseComposerInput, MentorUIResponse } from './MentorResponseComposer'
export type { MentorPipeline, MentorPipelineInput } from './MentorPipeline'
export type { MentorOrchestrator, StartMentorSessionResult } from './MentorOrchestrator'
