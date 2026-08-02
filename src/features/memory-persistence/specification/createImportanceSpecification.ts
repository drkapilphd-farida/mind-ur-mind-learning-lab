import type { Memory, MemoryImportance } from '../domain'
import type { MemorySpecification } from './MemorySpecification'

export function createImportanceSpecification(importance: MemoryImportance): MemorySpecification {
  return { isSatisfiedBy: (memory: Memory) => memory.importance === importance }
}
