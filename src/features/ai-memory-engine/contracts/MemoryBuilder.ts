import type { MemoryCandidate, MemoryRecord } from '../types'

// "Categorize memory. Assign priority. Assign retention." — pure,
// deterministic: the same candidate always builds the same record
// (aside from the injected id/timestamp).
export interface MemoryBuilder {
  build(candidate: MemoryCandidate): MemoryRecord
}
