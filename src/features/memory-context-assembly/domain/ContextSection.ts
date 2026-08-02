import type { ContextPriority } from './ContextPriority'
import type { ContextReference } from './ContextReference'

// Immutable — every field `readonly`. One priority tier's group of
// references — a package has at most one section per `ContextPriority`
// value, present only when at least one memory was assigned that tier.
export type ContextSection = {
  readonly id: string
  readonly priority: ContextPriority
  readonly references: readonly ContextReference[]
}
