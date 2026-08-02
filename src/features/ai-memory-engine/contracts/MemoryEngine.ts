import type { MemoryCandidate, MemoryContext, MemorySnapshot, MemoryStore, MemoryTimeline } from '../types'

// MemoryEngine™ — the top-level entry point, composing every other
// piece in this feature. `remember` is "Collect memory candidates" +
// categorize/prioritize/retain + store, in one pure call, returning a
// *new* MemoryStore.
export interface MemoryEngine {
  remember(store: MemoryStore, candidate: MemoryCandidate): MemoryStore
  snapshot(store: MemoryStore, learnerId: string, now: string): MemorySnapshot
  buildContext(snapshot: MemorySnapshot, maxRecordsPerCategory?: number): MemoryContext
  timeline(store: MemoryStore, learnerId: string): MemoryTimeline
}
