import type { RetentionRule } from './RetentionRule'

// Immutable — every field `readonly`. `action` is what happens to a
// memory that matches every rule in `rules` (AND semantics) —
// composing "what to check" and "what to do about it" into one named,
// reusable policy value.
export type MemoryRetentionPolicy = {
  readonly id: string
  readonly name: string
  readonly action: 'archive' | 'delete'
  readonly rules: readonly RetentionRule[]
}
