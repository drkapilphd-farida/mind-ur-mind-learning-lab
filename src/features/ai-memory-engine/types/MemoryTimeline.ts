import type { MemoryTimelineEntry } from './MemoryTimelineEntry'

// MemoryTimeline™ — a chronological (oldest-first) view of one
// learner's memory, across every category — useful for a future "what
// happened, in order" view, distinct from MemoryContext's
// category-grouped, priority-compressed shape.
export type MemoryTimeline = {
  learnerId: string
  entries: readonly MemoryTimelineEntry[]
}
