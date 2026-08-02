import type { Conversation, MentorContext, MentorMessage, MentorSession } from '../types'

export type StartSessionResult = {
  session: MentorSession
  conversation: Conversation
}

// "Mentor Response Pipeline" — the full sequence a learner message
// travels: append → build context → build prompt → generate a reply
// (via ProviderAdapter, mocked this sprint) → append the reply.
// `context` is returned alongside the two messages so a caller can
// inspect exactly what informed the reply, without a second call.
export type SendMessageResult = {
  learnerMessage: MentorMessage
  mentorReply: MentorMessage
  context: MentorContext
}

// "Conversation Orchestrator" — the one contract Chunk 3's
// conversation/createConversationOrchestrator.ts implements, composing
// ConversationStore + MentorMemory + ContextBuilder + PromptBuilder +
// ProviderAdapter + the conversation state container into a single
// callable unit. A future real implementation (e.g. persisting to
// Supabase, calling a real provider) implements this exact interface;
// nothing that calls startSession/sendMessage/endSession needs to
// change.
export interface ConversationOrchestrator {
  startSession(learningProjectId: string): Promise<StartSessionResult>
  sendMessage(conversationId: string, content: string): Promise<SendMessageResult>
  endSession(): Promise<MentorSession>
}
