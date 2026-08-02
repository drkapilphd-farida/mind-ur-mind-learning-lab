import type { MemoryId } from './MemoryId'
import type { MemoryImportance } from './MemoryImportance'
import type { MemoryLifecycleState } from './MemoryLifecycleState'
import type { MemoryMetadata } from './MemoryMetadata'
import type { MemoryType } from './MemoryType'

// The core immutable domain model — every field `readonly`. Never
// mutated in place anywhere in this feature; every transformation
// (lifecycle transition, service update) returns a *new* Memory value.
// Pure TypeScript, no framework dependency — this type has no relation
// to any Supabase row shape, React prop, or other framework concern.
export type Memory = {
  readonly id: MemoryId
  readonly type: MemoryType
  readonly importance: MemoryImportance
  readonly content: string
  readonly pinned: boolean
  readonly metadata: MemoryMetadata
  readonly lifecycle: MemoryLifecycleState
  readonly createdAt: string
  readonly updatedAt: string
}
