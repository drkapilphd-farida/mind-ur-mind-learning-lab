import type { ConversationContext, ConversationResponse, ConversationSession } from '../types'

export type RespondResult = {
  session: ConversationSession
  response: ConversationResponse
}

// ConversationEngine™ — the top-level entry point. `respond` is async
// (see ConversationResponseGenerator's own "future provider injection"
// note) but never awaits anything real today. Pure: returns a *new*
// ConversationSession rather than mutating the one passed in —
// "multi-turn conversations" means calling `respond` repeatedly with
// each returned session, not holding mutable state inside the engine.
export interface ConversationEngine {
  startSession(learnerId: string): ConversationSession
  respond(session: ConversationSession, context: ConversationContext): Promise<RespondResult>
}
