import type { MemoryContext } from '@/features/ai-memory-engine'
import type { MentorMemoryReference } from '../types'

// Pure — "Memory Summary References" (§4), reduces a real `MemoryContext`
// (the approved AI Memory Engine's™ own "AI-ready" shape) down to one
// reference per section summary. `memoryId` is a deterministic
// synthetic id (`category-sectionIndex-summaryIndex`) since
// `MemoryContext` carries summary strings, not ids of their own.
export function buildMentorMemoryReferences(memoryContext: MemoryContext | null): readonly MentorMemoryReference[] {
  if (!memoryContext) return []

  return memoryContext.sections.flatMap((section, sectionIndex) =>
    section.summaries.map((summary, summaryIndex) => ({ memoryId: `${section.category}-${sectionIndex}-${summaryIndex}`, summary })),
  )
}
