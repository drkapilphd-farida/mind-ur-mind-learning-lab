import type { ConversationContext, ConversationMemory, ConversationPromptPackage } from '../types'

// PromptComposer™ — combines MentorPersonality + MentorTone + the
// Safety Rules + ConversationMemory + ConversationContext into one
// deterministic ConversationPromptPackage.
export interface PromptComposer {
  compose(context: ConversationContext, memory: ConversationMemory): ConversationPromptPackage
}
