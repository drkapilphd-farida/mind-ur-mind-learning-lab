import type { Document } from '@/types/documents'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { ConceptGraphNode } from '@/core/universal-learning-engine/knowledge-graph'
import type { ChunkDifficulty, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { ReadingStrategy } from '@/core/universal-learning-engine/learning-analysis'
import type {
  BlueprintChapter,
  BlueprintConcept,
  BlueprintDensityLevel,
  BlueprintDifficulty,
  BlueprintInsightLevel,
  BlueprintInsights,
  KnowledgeMapNode,
  LearningBlueprint,
} from '@/types/learning/blueprint'
import { resolveChunkHeading } from '@/lib/learning-modes/resolveChunkHeading'
import { generateFlashCards } from '@/lib/learning-modes/generateFlashCards'
import { generateMindMapOutline } from '@/lib/learning-modes/generateMindMapOutline'

// Production AI Integration — removes the last mock/template Learning
// Blueprint™ generator (generateLearningBlueprint.ts, deliberately mock
// since Sprint 1). Every field below is derived from the real, already-
// built Universal Learning Object™ — real UCE-3B chunk enrichment (real
// Claude output, computed once during processing and stored in the ULO,
// never a second AI call from this function), real UCE-4 knowledge
// graph, and real UCE-5 learning analysis. A chunk/concept with no real
// enrichment yet (a failed or skipped AI call) degrades to an honest
// fallback for that one piece — never fabricated prose standing in for
// real AI output.

const JOURNEY_STEPS: LearningBlueprint['journey'] = [
  { id: 'overview', title: 'Overview', description: 'Get the big picture before going deep into any one part.', estimatedMinutes: 5 },
  { id: 'key-concepts', title: 'Key Concepts', description: 'Learn the foundational ideas this document builds on.', estimatedMinutes: 15 },
  { id: 'flashcards', title: 'Flashcards', description: 'Review key terms and ideas with spaced repetition.', estimatedMinutes: 10 },
  { id: 'mind-maps', title: 'Mind Maps', description: 'See how every concept connects to the others visually.', estimatedMinutes: 8 },
  { id: 'practice', title: 'Practice', description: "Apply what you've learned with guided questions.", estimatedMinutes: 15 },
  { id: 'quiz', title: 'Progress Check', description: 'Check your understanding with adaptive questions.', estimatedMinutes: 10 },
  { id: 'revision', title: 'Revision', description: 'Revisit key concepts to build lasting memory.', estimatedMinutes: 10 },
]

const MAX_CONCEPTS = 4
const MAX_TOPICS = 5

function mostCommon<T>(values: readonly T[]): T | undefined {
  if (values.length === 0) return undefined
  const counts = new Map<T, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  let best: T | undefined
  let bestCount = 0
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function bandFromScore(score: number | null, direction: 'higher-is-stronger' | 'higher-is-harder'): BlueprintInsightLevel {
  if (score === null) return 'moderate'
  const normalized = direction === 'higher-is-harder' ? 1 - score : score
  if (normalized < 0.34) return 'building'
  if (normalized < 0.67) return 'moderate'
  return 'strong'
}

function densityFromScore(score: number | null): BlueprintDensityLevel {
  if (score === null) return 'medium'
  if (score < 0.34) return 'low'
  if (score < 0.67) return 'high'
  return 'medium'
}

function difficultyBand(score: number): BlueprintDifficulty {
  if (score < 0.34) return 'beginner'
  if (score < 0.67) return 'intermediate'
  return 'advanced'
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase()
}

function findRealDefinition(chunks: readonly LearningChunk[], conceptLabel: string): string | null {
  const normalized = normalizeLabel(conceptLabel)
  for (const chunk of chunks) {
    const match = (chunk.enrichment.definitions ?? []).find((definition) => normalizeLabel(definition.term) === normalized)
    if (match) return match.definition
  }
  return null
}

function readingStrategyPhrase(strategy: ReadingStrategy): string {
  switch (strategy) {
    case 'active-recall-read':
      return 'active recall as you go — pause after each section and try to recall it before moving on'
    case 'multi-pass-with-notes':
      return 'multiple passes with notes, since this material is dense enough to benefit from a second look'
    case 'single-pass-read':
    default:
      return 'a single, steady read-through'
  }
}

function conceptNodes(ulo: UniversalLearningObject): readonly ConceptGraphNode[] {
  return [...ulo.knowledge.graph.nodes]
    .filter((node): node is ConceptGraphNode => node.type === 'concept')
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
}

export function generateRealLearningBlueprint(document: Document, ulo: UniversalLearningObject): LearningBlueprint {
  const chunks = [...ulo.knowledge.chunks].sort((a, b) => a.location.order - b.location.order)
  const analysis = ulo.analysis
  const graph = ulo.knowledge.graph
  const allConceptNodes = conceptNodes(ulo)
  const topConceptNodes = allConceptNodes.slice(0, MAX_CONCEPTS)
  const topicNodes = allConceptNodes.slice(MAX_CONCEPTS, MAX_CONCEPTS + MAX_TOPICS)

  const concepts: BlueprintConcept[] = topConceptNodes.map((node, index) => ({
    id: `concept-${index}`,
    title: node.label,
    description: findRealDefinition(chunks, node.label) ?? `Mentioned in ${node.occurrenceCount} section${node.occurrenceCount === 1 ? '' : 's'} of this document.`,
  }))

  const topics = topicNodes.map((node) => node.label)

  const chapters: BlueprintChapter[] = chunks.map((chunk, index) => ({ id: `chapter-${index}`, title: resolveChunkHeading(chunk) }))

  const difficultyValues = chunks.map((chunk) => chunk.enrichment.difficulty).filter((value): value is ChunkDifficulty => value !== undefined)
  const learningDifficultyMean = mean(analysis.chunkAnalyses.map((chunkAnalysis) => chunkAnalysis.learningDifficulty))
  const difficulty: BlueprintDifficulty = mostCommon(difficultyValues) ?? difficultyBand(learningDifficultyMean ?? 0.5)

  const totalLearningSeconds = analysis.chunkAnalyses.reduce((sum, chunkAnalysis) => sum + chunkAnalysis.estimatedLearningTimeSeconds, 0)
  const estimatedMinutes = Math.max(1, Math.round(totalLearningSeconds / 60))

  const knowledgeMap = buildKnowledgeMap(chunks, graph, topConceptNodes)

  const strongAreaNodes = topConceptNodes.filter((node) => analysis.conceptAnalyses.find((ca) => ca.conceptNodeId === node.id)?.conceptRole === 'core')
  const strongAreas = strongAreaNodes.map((node) => node.label)
  const weakAreas = [...allConceptNodes]
    .filter((node) => !strongAreaNodes.includes(node))
    .map((node) => ({ node, revisionPriority: analysis.conceptAnalyses.find((ca) => ca.conceptNodeId === node.id)?.revisionPriority ?? 0 }))
    .sort((a, b) => b.revisionPriority - a.revisionPriority)
    .slice(0, 2)
    .map(({ node }) => node.label)

  const conceptLabelById = new Map(graph.nodes.filter((node): node is ConceptGraphNode => node.type === 'concept').map((node) => [node.id, node.label]))
  const orderedLabels = analysis.recommendedLearningOrder.map((id) => conceptLabelById.get(id)).filter((label): label is string => label !== undefined)
  const suggestedStudyOrder =
    orderedLabels.length > 0
      ? `Start with ${orderedLabels.slice(0, 3).join(', then ')}.`
      : 'Work through this document in order — not enough real structure exists yet to suggest a different path.'

  const aiRefinedStrategies = analysis.conceptAnalyses.map((ca) => ca.aiRefinedStrategy).filter((strategy) => strategy !== undefined)
  const aiConfidenceMean = mean(aiRefinedStrategies.map((strategy) => strategy.confidence))
  const semanticConfidenceMean = mean(chunks.map((chunk) => chunk.confidence.semantic).filter((value): value is number => value !== null))
  const confidenceLevel = bandFromScore(aiConfidenceMean ?? semanticConfidenceMean, 'higher-is-stronger')

  const memoryDifficultyMean = mean(analysis.chunkAnalyses.map((chunkAnalysis) => chunkAnalysis.memoryDifficulty))
  const memoryPrediction = bandFromScore(memoryDifficultyMean, 'higher-is-harder')

  const readingStrategyMode = mostCommon(analysis.chunkAnalyses.map((chunkAnalysis) => chunkAnalysis.suggestedReadingStrategy))
  const recommendation = aiRefinedStrategies[0]?.readingStrategyNotes ?? `This document is best approached with ${readingStrategyPhrase(readingStrategyMode ?? 'single-pass-read')}.`

  const insights: BlueprintInsights = {
    strongAreas,
    weakAreas,
    suggestedStudyOrder,
    estimatedCompletionSummary: `~${estimatedMinutes} minutes to work through this document.`,
    memoryPrediction,
    confidenceLevel,
    recommendation,
  }

  const knowledgeDensityMean = mean(analysis.chunkAnalyses.map((chunkAnalysis) => chunkAnalysis.knowledgeDensity))
  const diagramCount = chunks.reduce((sum, chunk) => sum + chunk.media.length, 0)

  return {
    documentId: document.id,
    summary: pickRealSummary(chunks, document.title),
    difficulty,
    estimatedMinutes,
    concepts,
    chapters,
    topics,
    journey: JOURNEY_STEPS,
    overview: {
      conceptCount: concepts.length,
      topicCount: topics.length,
      // Honestly 0, not a fabricated number — no real, cheap source
      // exists for these three today, and (confirmed by reading every
      // consuming component) nothing currently renders this field.
      studySessionCount: 0,
      quizCount: 0,
      flashcardCount: generateFlashCards(ulo).cards.length,
      mindMapCount: generateMindMapOutline(ulo).concepts.length,
      practiceQuestionCount: 0,
    },
    knowledgeMap,
    insights,
    memoryDensity: densityFromScore(knowledgeDensityMean),
    diagramCount,
  }
}

function pickRealSummary(chunks: readonly LearningChunk[], documentTitle: string): string {
  const bestChunk = [...chunks]
    .filter((chunk) => chunk.enrichment.semantic !== undefined)
    .sort((a, b) => (b.enrichment.importance ?? 0) - (a.enrichment.importance ?? 0))[0]

  return bestChunk?.enrichment.semantic ?? `"${documentTitle}" hasn't been fully analyzed by AI yet — real content understanding will appear here once processing catches up.`
}

// A real, honest, possibly-partial chain — never padded with a
// fabricated 'application' level. KnowledgeMapPreview renders any-length
// array gracefully, so stopping early when no further real data exists
// is correct, not a regression.
function buildKnowledgeMap(chunks: readonly LearningChunk[], graph: UniversalLearningObject['knowledge']['graph'], topConceptNodes: readonly ConceptGraphNode[]): KnowledgeMapNode[] {
  const topic = topConceptNodes[0]
  if (!topic) return []

  const nodes: KnowledgeMapNode[] = [{ id: 'map-topic', level: 'topic', label: topic.label }]

  const conceptNodeById = new Map(graph.nodes.filter((node): node is ConceptGraphNode => node.type === 'concept').map((node) => [node.id, node]))
  const otherEndpoint = (edge: (typeof graph.edges)[number]): string => (edge.sourceNodeId === topic.id ? edge.targetNodeId : edge.sourceNodeId)
  const subtopic = graph.edges
    .filter((edge) => edge.sourceNodeId === topic.id || edge.targetNodeId === topic.id)
    .map((edge) => conceptNodeById.get(otherEndpoint(edge)))
    .find((node): node is ConceptGraphNode => node !== undefined)
  if (subtopic) nodes.push({ id: 'map-subtopic', level: 'subtopic', label: subtopic.label })

  const definition = findRealDefinition(chunks, topic.label) ?? (subtopic ? findRealDefinition(chunks, subtopic.label) : null)
  if (definition) nodes.push({ id: 'map-definition', level: 'definition', label: definition })

  const example = chunks.map((chunk) => chunk.enrichment.examples?.[0]).find((value): value is string => value !== undefined)
  if (example) nodes.push({ id: 'map-example', level: 'example', label: example })

  return nodes
}
