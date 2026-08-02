import type { ConversationLifecycleState } from '../types'

// Thrown by ConversationLifecycleManager when a transition doesn't
// exist in the legal transition graph (e.g. Completed -> Running) — a
// genuine domain failure, never silently applied.
export class IllegalLifecycleTransitionError extends Error {
  constructor(from: ConversationLifecycleState, to: ConversationLifecycleState) {
    super(`Illegal conversation lifecycle transition: "${from}" -> "${to}"`)
    this.name = 'IllegalLifecycleTransitionError'
  }
}
