// AI Mentor Conversation Engine™ domain types (Sprint 10). Fully
// self-contained — zero imports from any other feature, same
// discipline as `@/features/ai-intelligence-layer` (Sprint 7) and
// `@/features/adaptive-learning-planner` (Sprint 9). `ConversationContext`
// here is an independently-declared type, not the identically-named
// one in `@/features/ai-intelligence-layer/types` — same "each feature
// redeclares its own small shared vocab for self-containment"
// convention as Clock/IdGenerator across this codebase.

export type { ConversationType } from './ConversationType'
export type { MentorTone } from './MentorTone'
export type { PersonalityTrait } from './PersonalityTrait'
export type { MentorPersonality } from './MentorPersonality'
export type { ConversationSafetyRule } from './ConversationSafetyRule'
export type { ConversationTurnRole, ConversationTurn } from './ConversationTurn'
export type { ConversationHistory } from './ConversationHistory'
export type { ConversationMemory } from './ConversationMemory'
export type { ConversationContext } from './ConversationContext'
export type { ConversationMetadata } from './ConversationMetadata'
export type { ConversationResponse } from './ConversationResponse'
export type { ConversationSession } from './ConversationSession'
export type { ConversationPromptPackage } from './ConversationPromptPackage'
