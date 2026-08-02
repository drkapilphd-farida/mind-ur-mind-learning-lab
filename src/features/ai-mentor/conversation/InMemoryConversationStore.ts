import type { ConversationStore } from '../contracts'
import type { Conversation, MentorMessage } from '../types'
import { ConversationNotFoundError } from './ConversationNotFoundError'

// Implements ConversationStore. Fully in-memory — no database, no
// network — per this chunk's "completely independent from ... Database"
// rule. Shaped exactly like a real persistence layer (get/save/append,
// all async) so a future Supabase-backed store implements this same
// interface with zero change to any caller.
export class InMemoryConversationStore implements ConversationStore {
  private readonly conversations = new Map<string, Conversation>()

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation)
  }

  async appendMessage(conversationId: string, message: MentorMessage): Promise<Conversation> {
    const existing = this.conversations.get(conversationId)
    if (!existing) throw new ConversationNotFoundError(conversationId)

    const updated: Conversation = {
      ...existing,
      messages: [...existing.messages, message],
      updatedAt: message.createdAt,
    }
    this.conversations.set(conversationId, updated)
    return updated
  }
}

export function createConversationStore(): ConversationStore {
  return new InMemoryConversationStore()
}
