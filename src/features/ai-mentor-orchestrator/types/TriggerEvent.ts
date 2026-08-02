import type { ConversationContext } from '@/features/mentor-conversation-engine'
import type { ConversationTrigger } from './ConversationTrigger'

// The orchestrator's own input — a real learner event, never invented
// by this feature ("No fake learner data"). `context` is Sprint 10's
// own ConversationContext (read-only import) — whatever real data the
// caller already has ready for when this conversation actually runs.
export type TriggerEvent = {
  trigger: ConversationTrigger
  learnerId: string
  occurredAt: string
  context: ConversationContext
}
