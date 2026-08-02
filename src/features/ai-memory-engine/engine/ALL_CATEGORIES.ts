import type { MemoryCategory } from '../types'

// The fixed, canonical category order — used to sort MemoryContext
// sections deterministically, regardless of the order records happen
// to appear in a MemorySnapshot.
export const ALL_CATEGORIES: readonly MemoryCategory[] = [
  'assessment',
  'journey',
  'exercise',
  'conversation',
  'learning-pattern',
  'weakness',
  'strength',
  'milestone',
  'preference',
  'achievement',
]
