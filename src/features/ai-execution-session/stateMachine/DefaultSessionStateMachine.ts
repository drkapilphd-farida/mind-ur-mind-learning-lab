import type { SessionState } from '../types'
import { IllegalSessionTransitionError } from './IllegalSessionTransitionError'
import type { SessionStateMachine } from './SessionStateMachine'

// The legal transition graph — the linear happy path
// (`created→initialized→running→waiting-for-response→completed`) plus
// `running`/`waiting-for-response`→`failed`, plus every non-terminal
// state may also transition to `cancelled` — cancellation can happen
// at any point mid-flight, same precedent as
// `provider-execution-engine`'s own `transitionExecutionState.ts`
// (Sprint 35).
const ALLOWED_TRANSITIONS: Record<SessionState, readonly SessionState[]> = {
  created: ['initialized', 'cancelled'],
  initialized: ['running', 'cancelled'],
  running: ['waiting-for-response', 'failed', 'cancelled'],
  'waiting-for-response': ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
}

export class DefaultSessionStateMachine implements SessionStateMachine {
  transition(from: SessionState, to: SessionState): SessionState {
    const allowed = ALLOWED_TRANSITIONS[from]
    if (!allowed.includes(to)) throw new IllegalSessionTransitionError(from, to)
    return to
  }
}

export function createSessionStateMachine(): SessionStateMachine {
  return new DefaultSessionStateMachine()
}
