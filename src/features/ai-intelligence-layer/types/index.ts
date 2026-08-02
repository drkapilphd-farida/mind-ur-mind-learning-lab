// AI Intelligence Layer™ domain types (Sprint 7). Fully self-contained
// — zero imports from any other feature, including
// `@/features/ai-provider` — "Future Provider Agnostic" and Sprint 7's
// own DO NOT MODIFY list (which names the AI Provider Layer, Learning
// Intelligence, Conversation Layer, and others) both point the same
// direction: this layer knows nothing about any of them, not even
// their types.

export type { AgeGroup } from './AgeGroup'
export type { DifficultyLevel } from './DifficultyLevel'
export type { UserProfile } from './UserProfile'
export type { UserContext } from './UserContext'
export type { MindContext } from './MindContext'
export type { JourneyContext } from './JourneyContext'
export type { ConversationContext } from './ConversationContext'
export type { MentorPersonaId } from './MentorPersonaId'
export type { MentorPersona } from './MentorPersona'
export type { MentorPersonaSelectionInput } from './MentorPersonaSelectionInput'
export type { SafetyRule } from './SafetyRule'
export type { PromptSection } from './PromptSection'
export type { PromptPackage } from './PromptPackage'
export type { PromptCompositionInput } from './PromptCompositionInput'
export type { MarkdownBlock, PlainTextBlock, CardBlock, BulletListBlock, ActionItemBlock, SuggestedExerciseBlock, ResponseBlock } from './ResponseBlock'
export type { FormattedResponse } from './FormattedResponse'
export type { RawAIResponseInput } from './RawAIResponseInput'
