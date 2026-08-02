import type { MentorTone } from './MentorTone'

// PromptComposer's™ output — a deterministic package combining
// personality, tone, safety guidance, memory, and context into one
// system prompt string, ready for DefaultConversationResponseGenerator
// (or, in the future, a real LLM call — "future provider injection").
export type ConversationPromptPackage = {
  systemPrompt: string
  tone: MentorTone
  contextSummary: string
}
