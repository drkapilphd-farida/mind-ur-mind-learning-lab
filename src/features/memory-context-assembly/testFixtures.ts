// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/memory-persistence/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file. `makeMemory` is a local fixture (not imported
// from `@/features/memory-persistence/testFixtures.ts`, which isn't
// part of that feature's public `index.ts` surface) — it constructs
// the same `Memory` shape independently for this feature's own tests.
import type { Memory } from '@/features/memory-persistence'
import type { SessionContext } from '@/features/memory-session-context'
import type { Clock, IdGenerator } from './contracts'
import type { ContextPackage, ContextReference, ContextSection } from './domain'

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

export function makeMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: 'memory-1',
    type: 'exercise',
    importance: 'medium',
    content: 'Completed the reading warm-up exercise.',
    pinned: false,
    metadata: { learnerId: 'learner-1', source: 'exercise-engine', tags: [] },
    lifecycle: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeSessionContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    id: 'session-1',
    lifecycle: 'active',
    entries: [],
    metadata: { ownerId: 'learner-1', source: 'test', tags: [] },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeContextReference(overrides: Partial<ContextReference> = {}): ContextReference {
  return { memoryId: 'memory-1', priority: 'medium', reason: 'importance=medium, lifecycle=active', ...overrides }
}

export function makeContextSection(overrides: Partial<ContextSection> = {}): ContextSection {
  return { id: 'section-medium', priority: 'medium', references: [makeContextReference()], ...overrides }
}

export function makeContextPackage(overrides: Partial<ContextPackage> = {}): ContextPackage {
  return {
    id: 'package-1',
    sections: [],
    metadata: { sessionId: null, generatedAt: '2026-01-01T00:00:00.000Z', version: 1 },
    ...overrides,
  }
}
