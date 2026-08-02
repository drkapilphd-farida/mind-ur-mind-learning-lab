import type { ConversationHistory, ConversationMemory, ConversationType } from '../types'
import type { ConversationMemoryBuilder } from '../contracts'

const RECENT_TYPES_WINDOW = 5

// Implements ConversationMemoryBuilder. Pure derivation from
// ConversationHistory — `recentConversationTypes` is most-recent-first,
// capped at RECENT_TYPES_WINDOW; `lastConversationType` is the most
// recent mentor turn's type, or `null` if the mentor hasn't spoken yet.
export class DefaultConversationMemoryBuilder implements ConversationMemoryBuilder {
  build(history: ConversationHistory): ConversationMemory {
    const mentorTurns = history.turns.filter((turn) => turn.role === 'mentor')

    const recentConversationTypes = [...mentorTurns]
      .reverse()
      .map((turn) => turn.conversationType)
      .filter((type): type is ConversationType => type !== null)
      .slice(0, RECENT_TYPES_WINDOW)

    const lastMentorTurn = mentorTurns[mentorTurns.length - 1]

    return {
      recentConversationTypes,
      totalMentorTurns: mentorTurns.length,
      lastConversationType: lastMentorTurn?.conversationType ?? null,
    }
  }
}

export function createConversationMemoryBuilder(): ConversationMemoryBuilder {
  return new DefaultConversationMemoryBuilder()
}
