import type { ConversationState, DispatchResult, TriggerEvent } from '../types'

// "Prevent duplicate conversations. Apply priority rules." — resolves
// the event to a rule, checks the existing queue for an equivalent
// still-active conversation for the same learner, and either enqueues
// a new ConversationState or reports why it was deduplicated.
export interface ConversationDispatcher {
  dispatch(event: TriggerEvent, queue: readonly ConversationState[]): DispatchResult
}
