import type { ConversationType } from './ConversationType'

// ConversationMemory™ — always *derived* from ConversationHistory
// (see memory/DefaultConversationMemoryBuilder.ts), never a separately
// hand-maintained or invented summary. `recentConversationTypes` is
// most-recent-first, capped at a fixed window.
export type ConversationMemory = {
  recentConversationTypes: readonly ConversationType[]
  totalMentorTurns: number
  lastConversationType: ConversationType | null
}
