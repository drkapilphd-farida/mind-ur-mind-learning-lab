import type { MemoryId } from '@/features/memory-persistence'
import type { ContextPriority } from './ContextPriority'

// Immutable — every field `readonly`. One memory's inclusion record
// within a package. `memoryId` is the only link back to
// `@/features/memory-persistence` — this feature never carries a full
// `Memory` value inside a package, only its id plus the assembly
// decision made about it.
export type ContextReference = {
  readonly memoryId: MemoryId
  readonly priority: ContextPriority
  readonly reason: string
}
