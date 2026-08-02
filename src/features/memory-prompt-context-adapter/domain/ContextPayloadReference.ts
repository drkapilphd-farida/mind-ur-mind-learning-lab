import type { MemoryId } from '@/features/memory-persistence'
import type { ContextPriority } from '@/features/memory-context-assembly'

// Immutable — every field `readonly`. Deliberately reuses `MemoryId`
// and `ContextPriority` from the two "approved Memory Engine modules"
// this sprint's checklist permits, rather than re-declaring trivial
// duplicates of them — both are already provider-neutral, plain-data
// types, so importing them keeps this payload's shape faithfully
// aligned with the `ContextPackage` it's transformed from.
export type ContextPayloadReference = {
  readonly memoryId: MemoryId
  readonly priority: ContextPriority
  readonly reason: string
}
