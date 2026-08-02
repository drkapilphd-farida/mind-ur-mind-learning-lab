import type { ConversationContext } from '../types'
import type { ConversationContextEngine } from '../contracts'

// Implements ConversationContextEngine. No persistence, no store — see
// the contract's own header comment. Purely normalizes whatever
// conversation state a caller already holds in memory.
export class DefaultConversationContextEngine implements ConversationContextEngine {
  buildContext(input: Partial<ConversationContext>): ConversationContext {
    return {
      currentTopic: input.currentTopic ?? null,
      previousQuestions: input.previousQuestions ?? [],
      conversationSummary: input.conversationSummary ?? null,
      learningIntent: input.learningIntent ?? null,
      pendingTasks: input.pendingTasks ?? [],
    }
  }
}

export function createConversationContextEngine(): ConversationContextEngine {
  return new DefaultConversationContextEngine()
}
