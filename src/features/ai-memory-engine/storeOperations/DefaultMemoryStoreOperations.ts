import type { MemoryCategory, MemoryRecord, MemoryStore } from '../types'
import type { MemoryStoreOperations } from '../contracts'

// Implements MemoryStoreOperations. Every method returns a *new*
// MemoryStore (or a plain readonly array) — `store.records` is never
// mutated in place.
export class DefaultMemoryStoreOperations implements MemoryStoreOperations {
  add(store: MemoryStore, record: MemoryRecord): MemoryStore {
    return { records: [...store.records, record] }
  }

  getByLearner(store: MemoryStore, learnerId: string): readonly MemoryRecord[] {
    return store.records.filter((record) => record.learnerId === learnerId)
  }

  getByCategory(store: MemoryStore, learnerId: string, category: MemoryCategory): readonly MemoryRecord[] {
    return store.records.filter((record) => record.learnerId === learnerId && record.category === category)
  }

  removeExpired(store: MemoryStore, now: string): MemoryStore {
    return { records: store.records.filter((record) => record.expiresAt === null || record.expiresAt > now) }
  }
}

export function createMemoryStoreOperations(): MemoryStoreOperations {
  return new DefaultMemoryStoreOperations()
}
