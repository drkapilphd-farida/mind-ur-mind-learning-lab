import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractTypeKey: IndexKeyExtractor = (memory: Memory) => [memory.type]
