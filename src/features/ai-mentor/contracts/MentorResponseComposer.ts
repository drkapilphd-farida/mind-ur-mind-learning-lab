import type { MentorContext, MentorInsight, MentorMessage, MentorRecommendation } from '../types'

// "UI-ready Response Object" — the pipeline's final output. Plain
// data only (no React, no components — "No UI logic inside engines"),
// shaped so a future UI layer can render it directly without knowing
// anything about ConversationOrchestrator, MentorContext, or any
// analyzer.
export type MentorUIResponse = {
  conversationId: string
  learningProjectId: string
  reply: MentorMessage
  insights: readonly MentorInsight[]
  recommendations: readonly MentorRecommendation[]
}

export type MentorResponseComposerInput = {
  conversationId: string
  context: MentorContext
  reply: MentorMessage
}

// "Mentor Response → UI-ready Response Object" pipeline stage. Pure
// shaping, no I/O — `context` already carries the insights/
// recommendations that went into the reply, so this never
// re-computes anything, only re-packages it.
export interface MentorResponseComposer {
  compose(input: MentorResponseComposerInput): MentorUIResponse
}
