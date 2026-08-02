import type { ConversationContext, ConversationHistory, ConversationSession, ConversationTurn } from '../types'
import type { Clock, ConversationEngine, ConversationMemoryBuilder, ConversationResponseGenerator, IdGenerator, PromptComposer, RespondResult } from '../contracts'
import { createConversationMemoryBuilder } from '../memory'
import { createPromptComposer } from '../promptComposition'
import { createConversationResponseGenerator } from '../responseGeneration'
import { randomIdGenerator, systemClock } from '../adapters'

export type ConversationEngineDependencies = {
  memoryBuilder: ConversationMemoryBuilder
  promptComposer: PromptComposer
  responseGenerator: ConversationResponseGenerator
  idGenerator: IdGenerator
  clock: Clock
}

function createDefaultDependencies(): ConversationEngineDependencies {
  return {
    memoryBuilder: createConversationMemoryBuilder(),
    promptComposer: createPromptComposer(),
    responseGenerator: createConversationResponseGenerator(),
    idGenerator: randomIdGenerator,
    clock: systemClock,
  }
}

// Implements ConversationEngine — composes every other piece in this
// feature into "multi-turn conversations": `respond()` never mutates
// the given session, it composes a prompt (PromptComposer, using the
// session's own current memory), generates a response
// (ConversationResponseGenerator), appends a new mentor turn, and
// rebuilds memory from the updated history (ConversationMemoryBuilder)
// — a caller drives multiple turns by feeding each returned session
// back into the next `respond()` call.
export class DefaultConversationEngine implements ConversationEngine {
  constructor(private readonly dependencies: ConversationEngineDependencies) {}

  startSession(learnerId: string): ConversationSession {
    const emptyHistory: ConversationHistory = { turns: [] }

    return {
      id: this.dependencies.idGenerator.generate(),
      learnerId,
      startedAt: this.dependencies.clock.now(),
      history: emptyHistory,
      memory: this.dependencies.memoryBuilder.build(emptyHistory),
    }
  }

  async respond(session: ConversationSession, context: ConversationContext): Promise<RespondResult> {
    const promptPackage = this.dependencies.promptComposer.compose(context, session.memory)
    const response = await this.dependencies.responseGenerator.generate(promptPackage, context)

    const mentorTurn: ConversationTurn = {
      id: this.dependencies.idGenerator.generate(),
      role: 'mentor',
      content: response.mainResponse,
      conversationType: context.conversationType,
      occurredAt: this.dependencies.clock.now(),
    }

    const history: ConversationHistory = { turns: [...session.history.turns, mentorTurn] }
    const memory = this.dependencies.memoryBuilder.build(history)

    return { session: { ...session, history, memory }, response }
  }
}

export function createConversationEngine(overrides: Partial<ConversationEngineDependencies> = {}): ConversationEngine {
  const defaults = createDefaultDependencies()
  const deps: ConversationEngineDependencies = { ...defaults, ...overrides }

  // If a test or caller injects a custom clock but did not explicitly
  // provide a responseGenerator, ensure the responseGenerator uses the
  // same clock for deterministic behaviour.
  if (overrides.clock && !overrides.responseGenerator) {
    deps.responseGenerator = createConversationResponseGenerator(overrides.clock)
  }

  return new DefaultConversationEngine(deps)
}
