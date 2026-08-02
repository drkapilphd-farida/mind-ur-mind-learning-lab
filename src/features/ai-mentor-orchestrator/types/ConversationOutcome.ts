import type { ConversationResponse } from '@/features/mentor-conversation-engine'
import type { ConversationState } from './ConversationState'

// ConversationOutcome™ — the result of actually running a queued
// conversation through Sprint 10's ConversationEngine. `response` is
// `null` only when the conversation could not be run (e.g. nothing
// runnable in the queue) — never a placeholder response.
export type ConversationOutcome = {
  state: ConversationState
  response: ConversationResponse | null
  reason: string
}
