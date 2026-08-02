import type { ConversationHistory } from './ConversationHistory'
import type { ConversationMemory } from './ConversationMemory'

// ConversationSession™ — one learner's ongoing conversation state.
// Immutable by convention: ConversationEngine.respond() returns a new
// session value rather than mutating this one ("Pure Functions").
export type ConversationSession = {
  id: string
  learnerId: string
  startedAt: string
  history: ConversationHistory
  memory: ConversationMemory
}
