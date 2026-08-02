// Thrown only if a ConversationTrigger somehow has no matching rule in
// CONVERSATION_RULES — genuinely unreachable with the catalog as
// shipped (every trigger has exactly one rule), but a real, catchable
// failure rather than a silent fallback.
export class UnknownTriggerError extends Error {
  constructor(trigger: string) {
    super(`No conversation rule registered for trigger: ${trigger}`)
    this.name = 'UnknownTriggerError'
  }
}
