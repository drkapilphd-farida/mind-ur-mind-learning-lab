import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractImportanceKey: IndexKeyExtractor = (memory: Memory) => [memory.importance]
