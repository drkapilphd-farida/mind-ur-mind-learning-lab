import type { ConversationMetadata } from './ConversationMetadata'

// The Sprint 10 brief's own "Response Contract," verbatim: Response
// Title, Main Response, Suggested Actions, Recommended Exercise,
// Follow-up Question, Conversation Metadata.
export type ConversationResponse = {
  title: string
  mainResponse: string
  suggestedActions: readonly string[]
  recommendedExercise: string | null
  followUpQuestion: string | null
  metadata: ConversationMetadata
}
