import type { ConversationLifecycleState, ConversationState } from '../types'
import type { ConversationLifecycleManager } from '../contracts'
import { IllegalLifecycleTransitionError } from '../errors'

const TERMINAL_STATES = new Set<ConversationLifecycleState>(['completed', 'dismissed', 'expired'])

function transition(state: ConversationState, allowedFrom: readonly ConversationLifecycleState[], to: ConversationLifecycleState): ConversationState {
  if (!allowedFrom.includes(state.lifecycle)) throw new IllegalLifecycleTransitionError(state.lifecycle, to)
  return { ...state, lifecycle: to }
}

// Implements ConversationLifecycleManager — the exact legal transition
// graph: Queued -> Ready -> Running -> Completed, with Running <-> Waiting
// ("resume interrupted conversations") and Queued/Ready/Waiting ->
// Dismissed. Every explicit transition (`markReady`, `markRunning`, ...)
// throws on an illegal source state — a deliberate, single intended
// move. `expireIfStale` is the one exception: a safe, bulk-friendly
// no-op for a terminal state or a state with no expiry or one not yet
// due, so a caller can call it across a whole queue without per-item
// guards.
export class DefaultConversationLifecycleManager implements ConversationLifecycleManager {
  markReady(state: ConversationState): ConversationState {
    return transition(state, ['queued'], 'ready')
  }

  markRunning(state: ConversationState): ConversationState {
    return transition(state, ['ready'], 'running')
  }

  markWaiting(state: ConversationState): ConversationState {
    return transition(state, ['running'], 'waiting')
  }

  resume(state: ConversationState): ConversationState {
    return transition(state, ['waiting'], 'running')
  }

  markCompleted(state: ConversationState): ConversationState {
    return transition(state, ['running'], 'completed')
  }

  markDismissed(state: ConversationState): ConversationState {
    return transition(state, ['queued', 'ready', 'waiting'], 'dismissed')
  }

  expireIfStale(state: ConversationState, now: string): ConversationState {
    if (TERMINAL_STATES.has(state.lifecycle)) return state
    if (state.expiresAt === null) return state
    if (now < state.expiresAt) return state
    return { ...state, lifecycle: 'expired' }
  }
}

export function createConversationLifecycleManager(): ConversationLifecycleManager {
  return new DefaultConversationLifecycleManager()
}
