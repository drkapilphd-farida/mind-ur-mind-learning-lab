import type { MemoryRecord } from '../types'

// "Prepare future AI context" — bounds a (potentially large) record
// set down to `maxRecords`, keeping the highest-priority, most-recent
// ones. Deterministic: the same input + maxRecords always compresses
// to the same output.
export interface MemoryCompressor {
  compress(records: readonly MemoryRecord[], maxRecords: number): readonly MemoryRecord[]
}
