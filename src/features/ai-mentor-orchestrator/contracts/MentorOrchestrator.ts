import type { ConversationSession } from '@/features/mentor-conversation-engine'
import type { ConversationOutcome, ConversationState, DispatchResult, TriggerEvent } from '../types'

export type ProcessNextResult = {
  outcome: ConversationOutcome | null
  session: ConversationSession
  queue: readonly ConversationState[]
}

// MentorOrchestrator™ — "the central decision engine that controls
// every mentor interaction." Composes ConversationResolver +
// ConversationDispatcher + ConversationQueueManager +
// ConversationLifecycleManager + Sprint 10's ConversationEngine into 3
// operations a caller actually needs.
export interface MentorOrchestrator {
  // "Select the correct conversation. Prevent duplicate conversations.
  // Apply priority rules." — handles one incoming trigger.
  handleTrigger(event: TriggerEvent, queue: readonly ConversationState[]): DispatchResult

  // Picks the next runnable conversation (highest priority, not
  // expired), runs it through Sprint 10's ConversationEngine — this is
  // "Support future AI provider execution": Sprint 10's own
  // ConversationResponseGenerator injection seam is inherited here
  // unchanged, nothing in this feature needs its own separate one.
  processNext(queue: readonly ConversationState[], session: ConversationSession): Promise<ProcessNextResult>

  // "Expire old conversations."
  expireStale(queue: readonly ConversationState[], now: string): readonly ConversationState[]
}
