import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractMemoryIdKey: IndexKeyExtractor = (memory: Memory) => [memory.id]
