import type { ChunkEnrichment } from '@/core/universal-learning-engine/learning-chunk'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own `types/ReadingChunkView.ts`
// (Sprint-1/2/3) — already fully mode-agnostic. Any Learning Mode's current
// chunk is this same shape.
//
// AI Learning Studio™ Sprint ALS-15 — `title`/`sectionHeading` added: the
// same real, already-existing `LearningChunk.metadata.title`/
// `location.sectionHeading` fields ALS-13's Mind Map™/Flashcards™ already
// read directly off the ULO server-side, now threaded through this
// shared, mode-agnostic live-session chunk view too (populated in
// `resolveCurrentChunkView.ts`) so any mode's real, already-loaded ULO
// data reaches its client component without a second, duplicate parse —
// Memory Mode™'s own Memory Methods are the first consumer, but the
// fields are genuinely mode-agnostic, matching every other field here.
//
// Production AI Integration — ALS-24. `enrichment` added: the same real
// `chunk.enrichment` UCE-3B now genuinely populates, threaded through
// this same shared view so Memory Mode™/MCQs™/Research Mode™ can each
// read real AI-derived concepts/definitions/summary without a second,
// duplicate parse of the ULO. Omitted (not present as `{}`) when a chunk
// has no real enrichment yet, so a consumer's own `chunk?.enrichment`
// check reads naturally as "nothing real here" rather than needing to
// distinguish an empty object from a genuinely absent one.
export type ModeChunkView = {
  chunkNodeId: string
  order: number
  content: string
  title: string | null
  sectionHeading: string | null
  isCheckpoint: boolean
  checkpointLabel?: string
  enrichment?: ChunkEnrichment
}
