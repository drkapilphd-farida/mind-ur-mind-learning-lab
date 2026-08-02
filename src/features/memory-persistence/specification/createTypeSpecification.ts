import type { Memory, MemoryType } from '../domain'
import type { MemorySpecification } from './MemorySpecification'

export function createTypeSpecification(type: MemoryType): MemorySpecification {
  return { isSatisfiedBy: (memory: Memory) => memory.type === type }
}
