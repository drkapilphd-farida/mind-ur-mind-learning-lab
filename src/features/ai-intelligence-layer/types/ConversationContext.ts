// The Conversation Context Engine's™ output — structured, in-memory
// only ("Do NOT build persistent storage" — this type has no id/
// timestamps/store-backed fields, just the shape a caller who already
// holds conversation state hands in and gets normalized back).
export type ConversationContext = {
  currentTopic: string | null
  previousQuestions: readonly string[]
  conversationSummary: string | null
  learningIntent: string | null
  pendingTasks: readonly string[]
}
