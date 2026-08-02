import type { SessionState } from '../types'

// One of the brief's own 10 named responsibilities. Pure — enforces
// the fixed "## Session States" (§ brief) transition graph; throws
// `IllegalSessionTransitionError` for anything outside it.
export interface SessionStateMachine {
  transition(from: SessionState, to: SessionState): SessionState
}
