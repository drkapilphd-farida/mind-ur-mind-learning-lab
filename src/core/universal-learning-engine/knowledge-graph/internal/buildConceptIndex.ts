import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { ConceptGraphNode } from '../types/GraphNode'
import { normalizeConceptLabel } from './normalizeConceptLabel'
import { hashToId } from './hashToId'

// Every real, UCE-3B-populated field that names a concept/term — the
// full real source of concept labels this engine draws from. Never a
// new extraction; every label here is something UCE-3B's AI call already
// identified. Exported so buildStructuralEdges.ts derives `part-of`/
// `related-to`/`example-of`/`diagram-for` edges from the exact same
// label set this index was built from — one real implementation, never
// two that could drift.
export function collectChunkConceptLabels(chunk: LearningChunk): readonly string[] {
  const labels: string[] = [
    ...(chunk.enrichment.concepts ?? []),
    ...(chunk.enrichment.keywords ?? []),
    ...(chunk.enrichment.importantTerms ?? []),
    ...(chunk.enrichment.entities ?? []),
    ...(chunk.enrichment.definitions ?? []).map((definition) => definition.term),
  ]

  // De-duplicate within this one chunk (case/whitespace-insensitive) so
  // a term appearing in both `concepts` and `keywords` for the same
  // chunk doesn't double-count this chunk's occurrence.
  const seen = new Set<string>()
  const unique: string[] = []
  for (const label of labels) {
    const key = normalizeConceptLabel(label)
    if (key.length === 0 || seen.has(key)) continue
    seen.add(key)
    unique.push(label)
  }
  return unique
}

// Learning Knowledge Graph™ (UCE-4). Pure. Builds the deduplicated
// concept index — "No duplicated concepts." Processes chunks in real
// `location.order` sequence (sorted internally, regardless of input
// order) so a concept's `label` is always its first, earliest real
// occurrence's original wording/casing, and so `buildStructuralEdges.ts`
// can reuse this same order for the `introduces` edge type without
// re-sorting. `occurrenceCount`/`chunkIds` are real, computed here — the
// one place they're computed, so nothing downstream re-derives them
// differently.
export function buildConceptIndex(chunks: readonly LearningChunk[]): ReadonlyMap<string, ConceptGraphNode> {
  const sortedChunks = [...chunks].sort((a, b) => a.location.order - b.location.order)
  const index = new Map<string, ConceptGraphNode>()

  for (const chunk of sortedChunks) {
    for (const label of collectChunkConceptLabels(chunk)) {
      const normalizedLabel = normalizeConceptLabel(label)
      const existing = index.get(normalizedLabel)

      if (existing) {
        if (existing.chunkIds.includes(chunk.id)) continue
        index.set(normalizedLabel, {
          ...existing,
          occurrenceCount: existing.occurrenceCount + 1,
          chunkIds: [...existing.chunkIds, chunk.id],
        })
        continue
      }

      index.set(normalizedLabel, {
        id: hashToId(`concept:${normalizedLabel}`),
        type: 'concept',
        label,
        normalizedLabel,
        occurrenceCount: 1,
        chunkIds: [chunk.id],
      })
    }
  }

  return index
}
