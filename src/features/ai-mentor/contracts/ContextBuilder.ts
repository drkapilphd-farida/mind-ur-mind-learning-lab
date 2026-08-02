import type { Conversation, MentorContext, MentorInsight, MentorRecommendation } from '../types'

// ContextBuilder's real input — the raw pieces (ConversationStore's
// current conversation, the analyzers' insights, the
// RecommendationEngine's output, MentorMemory's recalled facts)
// assembled into one MentorContext. Implemented by a plain composition
// function in Chunk 3 — no I/O of its own, callers fetch each piece
// first.
export type ContextBuilderInput = {
  learningProjectId: string
  conversation: Conversation | null
  insights: readonly MentorInsight[]
  recommendations: readonly MentorRecommendation[]
  memory: readonly string[]
}

export interface ContextBuilder {
  build(input: ContextBuilderInput): Promise<MentorContext>
}
