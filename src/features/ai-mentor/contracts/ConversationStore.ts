import type { Conversation, MentorMessage } from '../types'

// Implemented by an in-memory mock in Chunk 3. Shaped like a real
// persistence layer (get/save/append) so a future Supabase-backed store
// implements this exact interface — no change to any caller.
export interface ConversationStore {
  getConversation(id: string): Promise<Conversation | null>
  saveConversation(conversation: Conversation): Promise<void>
  appendMessage(conversationId: string, message: MentorMessage): Promise<Conversation>
}
