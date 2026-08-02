import type { StreamingState } from '../types'

// One of the brief's own 10 named responsibilities. Pure — enforces the fixed
// "## Streaming States" (§ brief) transition graph; throws
// `IllegalStreamingTransitionError` for anything outside it. `paused` is the
// first state in this whole arc reachable from and returning to a
// non-terminal state other than its own predecessor — see the transition
// table in `DefaultStreamingStateMachine.ts` for the full graph.
export interface StreamingStateMachine {
  transition(from: StreamingState, to: StreamingState): StreamingState
}
