// Learning Chunk™ (canonical domain model). `structural` is always 1.0
// this sprint — deterministic structural chunking has no uncertainty to
// express. `semantic` (UCE-3B) and the derived `overall` stay null until
// a real enrichment signal exists — never a fabricated confidence score.
export type ChunkConfidence = {
  structural: number
  semantic: number | null
  overall: number | null
}
