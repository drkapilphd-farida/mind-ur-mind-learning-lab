import type { MemoryCategory, MemoryRecord, MemoryStore } from '../types'

// Finds the most relevant, non-expired records for a learner —
// optionally narrowed to specific categories — ordered by priority
// then recency. Distinct from MemoryStoreOperations.getByLearner
// (a raw, unordered read): this is "what actually matters right now."
export interface MemoryResolver {
  resolve(store: MemoryStore, learnerId: string, now: string, categories?: readonly MemoryCategory[]): readonly MemoryRecord[]
}
