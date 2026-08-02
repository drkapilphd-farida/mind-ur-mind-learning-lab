import type { MemoryRecord } from './MemoryRecord'

// "Build memory snapshots" — a point-in-time, non-expired view of one
// learner's memory, the input to MemoryEngine.buildContext().
export type MemorySnapshot = {
  learnerId: string
  records: readonly MemoryRecord[]
  generatedAt: string
}
