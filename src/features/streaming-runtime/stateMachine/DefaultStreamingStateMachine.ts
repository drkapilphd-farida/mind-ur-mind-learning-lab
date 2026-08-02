import type { StreamingState } from '../types'
import { IllegalStreamingTransitionError } from './IllegalStreamingTransitionError'
import type { StreamingStateMachine } from './StreamingStateMachine'

// Cancellation reachable from every non-terminal state (idle/starting/streaming/
// paused), matching Sprint 42's `SessionStateMachine` precedent. `paused` is
// reachable only from `streaming` and returns only to `streaming` or a terminal
// state — see `DefaultStreamingLifecycleManager`'s header comment for why `run()`
// never organically traverses it.
const ALLOWED_TRANSITIONS: Record<StreamingState, readonly StreamingState[]> = {
  idle: ['starting', 'cancelled'],
  starting: ['streaming', 'failed', 'cancelled'],
  streaming: ['paused', 'completed', 'failed', 'cancelled'],
  paused: ['streaming', 'failed', 'cancelled'],
  completed: [],
  cancelled: [],
  failed: [],
}

export class DefaultStreamingStateMachine implements StreamingStateMachine {
  transition(from: StreamingState, to: StreamingState): StreamingState {
    const allowed = ALLOWED_TRANSITIONS[from]
    if (!allowed.includes(to)) throw new IllegalStreamingTransitionError(from, to)
    return to
  }
}

export function createStreamingStateMachine(): StreamingStateMachine {
  return new DefaultStreamingStateMachine()
}
