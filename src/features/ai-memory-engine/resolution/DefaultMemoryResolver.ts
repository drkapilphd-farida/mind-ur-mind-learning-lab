import type { MemoryCategory, MemoryRecord, MemoryStore } from '../types'
import type { MemoryResolver, MemoryStoreOperations } from '../contracts'
import { createMemoryStoreOperations } from '../storeOperations'

export type MemoryResolverDependencies = {
  storeOperations: MemoryStoreOperations
}

function createDefaultDependencies(): MemoryResolverDependencies {
  return { storeOperations: createMemoryStoreOperations() }
}

// Implements MemoryResolver. Composes MemoryStoreOperations (never
// re-implements expiry filtering or learner lookup) — "what's actually
// relevant right now" is: this learner's records, expired ones
// excluded, optionally narrowed to specific categories.
export class DefaultMemoryResolver implements MemoryResolver {
  constructor(private readonly dependencies: MemoryResolverDependencies) {}

  resolve(store: MemoryStore, learnerId: string, now: string, categories?: readonly MemoryCategory[]): readonly MemoryRecord[] {
    const activeStore = this.dependencies.storeOperations.removeExpired(store, now)
    const learnerRecords = this.dependencies.storeOperations.getByLearner(activeStore, learnerId)

    if (!categories || categories.length === 0) return learnerRecords

    const categorySet = new Set(categories)
    return learnerRecords.filter((record) => categorySet.has(record.category))
  }
}

export function createMemoryResolver(overrides: Partial<MemoryResolverDependencies> = {}): MemoryResolver {
  return new DefaultMemoryResolver({ ...createDefaultDependencies(), ...overrides })
}
