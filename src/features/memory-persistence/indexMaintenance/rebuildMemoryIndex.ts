import type { Memory } from '../domain'
import type { IndexType, MemoryIndex } from '../indexDomain'
import { buildMemoryIndex } from './buildMemoryIndex'

// Pure — "Rebuild index": recomputes an index from scratch given the
// authoritative memories set, exactly like `buildMemoryIndex`, but
// exposed as its own named operation (the Sprint 16 brief lists "Build
// index" and "Rebuild index" as distinct capabilities) so callers —
// and `indexStatistics/computeIndexStatistics.ts`'s "last rebuild
// time" — can track a rebuild separately from the initial build.
export function rebuildMemoryIndex(indexType: IndexType, memories: readonly Memory[], now: string): MemoryIndex {
  return buildMemoryIndex(indexType, memories, now)
}
