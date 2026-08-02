import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

export const extractTagKeys: IndexKeyExtractor = (memory: Memory) => memory.metadata.tags
