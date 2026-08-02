import type { ExecutionState } from '../types'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `completed` -> `executing`) — a genuine domain failure, never
// silently applied.
export class IllegalExecutionTransitionError extends Error {
  constructor(from: ExecutionState, to: ExecutionState) {
    super(`Illegal execution state transition: "${from}" -> "${to}"`)
    this.name = 'IllegalExecutionTransitionError'
  }
}
