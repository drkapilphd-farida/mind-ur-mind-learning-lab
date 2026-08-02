// AI Memory Engine™ domain types (Sprint 12). Fully self-contained —
// zero imports from any other feature. "Architecture only": memory
// content (`MemoryCandidate.data`/`MemoryRecord.data`) is a generic,
// opaque payload — a future integration sprint feeds real domain data
// (assessment results, journey progress, conversation summaries, ...)
// through this same generic shape, without this feature ever needing
// to know each domain's specific type.

export type { MemoryCategory } from './MemoryCategory'
export type { MemoryPriority } from './MemoryPriority'
export type { MemoryRetention } from './MemoryRetention'
export type { MemoryCandidate } from './MemoryCandidate'
export type { MemoryRecord } from './MemoryRecord'
export type { MemoryStore } from './MemoryStore'
export type { MemorySnapshot } from './MemorySnapshot'
export type { MemoryContextSection } from './MemoryContextSection'
export type { MemoryContext } from './MemoryContext'
export type { MemoryTimelineEntry } from './MemoryTimelineEntry'
export type { MemoryTimeline } from './MemoryTimeline'
