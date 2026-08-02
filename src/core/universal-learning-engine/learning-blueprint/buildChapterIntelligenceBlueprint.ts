import type { AIFoundation } from '@/core/ai-foundation'
import { withExecuteTimeout } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { ChapterIntelligenceBlueprint } from './types/ChapterIntelligenceBlueprint'
import { aggregateChapterIntelligence } from './internal/aggregateChapterIntelligence'
import { aggregateLearningObjects } from './internal/aggregateLearningObjects'
import { aggregateReadingAssets } from './internal/aggregateReadingAssets'
import { buildStructuralAssessmentItems } from './internal/buildStructuralAssessmentItems'
import { aggregateKnowledgeGraphRelationships } from './internal/aggregateKnowledgeGraphRelationships'
import { aggregateRecommendationIntelligence } from './internal/aggregateRecommendationIntelligence'
import { buildBlueprintGenerationPrompt } from './internal/buildBlueprintGenerationPrompt'
import { parseBlueprintGenerationResponse } from './internal/parseBlueprintGenerationResponse'
import { normalizeForMatching } from './internal/graphHelpers'

const DEFAULT_TIMEOUT_MS = 30_000

export type BuildChapterIntelligenceBlueprintOptions = {
  now?: () => Date
  idFactory?: () => string
  timeoutMs?: number
  // Omit entirely to build the Blueprint from already-real aggregated
  // data only — every AI-derived field (Learning Object `explanation`,
  // Memory Assets, recall/application questions, AI Mentor Context)
  // stays honestly empty/null, exactly like every other UCE engine's
  // "AI-derived pieces are additive, never load-bearing" contract.
  aiFoundation?: Pick<AIFoundation, 'execute'>
}

// Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
// Generator™. The one real orchestrator: aggregates every already-real
// UCE-3B/UCE-4/UCE-5 field for this chapter (zero new AI), then — only
// if `options.aiFoundation` is supplied — makes exactly ONE new
// `'chapter-blueprint-generation'` call for the genuinely-new fields
// this sprint adds. Never modifies `chunk`/`graph`/`analysis` — builds a
// new, independent `ChapterIntelligenceBlueprint` alongside them, the
// same "never mutate upstream state" discipline every UCE build function
// already follows.
export async function buildChapterIntelligenceBlueprint(
  chunk: LearningChunk,
  allChunks: readonly LearningChunk[],
  document: UniversalLearningDocument,
  graph: LearningKnowledgeGraph,
  analysis: LearningAnalysis,
  options: BuildChapterIntelligenceBlueprintOptions = {},
): Promise<ChapterIntelligenceBlueprint> {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const nowIso = now().toISOString()

  const chapterIntelligence = aggregateChapterIntelligence(chunk, graph, analysis)
  const learningObjects = aggregateLearningObjects(chunk, allChunks, graph, analysis)
  const readingAssets = aggregateReadingAssets(chunk)
  const structuralAssessment = buildStructuralAssessmentItems(chunk)
  const knowledgeGraph = aggregateKnowledgeGraphRelationships(chunk.id, graph)
  const recommendationIntelligence = aggregateRecommendationIntelligence(chunk, allChunks, graph, analysis)

  let memoryAssets: ChapterIntelligenceBlueprint['memoryAssets'] = { memoryHooks: [], associations: [], simpleMemoryNotes: [] }
  let recallQuestions: ChapterIntelligenceBlueprint['assessmentAssets']['recallQuestions'] = []
  let applicationQuestions: ChapterIntelligenceBlueprint['assessmentAssets']['applicationQuestions'] = []
  let aiMentorContext: ChapterIntelligenceBlueprint['aiMentorContext'] = { beginnerExplanation: null, simpleExplanation: null, realLifeExample: null, commonDoubts: [] }
  let learningObjectsWithExplanations = learningObjects

  if (options.aiFoundation) {
    const payload = buildBlueprintGenerationPrompt(
      chunk,
      document,
      learningObjects.map((object) => object.title),
    )
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const result = await withExecuteTimeout(options.aiFoundation.execute('chapter-blueprint-generation', payload, chunk.id), 'chapter-blueprint-generation', timeoutMs, chunk.id, now)

    if (result.success) {
      const parsed = parseBlueprintGenerationResponse(result.response.content)
      memoryAssets = { memoryHooks: parsed.memoryHooks, associations: parsed.associations, simpleMemoryNotes: parsed.simpleMemoryNotes }
      recallQuestions = parsed.recallQuestions
      applicationQuestions = parsed.applicationQuestions
      aiMentorContext = parsed.aiMentorContext

      const explanationByConcept = new Map(parsed.conceptExplanations.map((entry) => [normalizeForMatching(entry.concept), entry.explanation]))
      learningObjectsWithExplanations = learningObjects.map((object) => ({ ...object, explanation: explanationByConcept.get(normalizeForMatching(object.title)) ?? null }))
    }
    // A failed/timed-out call leaves every AI-derived field at its
    // honest default above — never a thrown error, matching every
    // sibling UCE call site's disclosed-degradation contract.
  }

  return {
    header: {
      blueprintId: idFactory(),
      documentId: document.id,
      chapterId: chunk.id,
      title: chunk.metadata.title ?? chunk.location.sectionHeading ?? `Section ${chunk.location.order + 1}`,
      language: document.language,
      chapterNumber: chunk.location.order + 1,
      subject: document.title,
      estimatedReadingTime: chunk.readingMetrics.estimatedReadingSeconds,
      estimatedLearningTime: analysis.chunkAnalyses.find((entry) => entry.chunkNodeId === chunk.id)?.estimatedLearningTimeSeconds ?? 0,
      difficulty: chunk.enrichment.difficulty ?? null,
      version: 1,
    },
    chapterIntelligence,
    learningObjects: { objects: learningObjectsWithExplanations },
    readingAssets,
    memoryAssets,
    assessmentAssets: { ...structuralAssessment, recallQuestions, applicationQuestions },
    knowledgeGraph,
    aiMentorContext,
    recommendationIntelligence,
    createdAt: nowIso,
    lastModifiedAt: nowIso,
  }
}
