// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/memory-persistence/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file.
import type { Clock, IdGenerator } from './contracts'
import type { ContextEntry, ContextMetadata, ContextSnapshot, SessionContext } from './domain'

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

export function makeContextMetadata(overrides: Partial<ContextMetadata> = {}): ContextMetadata {
  return { ownerId: 'learner-1', source: 'test', tags: [], ...overrides }
}

export function makeContextEntry(overrides: Partial<ContextEntry> = {}): ContextEntry {
  return {
    id: 'entry-1',
    memoryReferenceId: 'memory-1',
    summary: 'A short summary of the referenced memory.',
    addedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeSessionContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    id: 'session-1',
    lifecycle: 'active',
    entries: [],
    metadata: makeContextMetadata(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeContextSnapshot(overrides: Partial<ContextSnapshot> = {}): ContextSnapshot {
  return {
    id: 'snapshot-1',
    sessionId: 'session-1',
    entries: [],
    capturedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
