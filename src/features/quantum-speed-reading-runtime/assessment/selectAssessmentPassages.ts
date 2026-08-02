import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk/types/LearningChunk'
import type { ChunkEnrichment } from '@/core/universal-learning-engine/learning-chunk/types/ChunkEnrichment'

export type AssessmentStageId = 'word-chunk' | 'phrase-chunk' | 'sentence' | 'paragraph'

export const ASSESSMENT_STAGE_ORDER: readonly AssessmentStageId[] = ['word-chunk', 'phrase-chunk', 'sentence', 'paragraph']

export type AssessmentPassage = {
  stage: AssessmentStageId
  chunkNodeId: string
  content: string
  wordCount: number
  enrichment: ChunkEnrichment
}

// Reading Assessment Engine™ — one real, editorial target word-count band
// per stage (word-chunk needs only a short passage since its own reading
// unit is tiny; paragraph wants the most natural, coherent stretch of
// prose). Deliberately a heuristic, not a guarantee — real documents vary.
const STAGE_WORD_RANGE: Record<AssessmentStageId, { min: number; max: number }> = {
  'word-chunk': { min: 40, max: 90 },
  'phrase-chunk': { min: 70, max: 130 },
  sentence: { min: 90, max: 160 },
  paragraph: { min: 150, max: 280 },
}

// Reading Assessment Engine™ — passage selection. Picks 4 real, distinct
// chunks from this learner's own uploaded document (never demo text),
// filtered to genuinely self-contained prose, one per stage. Zero new
// Claude calls: every filter reads a signal the document processing
// pipeline already, honestly computed (`chunk.citations`/`chunk.tables`/
// `chunk.blocks`/`chunk.statistics.wordCount`/`chunk.enrichment`) — no new
// AI call, no guessing. Returns fewer than 4 (down to zero) honestly when
// the document doesn't have enough suitable real content — the caller
// (the read route) skips the assessment gate entirely rather than block
// the learner on a nice-to-have, the same principle Comprehension Check's
// own empty state already uses.
export function selectAssessmentPassages(ulo: UniversalLearningObject): readonly AssessmentPassage[] {
  const candidates = [...ulo.knowledge.chunks].filter(isSuitableForAssessment).sort((a, b) => {
    const aPreferred = a.enrichment.difficulty === 'intermediate' ? 0 : 1
    const bPreferred = b.enrichment.difficulty === 'intermediate' ? 0 : 1
    if (aPreferred !== bPreferred) return aPreferred - bPreferred
    return a.statistics.wordCount - b.statistics.wordCount
  })

  if (candidates.length === 0) return []

  const used = new Set<string>()
  const passages: AssessmentPassage[] = []

  for (const stage of ASSESSMENT_STAGE_ORDER) {
    const range = STAGE_WORD_RANGE[stage]
    const chunk = pickChunkForStage(candidates, range, used) ?? pickClosestUnusedChunk(candidates, range, used) ?? pickClosestChunk(candidates, range)
    if (!chunk) continue

    used.add(chunk.id)
    passages.push({ stage, chunkNodeId: chunk.id, content: chunk.content, wordCount: chunk.statistics.wordCount, enrichment: chunk.enrichment })
  }

  return passages
}

function isSuitableForAssessment(chunk: LearningChunk): boolean {
  if (chunk.tables.length > 0 || chunk.media.length > 0 || chunk.citations.length > 0) return false
  if (chunk.blocks.length > 0 && chunk.blocks.every((block) => block.type === 'list' || block.type === 'heading')) return false
  if (isReferenceLikeHeading(chunk.metadata.title) || isReferenceLikeHeading(chunk.location.sectionHeading)) return false
  return hasEnoughEnrichmentForQuestions(chunk.enrichment)
}

const REFERENCE_HEADING_PATTERN = /reference|bibliograph|appendix|acknowledg|table of contents|index$/i

function isReferenceLikeHeading(heading: string | null): boolean {
  return heading !== null && REFERENCE_HEADING_PATTERN.test(heading)
}

function hasEnoughEnrichmentForQuestions(enrichment: ChunkEnrichment): boolean {
  const realSignalCount =
    (enrichment.semantic ? 1 : 0) +
    (enrichment.concepts?.length ?? 0) +
    (enrichment.importantTerms?.length ?? 0) +
    (enrichment.entities?.length ?? 0) +
    (enrichment.misconceptions?.length ?? 0) +
    (enrichment.keywords?.length ?? 0) +
    (enrichment.definitions?.length ?? 0)
  return realSignalCount >= 2
}

function pickChunkForStage(candidates: readonly LearningChunk[], range: { min: number; max: number }, used: Set<string>): LearningChunk | null {
  return candidates.find((chunk) => !used.has(chunk.id) && chunk.statistics.wordCount >= range.min && chunk.statistics.wordCount <= range.max) ?? null
}

function pickClosestUnusedChunk(candidates: readonly LearningChunk[], range: { min: number; max: number }, used: Set<string>): LearningChunk | null {
  const unused = candidates.filter((chunk) => !used.has(chunk.id))
  return pickClosestChunk(unused, range)
}

function pickClosestChunk(candidates: readonly LearningChunk[], range: { min: number; max: number }): LearningChunk | null {
  if (candidates.length === 0) return null
  const target = (range.min + range.max) / 2
  return [...candidates].sort((a, b) => Math.abs(a.statistics.wordCount - target) - Math.abs(b.statistics.wordCount - target))[0] ?? null
}
