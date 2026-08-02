import type { PersonalizationLifecycleState } from '../domain'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `archived` -> `active`) — a genuine domain failure, never
// silently applied.
export class IllegalPersonalizationLifecycleTransitionError extends Error {
  constructor(from: PersonalizationLifecycleState, to: PersonalizationLifecycleState) {
    super(`Illegal personalization lifecycle transition: "${from}" -> "${to}"`)
    this.name = 'IllegalPersonalizationLifecycleTransitionError'
  }
}
