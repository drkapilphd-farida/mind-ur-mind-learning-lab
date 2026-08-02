// Thrown by InMemoryConversationStore.appendMessage() for an unknown
// conversationId — a genuine, specific error rather than silently
// creating a conversation on the fly. Self-contained to this feature,
// same pattern as
// `@/features/learning-intelligence/parsers/UnsupportedDocumentTypeError`.
export class ConversationNotFoundError extends Error {
  constructor(conversationId: string) {
    super(`No conversation found with id: ${conversationId}`)
    this.name = 'ConversationNotFoundError'
  }
}
