import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractCreatedAtKey: IndexKeyExtractor = (memory: Memory) => [memory.createdAt]
