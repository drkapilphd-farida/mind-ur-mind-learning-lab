import type { Memory } from '../domain'
import type { MemoryIndex } from '../indexDomain'
import { validateIndexConsistency } from '../indexValidation'
import type { IndexStatistics } from './IndexStatistics'

// Pure — "Entry count" is the number of distinct index entries (unique
// keys); "Index size" is the total number of (key, memoryId)
// associations across every entry (larger than entryCount whenever any
// key is shared by more than one memory). Health is derived by running
// the same `validateIndexConsistency` check used elsewhere — a
// diagnostic snapshot, not a cached/stored flag, so it always reflects
// the index's current state against the given `memories`.
export function computeIndexStatistics(index: MemoryIndex, memories: readonly Memory[], lastRebuildAt: string | null): IndexStatistics {
  const entryCount = index.entries.length
  const indexSize = index.entries.reduce((total, entry) => total + entry.memoryIds.length, 0)
  const healthStatus = validateIndexConsistency(index, memories).valid ? 'healthy' : 'invalid'

  return {
    indexType: index.metadata.indexType,
    entryCount,
    indexSize,
    lastRebuildAt,
    healthStatus,
  }
}
