import type { ChunkAuditEntry, ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'

export type MergeEnrichmentOptions = {
  now?: () => Date
  changeSummary?: string
}

const DEFAULT_CHANGE_SUMMARY = 'Enriched via UCE-3B semantic-enrichment task.'

// Semantic Enrichment Engine™ — UCE-3B. Pure. Implements LearningChunk's
// own documented "Update Strategy" (docs/ARCHITECTURE_LEARNING_CHUNK.md):
// enrichment produces a NEW chunk — same id/content/blocks/source/
// location/statistics/media/tables/language/accessibility/tags (spread
// from the original, never touched) — never a mutation of the input.
// `parsed` fields overwrite the corresponding `chunk.enrichment` field
// only when the model actually returned a real value for it this run
// (parseEnrichmentResponse only ever sets a key when it has a real,
// validated value — never `undefined`); any field the model omitted or
// that failed validation keeps its previous value from `chunk.enrichment`
// — re-processing can only add or replace real data, never blank out
// something a prior run genuinely produced.
export function mergeEnrichment(chunk: LearningChunk, parsed: Partial<ChunkEnrichment>, confidence: number | null, options: MergeEnrichmentOptions = {}): LearningChunk {
  const now = options.now ?? (() => new Date())
  const nowIso = now().toISOString()

  const mergedEnrichment: ChunkEnrichment = { ...chunk.enrichment, ...parsed }

  // The model's own self-reported confidence for this run — disclosed as
  // LLM-self-reported, not independently verified (see docs/
  // PRODUCTION_HANDOFF_UCE_3B.md). `overall` is a real, disclosed, simple
  // average of the always-1.0 structural confidence and the semantic
  // confidence — not a fabricated combined score.
  const semanticConfidence = confidence ?? chunk.confidence.semantic
  const overallConfidence = semanticConfidence !== null ? (chunk.confidence.structural + semanticConfidence) / 2 : chunk.confidence.overall

  const auditEntry: ChunkAuditEntry = {
    changedAt: nowIso,
    changedBy: 'system',
    changeSummary: options.changeSummary ?? DEFAULT_CHANGE_SUMMARY,
  }

  return {
    ...chunk,
    version: { ...chunk.version, revision: chunk.version.revision + 1 },
    status: 'semantically-enriched',
    confidence: { ...chunk.confidence, semantic: semanticConfidence, overall: overallConfidence },
    audit: {
      ...chunk.audit,
      lastModifiedAt: nowIso,
      lastModifiedBy: 'system',
      history: [...chunk.audit.history, auditEntry],
    },
    enrichment: mergedEnrichment,
  }
}
