import type { MemoryCategory, MemoryRecord, MemoryStore } from '../types'

// Pure operations on the immutable MemoryStore value — never mutates
// the given store, always returns a new one. "No persistence
// implementation" — a future real MemoryStoreOperations backed by
// Supabase implements this exact same contract.
export interface MemoryStoreOperations {
  add(store: MemoryStore, record: MemoryRecord): MemoryStore
  getByLearner(store: MemoryStore, learnerId: string): readonly MemoryRecord[]
  getByCategory(store: MemoryStore, learnerId: string, category: MemoryCategory): readonly MemoryRecord[]
  removeExpired(store: MemoryStore, now: string): MemoryStore
}
