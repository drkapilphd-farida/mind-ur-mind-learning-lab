import type { ConversationState } from '../types'

export type DequeueResult = {
  next: ConversationState | null
  remaining: readonly ConversationState[]
}

// Pure queue operations — never mutates the given array. `dequeue`
// picks the highest-priority `queued` entry (Critical > High > Medium
// > Low > Background), ties broken by earliest `createdAt`.
export interface ConversationQueueManager {
  enqueue(queue: readonly ConversationState[], state: ConversationState): readonly ConversationState[]
  dequeue(queue: readonly ConversationState[]): DequeueResult
}
