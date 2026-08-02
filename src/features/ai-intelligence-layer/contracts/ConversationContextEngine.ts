import type { ConversationContext } from '../types'

// "Maintain structured conversation context... Do NOT build persistent
// storage. Interfaces only." — no save/load/store method exists on
// this contract at all; `buildContext` only ever normalizes whatever
// conversation state a caller already holds (e.g. an in-memory
// ConversationOrchestrator elsewhere) into the structured shape the
// Prompt Composition Engine expects.
export interface ConversationContextEngine {
  buildContext(input: Partial<ConversationContext>): ConversationContext
}
