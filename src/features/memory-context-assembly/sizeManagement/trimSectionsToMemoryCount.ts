import type { ContextSection } from '../domain'

// Pure — walks sections in their given (priority) order, keeping
// references up to `maxMemoryCount` total; a section left with zero
// references after trimming is dropped entirely. "Gracefully trim
// while preserving ordering" — later, lower-priority sections and
// their references are the first to go.
export function trimSectionsToMemoryCount(sections: readonly ContextSection[], maxMemoryCount: number): readonly ContextSection[] {
  const trimmed: ContextSection[] = []
  let remaining = maxMemoryCount

  for (const section of sections) {
    if (remaining <= 0) break
    const keptReferences = section.references.slice(0, remaining)
    remaining -= keptReferences.length
    if (keptReferences.length > 0) trimmed.push({ ...section, references: keptReferences })
  }

  return trimmed
}
