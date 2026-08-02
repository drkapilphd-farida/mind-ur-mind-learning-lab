// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { Clock, IdGenerator } from './contracts'
import type { MemoryCandidate, MemoryRecord, MemoryStore } from './types'

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

export function makeMemoryCandidate(overrides: Partial<MemoryCandidate> = {}): MemoryCandidate {
  return {
    learnerId: 'learner-1',
    category: 'exercise',
    summary: 'Completed the reading warm-up exercise.',
    occurredAt: '2026-01-01T00:00:00.000Z',
    data: {},
    ...overrides,
  }
}

export function makeMemoryRecord(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return {
    id: 'record-1',
    learnerId: 'learner-1',
    category: 'exercise',
    priority: 'low',
    retention: 'weekly',
    summary: 'Completed the reading warm-up exercise.',
    data: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: null,
    vectorEmbeddingId: null,
    ...overrides,
  }
}

export function makeMemoryStore(records: readonly MemoryRecord[] = []): MemoryStore {
  return { records }
}
