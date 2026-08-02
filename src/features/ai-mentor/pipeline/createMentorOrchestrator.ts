import { createLearningIntelligenceEngine } from '@/features/learning-intelligence/engine'
import type { LearningIntelligenceEngine } from '@/features/learning-intelligence/contracts'
import type { Document, LearningPlan } from '@/features/learning-intelligence/types'
import { createConversationStore, createMentorMemory, createMentorMessage, randomIdGenerator, systemClock } from '../conversation'
import { MentorEventBus } from '../events'
import type { Clock, ConversationStore, IdGenerator, MentorOrchestrator, MentorPipeline, MentorMemory, MentorUIResponse, StartMentorSessionResult } from '../contracts'
import type { MentorSession } from '../types'
import { createConversationOrchestrator } from '../conversation'
import { createMentorPipeline } from './createMentorPipeline'

export type MentorOrchestratorDependencies = {
  learningIntelligenceEngine: LearningIntelligenceEngine
  conversationStore: ConversationStore
  mentorMemory: MentorMemory
  pipeline: MentorPipeline
  eventBus: MentorEventBus
  idGenerator: IdGenerator
  clock: Clock
}

function createDefaultDependencies(): MentorOrchestratorDependencies {
  return {
    learningIntelligenceEngine: createLearningIntelligenceEngine(),
    conversationStore: createConversationStore(),
    mentorMemory: createMentorMemory(),
    pipeline: createMentorPipeline(),
    eventBus: new MentorEventBus(),
    idGenerator: randomIdGenerator,
    clock: systemClock,
  }
}

// Implements MentorOrchestrator — the sprint's top-level integration
// point. Delegates session lifecycle (start/end) to an internally-held
// ConversationOrchestrator (Chunk 3, unmodified), constructed to share
// this instance's own `conversationStore`/`mentorMemory`/`idGenerator`/
// `clock`/`eventBus` — so session bookkeeping is never reimplemented
// here. `sendMentorMessage` does *not* delegate to
// ConversationOrchestrator.sendMessage(), since that method has no way
// to receive fresh insights/recommendations (Chunk 3's own contract
// has no such seam, and Chunk 3 is locked) — instead it appends the
// learner message directly via the shared conversationStore, runs the
// injected MentorPipeline for real Learning-Intelligence-aware
// composition, and appends the resulting reply. Both paths write to
// the exact same conversation transcript.
class DefaultMentorOrchestrator implements MentorOrchestrator {
  private readonly deps: MentorOrchestratorDependencies
  private readonly conversationOrchestrator: ReturnType<typeof createConversationOrchestrator>
  private currentPlan: LearningPlan | null = null
  private currentLearningProjectId: string | null = null

  constructor(overrides: Partial<MentorOrchestratorDependencies> = {}) {
    this.deps = { ...createDefaultDependencies(), ...overrides }
    this.conversationOrchestrator = createConversationOrchestrator({
      conversationStore: this.deps.conversationStore,
      mentorMemory: this.deps.mentorMemory,
      idGenerator: this.deps.idGenerator,
      clock: this.deps.clock,
      eventBus: this.deps.eventBus,
    })
  }

  getEventBus(): MentorEventBus {
    return this.deps.eventBus
  }

  async startMentorSession(document: Document, learningProjectId: string): Promise<StartMentorSessionResult> {
    const plan = await this.deps.learningIntelligenceEngine.generateLearningPlan(document)
    this.currentPlan = plan
    this.currentLearningProjectId = learningProjectId

    const { session, conversation } = await this.conversationOrchestrator.startSession(learningProjectId)

    return { session, conversation, plan }
  }

  async sendMentorMessage(conversationId: string, content: string): Promise<MentorUIResponse> {
    if (!this.currentPlan || !this.currentLearningProjectId) {
      throw new Error('No active mentor session — call startMentorSession first.')
    }

    const learnerMessage = createMentorMessage({ role: 'learner', content }, this.deps.idGenerator, this.deps.clock)
    const conversation = await this.deps.conversationStore.appendMessage(conversationId, learnerMessage)
    this.deps.eventBus.emit({ id: this.deps.idGenerator.generate(), type: 'message-sent', occurredAt: this.deps.clock.now(), payload: { message: learnerMessage } })

    const memory = await this.deps.mentorMemory.recall(this.currentLearningProjectId)

    const uiResponse = await this.deps.pipeline.run({
      learningProjectId: this.currentLearningProjectId,
      plan: this.currentPlan,
      conversation,
      memory,
    })

    await this.deps.conversationStore.appendMessage(conversationId, uiResponse.reply)
    this.deps.eventBus.emit({ id: this.deps.idGenerator.generate(), type: 'message-received', occurredAt: this.deps.clock.now(), payload: { message: uiResponse.reply } })

    return uiResponse
  }

  async endMentorSession(): Promise<MentorSession> {
    const session = await this.conversationOrchestrator.endSession()
    this.currentPlan = null
    this.currentLearningProjectId = null
    return session
  }
}

export function createMentorOrchestrator(overrides: Partial<MentorOrchestratorDependencies> = {}): MentorOrchestrator & { getEventBus: () => MentorEventBus } {
  return new DefaultMentorOrchestrator(overrides)
}
