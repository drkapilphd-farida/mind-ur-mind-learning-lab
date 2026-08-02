import type { ChunkDifficulty } from '@/core/universal-learning-engine/learning-chunk'
import type { BlueprintLearningObjectType } from '@/core/universal-learning-engine/learning-blueprint'

// Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
// Generator™. Deliberately a NEW type, not an edit to Sprint-1's own
// `BlueprintLearningObject` — the brief's "Sprint-1 is COMPLETE, DO NOT
// redesign" instruction is honored literally: no Sprint-1 file is
// touched. `LearningAssetObject` is a strict superset, built FROM a real
// `BlueprintLearningObject` plus the same Blueprint's own `readingAssets`
// and `knowledgeGraph.relationships` — zero new AI, zero re-reading of
// raw chunks/graph/analysis (see internal/enhanceLearningObjects.ts).
export type LearningAssetObject = {
  // Identity — the first five are real, passed through verbatim from the
  // source BlueprintLearningObject.
  objectId: string
  title: string
  type: BlueprintLearningObjectType
  importance: number
  difficulty: ChunkDifficulty | null
  // Real, deterministic word-count estimate over this object's own real
  // text (definition + explanation + examples) — no per-concept time
  // estimate exists anywhere upstream (confirmed: `ConceptAnalysis` has
  // no time field), so this is newly *computed*, not a fabricated guess:
  // same reading-speed formula this codebase already uses elsewhere for
  // real chunk-level `estimatedReadingSeconds`, applied at this smaller,
  // real granularity.
  estimatedLearningTime: number

  // Understanding — real, passed through verbatim.
  definition: string | null
  explanation: string | null
  examples: readonly string[]
  misconceptions: readonly string[]

  // Reading Intelligence — real subsets of the same Blueprint's own
  // `readingAssets` fields, filtered to the ones that actually mention
  // this object (by title, case-insensitive substring match against
  // already-real text) — never a new extraction, only a real relevance
  // filter over already-curated Sprint-1 output.
  keywords: readonly string[]
  keyPhrases: readonly string[]
  keySentences: readonly string[]
  // Synthetic but real, stable, deterministic ids — `${chapterId}-paragraph-{index}`,
  // matching this object's position in the same Blueprint's own
  // `readingAssets.keyParagraphs` array. No stable per-block id exists
  // upstream (confirmed: `LearningContentBlock` has none), so this sprint
  // establishes its own real, reproducible identifier rather than
  // inventing an opaque one.
  keyParagraphIds: readonly string[]

  // Relationships — `relatedObjects` is real, passed through verbatim.
  // `prerequisiteObjects`/`dependentObjects` are a real directional split
  // of the Blueprint's own `knowledgeGraph.relationships`, using the
  // already-real, AI-derived `'builds-upon'` edge (source builds upon
  // target — target is the prerequisite; confirmed directly in
  // `buildLearningKnowledgeGraph.ts`). No new AI call, no new graph
  // traversal — the edges were already computed and stored in Sprint-1.
  relatedObjects: readonly string[]
  prerequisiteObjects: readonly string[]
  dependentObjects: readonly string[]
}
