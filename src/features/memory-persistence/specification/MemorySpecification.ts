import type { Memory } from '../domain'

// The Specification pattern — "composable specifications for
// filtering... deterministic and reusable." Every specification in
// this folder implements exactly this one method; combinators (see
// createCombinedSpecification.ts) compose several into one.
export interface MemorySpecification {
  isSatisfiedBy(memory: Memory): boolean
}
