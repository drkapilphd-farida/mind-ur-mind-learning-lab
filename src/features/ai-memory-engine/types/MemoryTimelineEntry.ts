import type { MemoryCategory } from './MemoryCategory'

export type MemoryTimelineEntry = {
  recordId: string
  category: MemoryCategory
  summary: string
  occurredAt: string
}
