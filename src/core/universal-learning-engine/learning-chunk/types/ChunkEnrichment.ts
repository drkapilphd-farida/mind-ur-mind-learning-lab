// Learning Chunk™ (canonical domain model) — the explicit UCE-3B..UCE-6
// enrichment hook. Every field is optional; a field with no real value
// yet is simply absent (buildLearningChunk's createEmptyChunkEnrichment()
// always returns `{}`) — never fabricated. A future engine enriches a
// chunk by producing a *new* chunk with this object filled in (see
// ChunkAudit/versioning strategy in docs/ARCHITECTURE_LEARNING_CHUNK.md
// and docs/PRODUCTION_HANDOFF_UCE_3B.md), never by mutating fields in
// place.
//
// UCE-3B (Semantic Enrichment Engine) sprint note: seven fields below
// (`entities`, `difficulty`, `importance`, `learningObjectives`,
// `misconceptions`, `dependencies`, `prerequisites`) were originally
// commented as UCE-4/UCE-5-owned — a reasonable guess made before UCE-3B's
// own brief existed, which explicitly assigns all seven to UCE-3B.
// Corrected here; no field shape changed, only which engine populates it.
// `dependencies`/`prerequisites` are populated by UCE-3B as concept-name
// strings (e.g. "basic algebra"), never chunk ids — UCE-3B enriches one
// chunk at a time with no view of the rest of the corpus, so it cannot
// resolve a real cross-chunk id; that resolution stays UCE-4's job
// (Knowledge Graph Engine).
export type ChunkBloomsLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
export type ChunkDifficulty = 'beginner' | 'intermediate' | 'advanced'

// A single term UCE-3B's model identified and defined from the chunk's
// own real content — never a dictionary lookup, never fabricated beyond
// what the model actually returned for this specific chunk.
export type ChunkDefinition = {
  term: string
  definition: string
}

export type ChunkEnrichment = {
  // UCE-3B — a short AI-generated summary of this chunk's real content.
  semantic?: string
  // UCE-3B — key concepts identified within this chunk.
  concepts?: readonly string[]
  // UCE-3B — extracted keywords/keyphrases.
  keywords?: readonly string[]
  // UCE-3B — a curated, importance-ranked subset of keywords the model
  // considers especially critical to understanding this chunk — distinct
  // from the broader `keywords` list, not a duplicate of it.
  importantTerms?: readonly string[]
  // UCE-3B — term/definition pairs the model identified in this chunk's
  // own real content.
  definitions?: readonly ChunkDefinition[]
  // UCE-3B — illustrative examples of this chunk's concepts, drawn from
  // or grounded in this chunk's own real content.
  examples?: readonly string[]
  // UCE-3B — named entities (people, places, terms) identified in this chunk.
  entities?: readonly string[]
  // UCE-3B — this chunk's real difficulty, once genuinely assessed.
  difficulty?: ChunkDifficulty
  // UCE-3B — this chunk's relative importance within the document, 0-1.
  importance?: number
  // UCE-3B — concept names (not chunk ids) this chunk's understanding
  // depends on, as identified from this chunk's own content.
  dependencies?: readonly string[]
  // UCE-3B — concept names (not chunk ids) a learner should master
  // before this chunk, as identified from this chunk's own content.
  prerequisites?: readonly string[]
  // UCE-3B — what a learner should be able to do after this chunk.
  learningObjectives?: readonly string[]
  // UCE-3B — commonly confused ideas relevant to this chunk's content.
  misconceptions?: readonly string[]
  // Reserved — NOT populated by UCE-4 (Learning Knowledge Graph Engine).
  // UCE-4's own brief is explicit and repeated: "Never modify: Original
  // document, Original chunks, Semantic enrichment... The graph is an
  // additional intelligence layer" — a correction to this field's
  // original forward-looking comment, which assumed UCE-4 would write
  // back into the chunk. The real Learning Knowledge Graph (src/core/
  // universal-learning-engine/knowledge-graph/) references chunks by id
  // from its own separate ChunkGraphNode/GraphEdge structures instead —
  // ids of related chunks in other documents stay here, unpopulated,
  // until a future engine is explicitly authorized to write back.
  crossReferences?: readonly string[]
  // Reserved — same correction as crossReferences above. This chunk's
  // real graph node id lives only in the Knowledge Graph's own
  // ChunkGraphNode.id (= chunk.id — no lookup needed), never written
  // back here.
  graphNodeId?: string
  // Reserved — unpopulated by UCE-3B. AIFoundation.execute() only
  // supports text-generation tasks today (provider.generate()); no
  // embeddings capability exists yet in the AI Foundation Layer for any
  // engine to call. Populated once that capability is added.
  embeddingId?: string
  // Reserved — same gap as embeddingId above.
  vectorId?: string
  // Reserved — no current engine claims this. Originally commented
  // "UCE-5" as a forward-looking guess; UCE-5's own brief (AI Learning
  // Analysis Engine) does not include subject/topic taxonomy among its
  // 18 named outputs, and its brief explicitly forbids modifying
  // Semantic Enrichment regardless. Genuinely unclaimed until a future
  // engine is both scoped to produce this and authorized to write here.
  taxonomy?: readonly string[]
  // Reserved — same correction as taxonomy above. Not among UCE-5's
  // named outputs; genuinely unclaimed.
  bloomsLevel?: ChunkBloomsLevel
  // Reserved — NOT populated by UCE-5 (AI Learning Analysis Engine),
  // despite this field's original "UCE-5" comment. UCE-5's own brief is
  // explicit: "must NEVER modify... Semantic Enrichment." UCE-5 DOES
  // compute this exact metric for real — a genuine Flesch-Kincaid-style
  // formula, exactly what this field's original comment named as "a
  // future sprint could add cheaply" — but as part of its own separate
  // `LearningAnalysis` output (`ChunkAnalysis.readingComplexity`,
  // src/core/universal-learning-engine/learning-analysis/), never
  // written back to the chunk. See docs/PRODUCTION_HANDOFF_UCE_5.md.
  readingComplexity?: number
  // Learning Session Engine — how much this chunk should be prioritized
  // for memory-building activities, 0-1.
  memoryPriority?: number
  // Learning Session Engine — how much this chunk should be prioritized
  // in revision scheduling, 0-1.
  revisionPriority?: number
  // Learning Session Engine — adaptive, per-learner attention weighting, 0-1.
  attentionScore?: number
}
