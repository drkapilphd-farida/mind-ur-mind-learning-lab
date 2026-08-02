import type { ContextPriority } from '@/features/memory-context-assembly'
import type { ContextPayloadReference } from './ContextPayloadReference'

// Immutable — every field `readonly`. Mirrors `ContextSection`'s own
// shape one-for-one ("Preserve ordering... Preserve references").
export type ContextPayloadSection = {
  readonly id: string
  readonly priority: ContextPriority
  readonly references: readonly ContextPayloadReference[]
}
