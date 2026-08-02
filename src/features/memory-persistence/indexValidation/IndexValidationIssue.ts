import type { MemoryId } from '../domain'
import type { IndexKey } from '../indexDomain'

// "Duplicate entries, Missing references, Invalid keys, Orphaned
// entries" — the Sprint 16 brief's own four named validation checks.
export type IndexValidationIssueType = 'duplicate-entry' | 'missing-reference' | 'invalid-key' | 'orphaned-entry'

// Immutable — every field `readonly`. `key`/`memoryId` are `null` when
// not applicable to a given issue (e.g. a duplicate-entry issue names
// a `key` but no single `memoryId`).
export type IndexValidationIssue = {
  readonly type: IndexValidationIssueType
  readonly key: IndexKey | null
  readonly memoryId: MemoryId | null
  readonly detail: string
}
