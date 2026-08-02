import type { ConversationState } from '../types'

// Pure state transitions — each returns a *new* ConversationState.
// Illegal transitions (e.g. Completed -> Running) throw
// IllegalLifecycleTransitionError rather than silently applying.
export interface ConversationLifecycleManager {
  markReady(state: ConversationState): ConversationState
  markRunning(state: ConversationState): ConversationState
  markWaiting(state: ConversationState): ConversationState
  resume(state: ConversationState): ConversationState
  markCompleted(state: ConversationState): ConversationState
  markDismissed(state: ConversationState): ConversationState
  expireIfStale(state: ConversationState, now: string): ConversationState
}
