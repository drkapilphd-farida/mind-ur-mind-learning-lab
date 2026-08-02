import type { MemoryId } from '../domain'

// Immutable — every field `readonly`. Explicit, persisted overrides a
// caller can set for one memory, distinct from that memory's own
// intrinsic fields (`lifecycle`/`importance`/`pinned`/...) — "Retention
// extension" and "Cleanup exclusion" (Section 4) are both stateful
// decisions that must survive independently of any single evaluation
// run, so they live here rather than as a transient computation
// result.
export type RetentionMetadata = {
  readonly memoryId: MemoryId
  readonly retentionExtendedUntil: string | null
  readonly cleanupExcluded: boolean
  readonly lastEvaluatedAt: string | null
}
