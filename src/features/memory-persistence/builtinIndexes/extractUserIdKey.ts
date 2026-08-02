import type { Memory } from '../domain'
import type { IndexKeyExtractor } from './IndexKeyExtractor'

// "User ID" maps to `Memory.metadata.learnerId` — the same naming
// convention already established in
// `query/MemoryQuery.ts` ("`userId` maps to `Memory.metadata.learnerId`").
export const extractUserIdKey: IndexKeyExtractor = (memory: Memory) => [memory.metadata.learnerId]
