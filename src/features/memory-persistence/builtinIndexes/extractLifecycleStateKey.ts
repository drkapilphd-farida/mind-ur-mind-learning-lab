import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractLifecycleStateKey: IndexKeyExtractor = (memory: Memory) => [memory.lifecycle]
