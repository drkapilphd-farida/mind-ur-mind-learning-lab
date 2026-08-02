// AI Mentor ↔ AI Provider Layer integration (Sprint 5, Chunk 4). Its
// own bounded context, not part of either @/features/ai-mentor or
// @/features/ai-provider — it imports from both (one-way: this file
// depends on them, neither depends on it), which is what lets it exist
// without modifying either feature's own files or violating
// ai-provider's "zero imports from ai-mentor" self-containment rule.
export { MentorAIProviderAdapter, createMentorAIProviderAdapter, type MentorAIProviderAdapterDependencies } from './MentorAIProviderAdapter'
export { mapMentorPromptToAIRequest } from './mapMentorPromptToAIRequest'
export { resolveModelId } from './resolveModelId'
export { NoModelAvailableError } from './NoModelAvailableError'
