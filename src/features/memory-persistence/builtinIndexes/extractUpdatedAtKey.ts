import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractUpdatedAtKey: IndexKeyExtractor = (memory: Memory) => [memory.updatedAt]
