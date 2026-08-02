import type { ContextEntry } from '../domain'
import type { ContextAssemblyEngine } from './ContextAssemblyEngine'

// Implements ContextAssemblyEngine. Merge policy: existing entries keep
// their position first (already-established ordering is preserved),
// then incoming entries are appended in their given order — skipping
// any incoming entry whose `memoryReferenceId` already appears (whether
// in `existingEntries` or already accepted earlier from
// `incomingEntries` itself, so duplicates *within* one incoming batch
// are also deduplicated, keeping the first occurrence). No AI
// inference, no relevance scoring — a pure set-membership merge.
export class DefaultContextAssemblyEngine implements ContextAssemblyEngine {
  assemble(existingEntries: readonly ContextEntry[], incomingEntries: readonly ContextEntry[]): readonly ContextEntry[] {
    const seen = new Set(existingEntries.map((entry) => entry.memoryReferenceId))
    const merged = [...existingEntries]

    for (const entry of incomingEntries) {
      if (seen.has(entry.memoryReferenceId)) continue
      seen.add(entry.memoryReferenceId)
      merged.push(entry)
    }

    return merged
  }
}

export function createContextAssemblyEngine(): ContextAssemblyEngine {
  return new DefaultContextAssemblyEngine()
}
