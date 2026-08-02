import type { ConversationType } from './ConversationType'

export type ConversationTurnRole = 'mentor' | 'learner'

// One turn — either side of the conversation. `content` for a mentor
// turn is `ConversationResponse.mainResponse` (the response's other
// fields — title, actions, etc. — are not folded into this flat
// string, so a caller replaying history sees exactly what was said,
// not a lossy re-serialization). `conversationType` is set for mentor
// turns (which ConversationType produced them) and `null` for learner
// turns — ConversationMemoryBuilder reads this to derive
// `recentConversationTypes` without a separate exchange log.
export type ConversationTurn = {
  id: string
  role: ConversationTurnRole
  content: string
  conversationType: ConversationType | null
  occurredAt: string
}
