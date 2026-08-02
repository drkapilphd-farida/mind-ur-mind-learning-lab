// The Conversation Layer (Sprint 4, Chunk 3) — everything a learner
// message travels through: Message Contracts, Conversation Session,
// Conversation Memory, Conversation Context, Prompt Builder, and the
// Conversation Orchestrator that composes them into the Mentor
// Response Pipeline. `createConversationOrchestrator` is the intended
// entry point for any future caller (Chunk 4's integration layer, or a
// future UI) — never construct the individual pieces directly.

export { createConversationOrchestrator, type ConversationOrchestratorDependencies } from './createConversationOrchestrator'
export { ConversationStateContainer } from './ConversationStateContainer'
export { createMentorMessage, type CreateMentorMessageInput } from './createMentorMessage'
export { createMentorSession, type CreatedSession } from './createMentorSession'
export { createConversationStore, InMemoryConversationStore } from './InMemoryConversationStore'
export { createMentorMemory, InMemoryMentorMemory } from './InMemoryMentorMemory'
export { createContextBuilder, MockContextBuilder } from './MockContextBuilder'
export { createPromptBuilder, MockPromptBuilder } from './MockPromptBuilder'
export { createProviderAdapter, MockProviderAdapter } from './MockProviderAdapter'
export { ConversationNotFoundError } from './ConversationNotFoundError'
export { systemClock } from './systemClock'
export { randomIdGenerator } from './randomIdGenerator'
