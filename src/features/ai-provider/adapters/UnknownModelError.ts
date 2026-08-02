// Thrown by createMockAIProvider's generate()/estimateCost() for a
// modelId the provider doesn't have registered — a genuine, specific
// error rather than silently falling back to some other model. Self-
// contained to this feature, same pattern as
// `@/features/learning-intelligence/parsers/UnsupportedDocumentTypeError`
// and `@/features/ai-mentor/conversation/ConversationNotFoundError`.
export class UnknownModelError extends Error {
  constructor(providerId: string, modelId: string) {
    super(`Provider "${providerId}" has no model registered with id: ${modelId}`)
    this.name = 'UnknownModelError'
  }
}
