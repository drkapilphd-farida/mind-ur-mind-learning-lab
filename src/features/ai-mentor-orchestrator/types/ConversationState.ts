import type { ConversationContext, ConversationType } from '@/features/mentor-conversation-engine'
import type { ConversationLifecycleState } from './ConversationLifecycleState'
import type { ConversationPriority } from './ConversationPriority'
import type { ConversationTrigger } from './ConversationTrigger'

// ConversationState™ — one dispatched-but-not-yet-necessarily-run
// conversation's full tracked state. Immutable by convention — every
// transition (see ConversationLifecycleManager) returns a *new*
// ConversationState rather than mutating this one ("Pure Functions").
export type ConversationState = {
  id: string
  learnerId: string
  trigger: ConversationTrigger
  conversationType: ConversationType
  priority: ConversationPriority
  lifecycle: ConversationLifecycleState
  context: ConversationContext
  createdAt: string
  expiresAt: string | null
}
