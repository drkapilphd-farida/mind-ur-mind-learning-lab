// Implemented by an in-memory mock in Chunk 3. "Memory" here means
// durable facts about a learner the mentor should keep in mind across
// conversations (e.g. "prefers short sessions") — distinct from
// ConversationStore's message history, which is one conversation's
// transcript.
export interface MentorMemory {
  remember(learningProjectId: string, fact: string): Promise<void>
  recall(learningProjectId: string): Promise<readonly string[]>
}
