import type { ChunkDifficulty } from '@/core/universal-learning-engine/learning-chunk'
import type { BlueprintLearningObject } from './BlueprintLearningObject'

// Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
// Generator™. Deliberately named `ChapterIntelligenceBlueprint`, never
// `LearningBlueprint` — that name already belongs to a real, live,
// shipped, much simpler feature (`src/types/learning/blueprint.ts`,
// rendered by `LearningBlueprintExperience.tsx`). This is a distinct,
// additive object; the existing feature is untouched by this sprint.
//
// "Chapter" here means the existing ~200-word `LearningChunk` — no real
// chapter-boundary detection exists anywhere in this pipeline (confirmed:
// `generateRealLearningBlueprint.ts` already relabels each chunk
// `chapter-{index}` for display). One Blueprint is generated per chunk.

export type BlueprintHeader = {
  blueprintId: string
  documentId: string
  // = the real LearningChunk.id this Blueprint was built from.
  chapterId: string
  title: string
  // = UniversalLearningDocument.language — honestly `null` when
  // undetected, never guessed (matches UCE-2's own disclosed limit).
  language: string | null
  // Real, 1-indexed position — human-facing, unlike the 0-indexed
  // `chunk.location.order` it derives from.
  chapterNumber: number
  // Real: the parent document's own title — this pipeline has no
  // separate "subject" classifier, so `subject` honestly reuses the
  // document's real title rather than fabricating a distinct category.
  subject: string
  // Seconds — real, from `chunk.readingMetrics.estimatedReadingSeconds`.
  estimatedReadingTime: number
  // Seconds — real, from UCE-5's own `ChunkAnalysis.estimatedLearningTimeSeconds`.
  estimatedLearningTime: number
  // = chunk.enrichment.difficulty — `null` when not yet enriched.
  difficulty: ChunkDifficulty | null
  // Real revision count for this Blueprint row — starts at 1, bumped
  // only when the underlying chunk's real content_hash changes and this
  // Blueprint is genuinely regenerated (never on every read).
  version: number
}

// Section 2 — every field here is a real, already-computed value
// re-exposed under this Blueprint's own naming; zero new AI calls.
export type ChapterIntelligence = {
  summary: string | null
  learningObjectives: readonly string[]
  coreConcepts: readonly string[]
  prerequisiteConcepts: readonly string[]
  // = UCE-5's real ChunkAnalysis.readingComplexity — `null` before
  // learning-analysis has run for this document.
  readingDifficulty: number | null
  // Real concept labels introduced in this chapter, ordered by UCE-5's
  // own real `ConceptAnalysis.recommendedOrder` (topological sort).
  recommendedLearningOrder: readonly string[]
}

// Section 3 — the heart of the Blueprint.
export type LearningObjects = {
  objects: readonly BlueprintLearningObject[]
}

// Section 4 — keywords/keyPhrases are real, direct reuse; keySentences/
// keyParagraphs are deterministic picks (never AI-generated, never
// fabricated) — see internal/aggregateReadingAssets.ts.
export type ReadingAssets = {
  keywords: readonly string[]
  keyPhrases: readonly string[]
  keySentences: readonly string[]
  keyParagraphs: readonly string[]
}

// Section 5 — genuinely new this sprint; the one AI call's output.
export type MemoryAssets = {
  memoryHooks: readonly string[]
  associations: readonly string[]
  simpleMemoryNotes: readonly string[]
}

// Section 6. `mcqs`/`trueFalse` are deterministic, built from real
// `ChunkEnrichment.definitions`/`.misconceptions` (see
// internal/buildStructuralAssessmentItems.ts, zero new AI — deliberately
// NOT imported from `mcqs-mode-runtime`, a feature-layer module this
// core-engine module must not depend on). `recallQuestions`/
// `applicationQuestions` are the one AI call's output.
export type StructuralMcqItem = {
  question: string
  options: readonly string[]
  correctAnswerIndex: number
}

export type TrueFalseItem = {
  statement: string
  isTrue: boolean
}

export type RecallQuestionItem = {
  question: string
  expectedAnswerHint: string
}

export type ApplicationQuestionItem = {
  scenario: string
  question: string
}

export type AssessmentAssets = {
  mcqs: readonly StructuralMcqItem[]
  trueFalse: readonly TrueFalseItem[]
  recallQuestions: readonly RecallQuestionItem[]
  applicationQuestions: readonly ApplicationQuestionItem[]
}

// Section 7 — a direct filter/reshape of the already-real
// `LearningKnowledgeGraph` (UCE-4), scoped to this chapter's own
// concepts. Zero new AI, zero new computation, "store relationships
// only, no visualization."
export type BlueprintKnowledgeRelationship = {
  // = the real GraphEdgeType, reused verbatim.
  type: string
  sourceObjectId: string
  targetObjectId: string
}

export type KnowledgeGraphRelationships = {
  relationships: readonly BlueprintKnowledgeRelationship[]
}

// Section 8 — genuinely new this sprint (AI Mentor's own pipeline is an
// unimplemented stub today); the one AI call's output.
export type AiMentorContext = {
  beginnerExplanation: string | null
  simpleExplanation: string | null
  realLifeExample: string | null
  commonDoubts: readonly string[]
}

// Section 9 — a direct reshape of already-real UCE-5 fields
// (`ConceptAnalysis.importance/revisionPriority`,
// `LearningAnalysis.recommendedLearningOrder`), scoped to this chapter's
// concepts. Zero new AI.
export type RecommendationIntelligence = {
  difficultConcepts: readonly string[]
  suggestedReadingOrder: readonly string[]
  revisionPriority: readonly string[]
}

export type ChapterIntelligenceBlueprint = {
  header: BlueprintHeader
  chapterIntelligence: ChapterIntelligence
  learningObjects: LearningObjects
  readingAssets: ReadingAssets
  memoryAssets: MemoryAssets
  assessmentAssets: AssessmentAssets
  knowledgeGraph: KnowledgeGraphRelationships
  aiMentorContext: AiMentorContext
  recommendationIntelligence: RecommendationIntelligence
  createdAt: string
  lastModifiedAt: string
}
