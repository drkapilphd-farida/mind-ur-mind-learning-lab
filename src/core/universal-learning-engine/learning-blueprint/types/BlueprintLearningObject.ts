import type { ChunkDifficulty } from '@/core/universal-learning-engine/learning-chunk'

// Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
// Generator™. Named `BlueprintLearningObject` (not the bare
// `LearningObject`) deliberately — a `LearningObject` type already
// exists in `src/features/learning-intelligence/`, a superseded,
// never-wired-into-any-route scaffold. This avoids any confusion with
// that dead code, even though it poses no real runtime collision.
//
// Only one real classification exists in the underlying data today
// (every Learning Object is built from a `ConceptGraphNode`) — `type`
// stays a single honest literal rather than fabricating a distinction
// (formula/process/etc.) the pipeline doesn't actually make yet.
export type BlueprintLearningObjectType = 'concept'

export type BlueprintLearningObject = {
  // = the real ConceptGraphNode.id this object was built from — a
  // caller can always join back to the real knowledge graph node.
  objectId: string
  // = ConceptGraphNode.label (real, first-occurrence casing/wording).
  title: string
  type: BlueprintLearningObjectType
  // = ConceptAnalysis.importance (real, already-computed 0-1 composite).
  importance: number
  // Best real `ChunkEnrichment.difficulty` among the chunks that
  // introduce this concept — `null` when none of them reported one.
  difficulty: ChunkDifficulty | null
  // The one genuinely new, AI-generated field this sprint adds — a
  // plain-language explanation of this concept. `null`, honestly, until
  // a real `chapter-blueprint-generation` call succeeds for it (never a
  // fabricated placeholder).
  explanation: string | null
  // Real, rolled up from `ChunkEnrichment.definitions` across every
  // chunk that mentions this concept (via `ConceptGraphNode.chunkIds`) —
  // the first real definition found, never invented.
  definition: string | null
  // Real, rolled up from `ChunkEnrichment.examples` across every chunk
  // that mentions this concept — deduplicated, never fabricated.
  examples: readonly string[]
  misconceptions: readonly string[]
  // Real `objectId`s of other Learning Objects connected to this one via
  // an already-real `LearningKnowledgeGraph` edge (any type) — never a
  // fabricated relationship.
  relatedObjects: readonly string[]
}
