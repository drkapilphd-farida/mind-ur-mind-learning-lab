// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/memory-persistence/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file.
import type { Clock, IdGenerator } from './contracts'
import type { EventMetadata, MemoryEvent } from './domain'

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

export function makeEventMetadata(overrides: Partial<EventMetadata> = {}): EventMetadata {
  return { subjectId: 'memory-1', userId: 'learner-1', tags: [], ...overrides }
}

export function makeMemoryEvent(overrides: Partial<MemoryEvent> = {}): MemoryEvent {
  return {
    id: 'event-1',
    type: 'memory-created',
    source: 'memory-persistence',
    state: 'recorded',
    metadata: makeEventMetadata(),
    payload: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
