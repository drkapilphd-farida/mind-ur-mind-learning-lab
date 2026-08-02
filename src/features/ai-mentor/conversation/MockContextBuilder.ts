import type { ContextBuilder, ContextBuilderInput } from '../contracts'
import type { MentorContext } from '../types'

// Implements ContextBuilder — "Conversation Context." Pure
// composition, no I/O of its own (the orchestrator fetches each piece
// first). Windows to the last 10 messages: a real, deliberate design
// decision (bounding context size) rather than an arbitrary cut.
const RECENT_MESSAGE_WINDOW = 10

export class MockContextBuilder implements ContextBuilder {
  async build(input: ContextBuilderInput): Promise<MentorContext> {
    const recentMessages = input.conversation ? input.conversation.messages.slice(-RECENT_MESSAGE_WINDOW) : []

    return {
      learningProjectId: input.learningProjectId,
      recentMessages,
      insights: input.insights,
      recommendations: input.recommendations,
      memory: input.memory,
    }
  }
}

export function createContextBuilder(): ContextBuilder {
  return new MockContextBuilder()
}
