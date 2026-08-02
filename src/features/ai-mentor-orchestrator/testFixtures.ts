// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { ConversationContext } from '@/features/mentor-conversation-engine'
import type { Clock, IdGenerator } from './contracts'
import type { ConversationState, TriggerEvent } from './types'

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

export function makeTriggerEvent(overrides: Partial<TriggerEvent> = {}): TriggerEvent {
  return {
    trigger: 'daily-login',
    learnerId: 'learner-1',
    occurredAt: '2026-01-01T00:00:00.000Z',
    context: makeConversationContext(),
    ...overrides,
  }
}

export function makeConversationState(overrides: Partial<ConversationState> = {}): ConversationState {
  return {
    id: 'state-1',
    learnerId: 'learner-1',
    trigger: 'daily-login',
    conversationType: 'daily-motivation',
    priority: 'low',
    lifecycle: 'queued',
    context: makeConversationContext(),
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: null,
    ...overrides,
  }
}
