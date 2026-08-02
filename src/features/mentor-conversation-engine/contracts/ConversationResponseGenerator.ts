import type { ConversationContext, ConversationPromptPackage, ConversationResponse } from '../types'

// The "future provider injection" seam — DefaultConversationResponseGenerator
// (this sprint) produces a ConversationResponse from reusable templates,
// entirely deterministic, no LLM call. A future real implementation
// (calling a real AI provider, e.g. via `@/features/real-ai-providers`,
// Sprint 8) implements this exact same interface — mapping the
// ConversationPromptPackage into a real request and a real reply back
// into this same ConversationResponse shape — without
// ConversationEngine or anything upstream of it ever changing.
export interface ConversationResponseGenerator {
  generate(promptPackage: ConversationPromptPackage, context: ConversationContext): Promise<ConversationResponse>
}
