import type { ConversationRule, TriggerEvent } from '../types'
import type { ConversationResolver } from '../contracts'
import { CONVERSATION_RULES } from '../rules'
import { UnknownTriggerError } from '../errors'

// Implements ConversationResolver. Pure lookup — the same trigger
// always resolves to the same rule.
export class DefaultConversationResolver implements ConversationResolver {
  resolve(event: TriggerEvent): ConversationRule {
    const rule = CONVERSATION_RULES.find((candidate) => candidate.trigger === event.trigger)
    if (!rule) throw new UnknownTriggerError(event.trigger)
    return rule
  }
}

export function createConversationResolver(): ConversationResolver {
  return new DefaultConversationResolver()
}
