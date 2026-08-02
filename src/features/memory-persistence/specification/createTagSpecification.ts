import type { Memory } from '../domain'
import type { MemorySpecification } from './MemorySpecification'

// A memory matches only if it carries *every* given tag (AND
// semantics) — a refinement filter, not a broad "any of these" match.
export function createTagSpecification(tags: readonly string[]): MemorySpecification {
  return { isSatisfiedBy: (memory: Memory) => tags.every((tag) => memory.metadata.tags.includes(tag)) }
}
