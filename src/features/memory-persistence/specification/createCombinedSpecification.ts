import type { Memory } from '../domain'
import type { MemorySpecification } from './MemorySpecification'

// AND-combines any number of specifications — vacuously true
// (matches everything) for an empty list.
export function createCombinedSpecification(specifications: readonly MemorySpecification[]): MemorySpecification {
  return { isSatisfiedBy: (memory: Memory) => specifications.every((specification) => specification.isSatisfiedBy(memory)) }
}
