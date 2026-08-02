import type { MemoryLifecycleState } from '../domain'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `deleted` -> `active`) — a genuine domain failure, never
// silently applied.
export class IllegalMemoryLifecycleTransitionError extends Error {
  constructor(from: MemoryLifecycleState, to: MemoryLifecycleState) {
    super(`Illegal memory lifecycle transition: "${from}" -> "${to}"`)
    this.name = 'IllegalMemoryLifecycleTransitionError'
  }
}
