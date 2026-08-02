import type { ConversationState } from './ConversationState'

// ConversationDispatcher's™ output. `dispatchedState` is `null` when
// the event was deduplicated (an equivalent conversation was already
// queued/running for this learner) — never silently dropped without a
// reason.
export type DispatchResult = {
  queue: readonly ConversationState[]
  dispatchedState: ConversationState | null
  reason: string
}
