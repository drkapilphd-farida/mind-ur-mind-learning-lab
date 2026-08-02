import type { ChunkDifficulty, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { ReadingStrategy } from '../types/ChunkAnalysis'
import { computeReadingComplexity } from './computeReadingComplexity'

export type ChunkMetrics = {
  readingComplexity: number
  learningDifficulty: number
  estimatedLearningTimeSeconds: number
  knowledgeDensity: number
  memoryDifficulty: number
  expectedCognitiveLoad: number
  suggestedReadingStrategy: ReadingStrategy
}

// Real, disclosed base values mapping UCE-3B's categorical
// `enrichment.difficulty` onto the same 0-1 scale as reading complexity,
// so the two can be honestly blended — not a claim that these three
// numbers are independently validated, just a consistent, transparent
// mapping.
const DIFFICULTY_BASE: Record<ChunkDifficulty, number> = { beginner: 0.2, intermediate: 0.5, advanced: 0.8 }
// A grade-level-20 text is treated as maximally complex on the 0-1
// scale — a disclosed, arbitrary-but-reasonable ceiling (real Flesch-
// Kincaid grade levels rarely exceed the low 20s for genuine prose).
const MAX_EXPECTED_GRADE_LEVEL = 20
// Roughly "1 distinct concept per 20 words" is treated as maximally
// dense — a disclosed, arbitrary-but-reasonable ceiling, not a
// validated density benchmark.
const MAX_EXPECTED_CONCEPTS_PER_WORD = 1 / 20

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

// Same real source fields as knowledge-graph's own
// collectChunkConceptLabels (small, disclosed, non-behavioral
// duplication rather than reaching into another engine's internal/
// folder — this codebase's established precedent, e.g. the JSON-
// extraction helper duplicated between semantic-enrichment's and
// knowledge-graph's response parsers).
function countDistinctConcepts(chunk: LearningChunk): number {
  const labels = [
    ...(chunk.enrichment.concepts ?? []),
    ...(chunk.enrichment.keywords ?? []),
    ...(chunk.enrichment.importantTerms ?? []),
    ...(chunk.enrichment.entities ?? []),
    ...(chunk.enrichment.definitions ?? []).map((definition) => definition.term),
  ]
  const normalized = new Set(labels.map((label) => label.trim().toLowerCase()))
  return normalized.size
}

// AI Learning Analysis Engine™ (UCE-5). Pure, deterministic, real. Every
// field derived from this one chunk's own already-real data — see each
// field's own doc comment on ChunkAnalysis.ts for the exact formula and
// its disclosed limitations.
export function computeChunkMetrics(chunk: LearningChunk): ChunkMetrics {
  const readingComplexity = computeReadingComplexity(chunk.content)
  const normalizedComplexity = clamp01(readingComplexity / MAX_EXPECTED_GRADE_LEVEL)

  const difficultyBase = chunk.enrichment.difficulty ? DIFFICULTY_BASE[chunk.enrichment.difficulty] : normalizedComplexity
  const learningDifficulty = clamp01(0.5 * difficultyBase + 0.5 * normalizedComplexity)

  const timeMultiplier = 1 + learningDifficulty
  const estimatedLearningTimeSeconds = Math.round(chunk.readingMetrics.estimatedReadingSeconds * timeMultiplier)

  const conceptCount = countDistinctConcepts(chunk)
  const knowledgeDensity = chunk.statistics.wordCount > 0 ? conceptCount / chunk.statistics.wordCount : 0

  const hasConcreteSupport = (chunk.enrichment.examples?.length ?? 0) > 0 || chunk.media.length > 0
  const memoryDifficulty = clamp01(0.6 * normalizedComplexity + (hasConcreteSupport ? 0 : 0.4))

  const densityNorm = clamp01(knowledgeDensity / MAX_EXPECTED_CONCEPTS_PER_WORD)
  const conceptCountNorm = clamp01(conceptCount / 10)
  const expectedCognitiveLoad = clamp01((normalizedComplexity + densityNorm + conceptCountNorm) / 3)

  const suggestedReadingStrategy: ReadingStrategy = learningDifficulty >= 0.66 ? 'multi-pass-with-notes' : learningDifficulty >= 0.33 ? 'active-recall-read' : 'single-pass-read'

  return {
    readingComplexity,
    learningDifficulty,
    estimatedLearningTimeSeconds,
    knowledgeDensity,
    memoryDifficulty,
    expectedCognitiveLoad,
    suggestedReadingStrategy,
  }
}
