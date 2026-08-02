// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { Clock, IdGenerator } from './contracts'
import type { ConversationContext, ConversationHistory, ConversationTurn } from './types'

export function makeFixedClock(fixedNow = '2026-01-01T00:00:00.000Z'): Clock {
  return { now: () => fixedNow }
}

export function makeSequentialIdGenerator(prefix = 'id'): IdGenerator {
  let counter = 0
  return {
    generate: () => {
      counter += 1
      return `${prefix}-${counter}`
    },
  }
}

export function makeConversationContext(overrides: Partial<ConversationContext> = {}): ConversationContext {
  return {
    learnerName: 'Ada',
    conversationType: 'welcome',
    focusSkill: null,
    currentMilestone: null,
    recommendedExercise: null,
    progressPercent: null,
    streak: null,
    ...overrides,
  }
}

export function makeConversationTurn(overrides: Partial<ConversationTurn> = {}): ConversationTurn {
  return {
    id: 'turn-1',
    role: 'mentor',
    content: 'Hello!',
    conversationType: 'welcome',
    occurredAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeConversationHistory(turns: readonly ConversationTurn[] = []): ConversationHistory {
  return { turns }
}
