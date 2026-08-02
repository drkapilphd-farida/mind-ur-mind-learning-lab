// AI Learning Analysis Engine™ (UCE-5). Real, deterministic, always
// computed — a threshold classification over `readingComplexity`/
// `learningDifficulty` (see internal/computeChunkMetrics.ts), never an
// AI call. Reading is a per-chunk activity, so this stays chunk-scoped
// (distinct from the concept-level revision/practice strategies below).
export type ReadingStrategy = 'single-pass-read' | 'active-recall-read' | 'multi-pass-with-notes'

// Real, per-chunk analysis — every field computed from this chunk's own
// already-real data (UCE-1/UCE-2/UCE-3A/UCE-3B output), never from
// another chunk. See internal/computeChunkMetrics.ts for exactly how
// each field is derived, and which disclosed heuristic/approximation it
// uses.
export type ChunkAnalysis = {
  chunkNodeId: string
  // Real Flesch-Kincaid-style grade-level estimate — see internal/
  // computeReadingComplexity.ts for the disclosed sentence/syllable
  // counting heuristics. This is what UCE-3B's own `ChunkEnrichment.
  // readingComplexity` comment flagged as "a future sprint could add
  // cheaply" — computed here, in UCE-5's own output, never written back
  // to the chunk.
  readingComplexity: number
  // Real 0-1 composite blending UCE-3B's categorical `enrichment.
  // difficulty` with real reading complexity — a derived metric,
  // distinct from and never overwriting UCE-3B's own categorical
  // judgment.
  learningDifficulty: number
  // Real: this chunk's own `readingMetrics.estimatedReadingSeconds`
  // (Learning Chunk sprint), adjusted by a real, disclosed
  // difficulty multiplier — a computed heuristic, not a validated
  // pedagogical time estimate.
  estimatedLearningTimeSeconds: number
  // Real: distinct concepts covered by this chunk, per word of real
  // content — how densely packed with distinct ideas this chunk is.
  knowledgeDensity: number
  // Real 0-1 composite: higher reading complexity and the absence of
  // real examples/media make content genuinely harder to retain —
  // disclosed as a heuristic proxy, not a measured retention outcome.
  memoryDifficulty: number
  // Real 0-1 composite proxy (knowledge density + reading complexity +
  // concept count) — explicitly disclosed as a heuristic, not a
  // validated cognitive-load-theory measurement.
  expectedCognitiveLoad: number
  suggestedReadingStrategy: ReadingStrategy
}
