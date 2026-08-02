import type { EventLifecycleState } from '../domain'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `archived` -> `published`) — a genuine domain failure, never
// silently applied.
export class IllegalEventLifecycleTransitionError extends Error {
  constructor(from: EventLifecycleState, to: EventLifecycleState) {
    super(`Illegal event lifecycle transition: "${from}" -> "${to}"`)
    this.name = 'IllegalEventLifecycleTransitionError'
  }
}
