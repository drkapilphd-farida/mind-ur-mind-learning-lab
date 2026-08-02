import type { Memory, MemoryLifecycleState } from '../domain'
import type { MemorySpecification } from './MemorySpecification'

export function createLifecycleSpecification(lifecycle: MemoryLifecycleState): MemorySpecification {
  return { isSatisfiedBy: (memory: Memory) => memory.lifecycle === lifecycle }
}
