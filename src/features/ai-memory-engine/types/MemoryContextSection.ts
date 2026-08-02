import type { MemoryCategory } from './MemoryCategory'

export type MemoryContextSection = {
  category: MemoryCategory
  summaries: readonly string[]
}
