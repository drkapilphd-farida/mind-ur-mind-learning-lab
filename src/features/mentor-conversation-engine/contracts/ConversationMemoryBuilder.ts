import type { ConversationHistory, ConversationMemory } from '../types'

// Derives ConversationMemory purely from ConversationHistory — never a
// separately hand-maintained or invented summary.
export interface ConversationMemoryBuilder {
  build(history: ConversationHistory): ConversationMemory
}
