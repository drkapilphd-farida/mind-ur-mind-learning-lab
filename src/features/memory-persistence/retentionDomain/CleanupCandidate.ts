import type { MemoryId } from '../domain'

// Immutable — every field `readonly`. One memory's evaluation outcome:
// `action` is `'skip'` when no policy matched. `matchedPolicyId` is
// `null` for a skipped candidate.
export type CleanupCandidate = {
  readonly memoryId: MemoryId
  readonly action: 'archive' | 'delete' | 'skip'
  readonly matchedPolicyId: string | null
  readonly reason: string
}
