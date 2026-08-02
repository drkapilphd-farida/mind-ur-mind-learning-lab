import type { MentorMessage } from './message'

// `learningProjectId` is a plain string reference to Sprint 1's
// LearningProject.id — deliberately not an import of that type (this
// feature stays fully self-contained until Chunk 4's explicit
// integration point, per this sprint's own "No UI integration yet. No
// provider integration" scope for Chunk 1).
export type Conversation = {
  id: string
  learningProjectId: string
  messages: readonly MentorMessage[]
  startedAt: string
  updatedAt: string
}
