import type { RuntimeState } from '../types'

// One of the brief's own 10 named responsibilities. Pure — enforces
// the fixed linear Execution Flow order; throws
// `IllegalRuntimeStateTransitionError` for anything outside it.
export interface RuntimeLifecycleManager {
  transition(from: RuntimeState, to: RuntimeState): RuntimeState
}
