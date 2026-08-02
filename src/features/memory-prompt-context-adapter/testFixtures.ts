// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/memory-persistence/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file.
import type { ContextPackage } from '@/features/memory-context-assembly'
import type { Clock, IdGenerator } from './contracts'
import type { ContextPayload, ContextPayloadReference, ContextPayloadSection } from './domain'

export function makeFixedClock(fixedNow = '2026-01-01T00:00:00.000Z'): Clock {
  return { now: () => fixedNow }
}

// Returns each given value in order on successive calls, then repeats
// the last one — used to deterministically test
// `AdapterDiagnostics.transformationDurationMs` (a "before" and
// "after" reading from the same clock).
export function makeSequentialClock(...values: readonly string[]): Clock {
  let index = 0
  return {
    now: () => {
      const value = values[Math.min(index, values.length - 1)]!
      index += 1
      return value
    },
  }
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

export function makeContextPackage(overrides: Partial<ContextPackage> = {}): ContextPackage {
  return {
    id: 'package-1',
    sections: [
      {
        id: 'section-high',
        priority: 'high',
        references: [{ memoryId: 'memory-1', priority: 'high', reason: 'importance=high' }],
      },
    ],
    metadata: { sessionId: null, generatedAt: '2026-01-01T00:00:00.000Z', version: 1 },
    ...overrides,
  }
}

export function makeContextPayloadReference(overrides: Partial<ContextPayloadReference> = {}): ContextPayloadReference {
  return { memoryId: 'memory-1', priority: 'high', reason: 'importance=high', ...overrides }
}

export function makeContextPayloadSection(overrides: Partial<ContextPayloadSection> = {}): ContextPayloadSection {
  return { id: 'section-high', priority: 'high', references: [makeContextPayloadReference()], ...overrides }
}

export function makeContextPayload(overrides: Partial<ContextPayload> = {}): ContextPayload {
  return {
    id: 'payload-1',
    sections: [makeContextPayloadSection()],
    metadata: {
      sessionId: null,
      sourcePackageId: 'package-1',
      sourcePackageVersion: 1,
      generatedAt: '2026-01-01T00:00:00.000Z',
      payloadVersion: 1,
    },
    ...overrides,
  }
}
