import type { ConversationType } from '@/features/mentor-conversation-engine'
import type { ConversationPriority } from './ConversationPriority'
import type { ConversationTrigger } from './ConversationTrigger'

// ConversationRule™ — one deterministic mapping from a trigger to which
// Sprint 10 ConversationType it should dispatch, and at what priority.
export type ConversationRule = {
  id: string
  trigger: ConversationTrigger
  conversationType: ConversationType
  priority: ConversationPriority
}
