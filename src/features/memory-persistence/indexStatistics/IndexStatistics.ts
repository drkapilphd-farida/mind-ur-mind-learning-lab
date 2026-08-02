import type { IndexType } from '../indexDomain'
import type { IndexHealthStatus } from './IndexHealthStatus'

// Immutable — every field `readonly`. "Entry count, Index size, Last
// rebuild time, Health status... For diagnostics only" — never used to
// drive retrieval behavior, only observed.
export type IndexStatistics = {
  readonly indexType: IndexType
  readonly entryCount: number
  readonly indexSize: number
  readonly lastRebuildAt: string | null
  readonly healthStatus: IndexHealthStatus
}
