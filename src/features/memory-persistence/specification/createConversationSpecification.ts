import type { Memory } from '../domain'
import type { MemorySpecification } from './MemorySpecification'

// Sprint 13's `Memory` model has no dedicated `conversationId` field
// (no conversation-scoping concept existed yet). This sprint's
// documented convention: a conversation-scoped memory carries its
// conversation id as one of `Memory.metadata.tags` — a future sprint
// that adds a real `conversationId` field to the domain model can
// replace this specification's implementation without changing its
// contract (`MemorySpecification`) or any caller.
export function createConversationSpecification(conversationId: string): MemorySpecification {
  return { isSatisfiedBy: (memory: Memory) => memory.metadata.tags.includes(conversationId) }
}
