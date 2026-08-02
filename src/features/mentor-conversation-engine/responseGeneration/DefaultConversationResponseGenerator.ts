import type { ConversationContext, ConversationPromptPackage, ConversationResponse } from '../types'
import type { Clock, ConversationResponseGenerator } from '../contracts'
import { systemClock } from '../adapters'
import { CONVERSATION_TEMPLATES } from '../templates'

// Implements ConversationResponseGenerator — this sprint's deterministic
// "no real LLM calls" default. `recommendedExercise` is copied straight
// from `context.recommendedExercise` (never template-invented); every
// other field comes from the matching CONVERSATION_TEMPLATES entry. A
// future real implementation (see the contract's own "future provider
// injection" note) replaces this whole class without
// ConversationEngine changing at all.
export class DefaultConversationResponseGenerator implements ConversationResponseGenerator {
  constructor(private readonly clock: Clock = systemClock) {}

  async generate(promptPackage: ConversationPromptPackage, context: ConversationContext): Promise<ConversationResponse> {
    const template = CONVERSATION_TEMPLATES[context.conversationType]
    const output = template(context)

    return {
      title: output.title,
      mainResponse: output.mainResponse,
      suggestedActions: output.suggestedActions,
      recommendedExercise: context.recommendedExercise,
      followUpQuestion: output.followUpQuestion,
      metadata: {
        conversationType: context.conversationType,
        tone: promptPackage.tone,
        generatedAt: this.clock.now(),
      },
    }
  }
}

export function createConversationResponseGenerator(clock?: Clock): ConversationResponseGenerator {
  return new DefaultConversationResponseGenerator(clock)
}
