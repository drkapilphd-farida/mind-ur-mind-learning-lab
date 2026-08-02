import type { SessionContextLifecycleState } from '../domain'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `closed` -> `active`) — a genuine domain failure, never
// silently applied.
export class IllegalSessionContextLifecycleTransitionError extends Error {
  constructor(from: SessionContextLifecycleState, to: SessionContextLifecycleState) {
    super(`Illegal session context lifecycle transition: "${from}" -> "${to}"`)
    this.name = 'IllegalSessionContextLifecycleTransitionError'
  }
}
