// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-provider/testFixtures.ts`. Not itself a
// *.test.ts file, so vitest's `include` glob never picks it up as a
// test file.
import type { Clock, IdGenerator } from './contracts'
import type { Memory } from './domain'
import type { CreateMemoryQueryInput, MemoryQuery } from './query'
import { createMemoryQuery } from './query'
import type { IndexEntry, MemoryIndex } from './indexDomain'
import type { MemoryTransaction, TransactionMetadata, TransactionOperation } from './transactionDomain'
import type { CleanupPlan, MemoryRetentionPolicy, RetentionMetadata } from './retentionDomain'

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

// Sprint 14 — Memory Query & Filtering Engine fixtures. Additive only,
// nothing above this line changed.
export function makeMemoryQuery(overrides: Partial<CreateMemoryQueryInput> = {}): MemoryQuery {
  return createMemoryQuery({ userId: 'learner-1', ...overrides })
}

// Sprint 16 — Memory Indexing Infrastructure fixtures. Additive only,
// nothing above this line changed.
export function makeIndexEntry(overrides: Partial<IndexEntry> = {}): IndexEntry {
  return { key: 'exercise', memoryIds: ['memory-1'], ...overrides }
}

export function makeMemoryIndex(overrides: Partial<MemoryIndex> = {}): MemoryIndex {
  return {
    metadata: { indexType: 'type', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    entries: [],
    ...overrides,
  }
}

// Sprint 17 — Memory Transaction Engine fixtures. Additive only,
// nothing above this line changed.
export function makeTransactionMetadata(overrides: Partial<TransactionMetadata> = {}): TransactionMetadata {
  return { userId: 'learner-1', source: 'test', ...overrides }
}

export function makeMemoryTransaction(overrides: Partial<MemoryTransaction> = {}): MemoryTransaction {
  return {
    id: 'transaction-1',
    state: 'created',
    operations: [] as readonly TransactionOperation[],
    metadata: makeTransactionMetadata(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// Sprint 19 — Memory Retention & Cleanup Engine fixtures. Additive
// only, nothing above this line changed.
export function makeRetentionPolicy(overrides: Partial<MemoryRetentionPolicy> = {}): MemoryRetentionPolicy {
  return { id: 'policy-1', name: 'Test Policy', action: 'archive', rules: [], ...overrides }
}

export function makeRetentionMetadata(overrides: Partial<RetentionMetadata> = {}): RetentionMetadata {
  return { memoryId: 'memory-1', retentionExtendedUntil: null, cleanupExcluded: false, lastEvaluatedAt: null, ...overrides }
}

export function makeCleanupPlan(overrides: Partial<CleanupPlan> = {}): CleanupPlan {
  return { id: 'plan-1', policyIds: ['policy-1'], candidates: [], generatedAt: '2026-01-01T00:00:00.000Z', ...overrides }
}
