import type { ConversationPriority, ConversationState } from '../types'
import type { ConversationQueueManager, DequeueResult } from '../contracts'

const PRIORITY_ORDER: readonly ConversationPriority[] = ['critical', 'high', 'medium', 'low', 'background']

function priorityRank(priority: ConversationPriority): number {
  return PRIORITY_ORDER.indexOf(priority)
}

// Implements ConversationQueueManager. Pure — `enqueue`/`dequeue` never
// mutate the given array, they return new ones. `dequeue` only ever
// considers `queued` entries (not `ready`/`running`/`waiting`/etc.) —
// the orchestrator transitions a dequeued entry to `ready` then
// `running` itself; a `waiting` (interrupted) conversation is resumed
// through ConversationLifecycleManager.resume(), not re-dequeued.
export class DefaultConversationQueueManager implements ConversationQueueManager {
  enqueue(queue: readonly ConversationState[], state: ConversationState): readonly ConversationState[] {
    return [...queue, state]
  }

  dequeue(queue: readonly ConversationState[]): DequeueResult {
    const queuedEntries = queue.filter((state) => state.lifecycle === 'queued')
    if (queuedEntries.length === 0) return { next: null, remaining: queue }

    const [next] = [...queuedEntries].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.createdAt.localeCompare(b.createdAt))
    if (!next) return { next: null, remaining: queue }

    return { next, remaining: queue.filter((state) => state.id !== next.id) }
  }
}

export function createConversationQueueManager(): ConversationQueueManager {
  return new DefaultConversationQueueManager()
}
