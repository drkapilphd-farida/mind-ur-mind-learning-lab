import type { MemoryImportance, MemoryLifecycleState, MemoryType } from '../domain'
import type { MemoryDateRange } from './MemoryDateRange'
import type { MemorySortField } from './MemorySortField'
import type { SortDirection } from './SortDirection'

// MemoryQuery — an immutable value object (every field `readonly`).
// `userId` maps to `Memory.metadata.learnerId` (same concept, the
// brief's own naming) — see specification/buildSpecificationFromQuery.ts.
// `conversationId` has no dedicated field on Sprint 13's `Memory`
// model; this sprint's convention (documented in
// specification/createConversationSpecification.ts) matches it against
// `Memory.metadata.tags`.
export type MemoryQuery = {
  readonly userId: string
  readonly type: MemoryType | null
  readonly lifecycle: MemoryLifecycleState | null
  readonly importance: MemoryImportance | null
  readonly dateRange: MemoryDateRange | null
  readonly tags: readonly string[] | null
  readonly conversationId: string | null
  readonly limit: number | null
  readonly offset: number
  readonly sortField: MemorySortField
  readonly sortDirection: SortDirection
}
