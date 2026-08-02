import type { ConversationRule, TriggerEvent } from '../types'

// "Select the correct conversation" — a pure, deterministic lookup from
// TriggerEvent.trigger to the one ConversationRule that governs it.
export interface ConversationResolver {
  resolve(event: TriggerEvent): ConversationRule
}
