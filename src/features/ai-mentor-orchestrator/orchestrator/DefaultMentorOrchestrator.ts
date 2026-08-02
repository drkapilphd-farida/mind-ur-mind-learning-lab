import { createConversationEngine, type ConversationEngine, type ConversationSession } from '@/features/mentor-conversation-engine'
import type { ConversationState, DispatchResult, TriggerEvent } from '../types'
import type { ConversationDispatcher, ConversationLifecycleManager, ConversationQueueManager, MentorOrchestrator, ProcessNextResult } from '../contracts'
import { createConversationDispatcher } from '../dispatching'
import { createConversationQueueManager } from '../queueing'
import { createConversationLifecycleManager } from '../lifecycle'

export type MentorOrchestratorDependencies = {
  dispatcher: ConversationDispatcher
  queueManager: ConversationQueueManager
  lifecycleManager: ConversationLifecycleManager
  // Sprint 10's real ConversationEngine, unmodified — this is where
  // "Support future AI provider execution" actually lives: a future
  // real-provider-backed ConversationResponseGenerator (Sprint 10's own
  // seam) plugs in there, and this orchestrator inherits it for free.
  conversationEngine: ConversationEngine
}

function createDefaultDependencies(): MentorOrchestratorDependencies {
  return {
    dispatcher: createConversationDispatcher(),
    queueManager: createConversationQueueManager(),
    lifecycleManager: createConversationLifecycleManager(),
    conversationEngine: createConversationEngine(),
  }
}

// Implements MentorOrchestrator — "the central decision engine that
// controls every mentor interaction." `handleTrigger` delegates
// straight to ConversationDispatcher (select + dedupe + prioritize).
// `processNext` dequeues the single highest-priority `queued` entry,
// walks it Queued -> Ready -> Running via ConversationLifecycleManager,
// actually runs it through Sprint 10's ConversationEngine, then marks
// it Completed. `expireStale` sweeps the whole queue through
// `expireIfStale` — safe to call on every entry regardless of state.
export class DefaultMentorOrchestrator implements MentorOrchestrator {
  constructor(private readonly dependencies: MentorOrchestratorDependencies) {}

  handleTrigger(event: TriggerEvent, queue: readonly ConversationState[]): DispatchResult {
    return this.dependencies.dispatcher.dispatch(event, queue)
  }

  async processNext(queue: readonly ConversationState[], session: ConversationSession): Promise<ProcessNextResult> {
    const { next, remaining } = this.dependencies.queueManager.dequeue(queue)
    if (!next) return { outcome: null, session, queue }

    const ready = this.dependencies.lifecycleManager.markReady(next)
    const running = this.dependencies.lifecycleManager.markRunning(ready)

    const { session: updatedSession, response } = await this.dependencies.conversationEngine.respond(session, running.context)

    const completed = this.dependencies.lifecycleManager.markCompleted(running)

    return {
      outcome: { state: completed, response, reason: `Ran "${completed.conversationType}" for learner ${completed.learnerId}.` },
      session: updatedSession,
      queue: remaining,
    }
  }

  expireStale(queue: readonly ConversationState[], now: string): readonly ConversationState[] {
    return queue.map((state) => this.dependencies.lifecycleManager.expireIfStale(state, now))
  }
}

export function createMentorOrchestrator(overrides: Partial<MentorOrchestratorDependencies> = {}): MentorOrchestrator {
  return new DefaultMentorOrchestrator({ ...createDefaultDependencies(), ...overrides })
}
