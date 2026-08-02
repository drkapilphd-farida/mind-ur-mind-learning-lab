import { MentorEventBus } from '../events'
import type { ConversationOrchestrator, ConversationStore, ContextBuilder, MentorMemory, PromptBuilder, ProviderAdapter, SendMessageResult, StartSessionResult } from '../contracts'
import type { Clock, IdGenerator } from '../contracts'
import type { MentorEvent, MentorSession } from '../types'
import { ConversationStateContainer } from './ConversationStateContainer'
import { createMentorMessage } from './createMentorMessage'
import { createMentorSession } from './createMentorSession'
import { createContextBuilder } from './MockContextBuilder'
import { createConversationStore } from './InMemoryConversationStore'
import { createMentorMemory } from './InMemoryMentorMemory'
import { createProviderAdapter } from './MockProviderAdapter'
import { createPromptBuilder } from './MockPromptBuilder'
import { randomIdGenerator } from './randomIdGenerator'
import { systemClock } from './systemClock'

export type ConversationOrchestratorDependencies = {
  conversationStore: ConversationStore
  mentorMemory: MentorMemory
  contextBuilder: ContextBuilder
  promptBuilder: PromptBuilder
  providerAdapter: ProviderAdapter
  eventBus: MentorEventBus
  idGenerator: IdGenerator
  clock: Clock
}

// A fresh set of real mock dependencies per call — never a shared
// module-level singleton, so two orchestrators (e.g. in two tests, or
// two learning projects) never leak state into each other.
function createDefaultDependencies(): ConversationOrchestratorDependencies {
  return {
    conversationStore: createConversationStore(),
    mentorMemory: createMentorMemory(),
    contextBuilder: createContextBuilder(),
    promptBuilder: createPromptBuilder(),
    providerAdapter: createProviderAdapter(),
    eventBus: new MentorEventBus(),
    idGenerator: randomIdGenerator,
    clock: systemClock,
  }
}

// Implements ConversationOrchestrator — "Conversation Orchestrator" +
// "Mentor Response Pipeline" (the `sendMessage` method's full
// sequence). Models a single active session/conversation at a time,
// mirroring MentorState's own singular `session`/`conversation` fields
// (Chunk 1) — not a multi-conversation manager. Every dependency is
// injected, defaulting to this chunk's mock implementations, so
// "everything mocked through dependency injection" (Chunk 4's own
// stated goal) is already true today, one sprint early.
class DefaultConversationOrchestrator implements ConversationOrchestrator {
  private readonly deps: ConversationOrchestratorDependencies
  private readonly stateContainer = new ConversationStateContainer()

  constructor(overrides: Partial<ConversationOrchestratorDependencies> = {}) {
    this.deps = { ...createDefaultDependencies(), ...overrides }
  }

  getEventBus(): MentorEventBus {
    return this.deps.eventBus
  }

  private emit<TType extends MentorEvent['type']>(event: MentorEvent<TType>): void {
    this.deps.eventBus.emit(event)
  }

  async startSession(learningProjectId: string): Promise<StartSessionResult> {
    const { session, conversation } = createMentorSession(learningProjectId, this.deps.idGenerator, this.deps.clock)

    this.stateContainer.dispatch({ type: 'SESSION_STARTED', session })
    this.stateContainer.dispatch({ type: 'CONVERSATION_STARTED', conversation })
    await this.deps.conversationStore.saveConversation(conversation)

    this.emit({ id: this.deps.idGenerator.generate(), type: 'session-started', occurredAt: this.deps.clock.now(), payload: { session } })

    return { session, conversation }
  }

  async sendMessage(conversationId: string, content: string): Promise<SendMessageResult> {
    const learnerMessage = createMentorMessage({ role: 'learner', content }, this.deps.idGenerator, this.deps.clock)
    this.stateContainer.dispatch({ type: 'MESSAGE_APPENDED', message: learnerMessage })
    const conversation = await this.deps.conversationStore.appendMessage(conversationId, learnerMessage)
    this.emit({ id: this.deps.idGenerator.generate(), type: 'message-sent', occurredAt: this.deps.clock.now(), payload: { message: learnerMessage } })

    const state = this.stateContainer.getState()
    const memory = await this.deps.mentorMemory.recall(conversation.learningProjectId)

    const context = await this.deps.contextBuilder.build({
      learningProjectId: conversation.learningProjectId,
      conversation,
      insights: state.insights,
      recommendations: state.recommendations,
      memory,
    })

    const prompt = this.deps.promptBuilder.build(context)
    const reply = await this.deps.providerAdapter.generateReply(prompt, context)

    const mentorReply = createMentorMessage({ role: 'mentor', content: reply.content }, this.deps.idGenerator, this.deps.clock)
    this.stateContainer.dispatch({ type: 'MESSAGE_APPENDED', message: mentorReply })
    await this.deps.conversationStore.appendMessage(conversationId, mentorReply)
    this.emit({ id: this.deps.idGenerator.generate(), type: 'message-received', occurredAt: this.deps.clock.now(), payload: { message: mentorReply } })

    return { learnerMessage, mentorReply, context }
  }

  async endSession(): Promise<MentorSession> {
    const current = this.stateContainer.getState().session
    if (!current) throw new Error('No active session to end.')

    const endedAt = this.deps.clock.now()
    this.stateContainer.dispatch({ type: 'SESSION_ENDED', endedAt })

    const session = this.stateContainer.getState().session
    if (!session) throw new Error('No active session to end.')

    this.emit({ id: this.deps.idGenerator.generate(), type: 'session-ended', occurredAt: endedAt, payload: { session } })
    return session
  }
}

// The factory's return type widens past the bare ConversationOrchestrator
// contract to also expose `getEventBus()` — useful for a future caller
// (e.g. a UI layer) that wants to subscribe to session/message events,
// without adding an event-bus-specific method to the contract itself
// (a future real implementation may not use MentorEventBus the same
// way).
export function createConversationOrchestrator(overrides: Partial<ConversationOrchestratorDependencies> = {}): ConversationOrchestrator & { getEventBus: () => MentorEventBus } {
  return new DefaultConversationOrchestrator(overrides)
}
