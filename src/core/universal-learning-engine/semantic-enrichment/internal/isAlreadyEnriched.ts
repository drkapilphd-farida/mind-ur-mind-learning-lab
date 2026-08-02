import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'

// Every ChunkEnrichment field UCE-3B is responsible for populating (see
// ChunkEnrichment.ts's own field-ownership comments) — deliberately
// excludes UCE-4/UCE-5/Learning-Session-Engine-owned fields
// (crossReferences, graphNodeId, taxonomy, bloomsLevel, readingComplexity,
// memoryPriority, revisionPriority, attentionScore), since those being
// unset says nothing about whether UCE-3B has already run.
const UCE_3B_OWNED_FIELDS = [
  'semantic',
  'concepts',
  'keywords',
  'importantTerms',
  'definitions',
  'entities',
  'learningObjectives',
  'misconceptions',
  'examples',
  'prerequisites',
  'dependencies',
  'difficulty',
  'importance',
] as const satisfies readonly (keyof ChunkEnrichment)[]

// Semantic Enrichment Engine™ — UCE-3B. Pure. The chunk-level
// idempotency check — "If enrichment already exists: Reuse it." A chunk
// only counts as already enriched if it both carries the real
// `'semantically-enriched'` status AND actually has at least one
// UCE-3B-owned field populated — a chunk whose status was set by some
// other means without real data would not count, avoiding a false skip.
export function isAlreadyEnriched(chunk: LearningChunk): boolean {
  if (chunk.status !== 'semantically-enriched') return false
  return UCE_3B_OWNED_FIELDS.some((field) => chunk.enrichment[field] !== undefined)
}
