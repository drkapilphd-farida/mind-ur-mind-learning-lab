import { describe, expect, it, vi } from 'vitest'
import { makeChunk, makeDocument } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { Document } from '@/types/documents'
import { generateRealLearningBlueprint } from './generateRealLearningBlueprint'

const NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

function makeTestDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    userId: 'user-1',
    learningProjectId: 'project-1',
    title: 'Photosynthesis Basics',
    storagePath: null,
    mimeType: 'application/pdf',
    sizeBytes: 500_000,
    status: 'ready',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeEnrichedChunks(): [ReturnType<typeof makeChunk>, ReturnType<typeof makeChunk>] {
  const chunkA = makeChunk('chunk-a', 0, 'Photosynthesis is the process plants use to convert light into chemical energy.', {
    semantic: 'This section explains how plants convert light into chemical energy through photosynthesis.',
    concepts: ['photosynthesis', 'chlorophyll'],
    keywords: ['light energy', 'chemical energy'],
    definitions: [{ term: 'Photosynthesis', definition: 'The process plants use to convert light into chemical energy.' }],
    examples: ['A sunflower turning toward the sun to maximize light absorption.'],
    difficulty: 'beginner',
    importance: 0.9,
  })
  const chunkB = makeChunk('chunk-b', 1, 'Chlorophyll is the pigment inside chloroplasts that captures sunlight for photosynthesis.', {
    semantic: 'This section describes chlorophyll, the pigment that captures sunlight.',
    concepts: ['chlorophyll'],
    definitions: [{ term: 'Chlorophyll', definition: 'The pigment inside chloroplasts that captures sunlight.' }],
    difficulty: 'beginner',
    importance: 0.6,
  })
  return [chunkA, chunkB]
}

describe('generateRealLearningBlueprint', () => {
  it('builds real summary/difficulty/concepts/chapters/topics from real ULO enrichment, never a mock template', async () => {
    const document = makeTestDocument()
    const chunks = makeEnrichedChunks()
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis(chunks, makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), chunks, graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.summary).toBe('This section explains how plants convert light into chemical energy through photosynthesis.')
    expect(blueprint.difficulty).toBe('beginner')
    expect(blueprint.concepts.map((c) => c.title)).toContain('photosynthesis')
    expect(blueprint.concepts.find((c) => c.title === 'photosynthesis')?.description).toBe('The process plants use to convert light into chemical energy.')
    expect(blueprint.chapters).toHaveLength(2)
    expect(blueprint.chapters[0]?.title).toBe('Heading 0')
  })

  it('never fabricates a description when no real definition matches — uses an honest occurrence-based fallback', async () => {
    const document = makeTestDocument()
    const chunk = makeChunk('chunk-a', 0, 'Osmosis moves water across a membrane.', { concepts: ['osmosis'], importance: 0.5 })
    const graph = await buildLearningKnowledgeGraph([chunk], makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis([chunk], makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), [chunk], graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    const osmosis = blueprint.concepts.find((c) => c.title === 'osmosis')
    expect(osmosis?.description).toBe('Mentioned in 1 section of this document.')
  })

  it('degrades honestly when no chunk has any real enrichment yet — no fabricated content, real deterministic fallbacks only', async () => {
    const document = makeTestDocument()
    const chunk = makeChunk('chunk-a', 0, 'Real content with no AI enrichment yet.')
    const graph = await buildLearningKnowledgeGraph([chunk], makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis([chunk], makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), [chunk], graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.summary).toContain('Photosynthesis Basics')
    expect(blueprint.summary).toContain("hasn't been fully analyzed")
    expect(blueprint.concepts).toEqual([])
    expect(blueprint.topics).toEqual([])
    expect(blueprint.knowledgeMap).toEqual([])
    expect(blueprint.insights.strongAreas).toEqual([])
    expect(['beginner', 'intermediate', 'advanced']).toContain(blueprint.difficulty)
  })

  it('builds a real, honest knowledge map chain — a real concept, a real related concept, a real definition, a real example', async () => {
    const document = makeTestDocument()
    const chunks = makeEnrichedChunks()
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis(chunks, makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), chunks, graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.knowledgeMap[0]?.level).toBe('topic')
    expect(blueprint.knowledgeMap.map((node) => node.level)).not.toContain('application')
    expect(blueprint.knowledgeMap.every((node) => node.label.length > 0)).toBe(true)
  })

  it('never includes the same fabricated 4-item random-recommendation pool — falls back to a real deterministic strategy sentence without an aiFoundation', async () => {
    const document = makeTestDocument()
    const chunks = makeEnrichedChunks()
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis(chunks, makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), chunks, graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.insights.recommendation).toContain('This document is best approached with')
  })

  it('uses the real AI-refined strategy notes as the recommendation when aiFoundation produced one', async () => {
    const document = makeTestDocument()
    const chunks = makeEnrichedChunks()
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: NOW })

    const execute = vi.fn(
      async (): Promise<AIFoundationResult> => ({
        success: true,
        task: 'difficulty-analysis',
        requestId: 'req-1',
        response: {
          id: 'r',
          providerId: 'claude',
          modelId: 'claude-sonnet-5',
          content: JSON.stringify({ readingStrategyNotes: 'Focus on the real chlorophyll-photosynthesis connection first.', revisionStrategyNotes: 'Review often.', practiceStrategyNotes: 'Practice daily.', confidence: 0.85 }),
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          finishReason: 'stop',
        },
        usage: { providerId: 'claude', modelId: 'claude-sonnet-5', tokens: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
        cacheHit: false,
        processingTimeMs: 5,
      }),
    )
    const aiFoundation: Pick<AIFoundation, 'execute'> = { execute }
    const analysis = await buildLearningAnalysis(chunks, makeDocument(), graph, { now: NOW, aiFoundation })
    const ulo = buildUniversalLearningObject(makeDocument(), chunks, graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    const hasCoreConcept = analysis.conceptAnalyses.some((c) => c.aiRefinedStrategy !== undefined)
    expect(hasCoreConcept).toBe(true)
    expect(blueprint.insights.recommendation).toBe('Focus on the real chlorophyll-photosynthesis connection first.')
  })

  it('keeps overview concept/topic counts in sync with the real arrays, and real flashcard/mind-map counts', async () => {
    const document = makeTestDocument()
    const chunks = makeEnrichedChunks()
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis(chunks, makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), chunks, graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.overview.conceptCount).toBe(blueprint.concepts.length)
    expect(blueprint.overview.topicCount).toBe(blueprint.topics.length)
    expect(blueprint.overview.flashcardCount).toBeGreaterThan(0)
  })

  it('never returns a negative or zero estimatedMinutes even for a single short chunk', async () => {
    const document = makeTestDocument()
    const chunk = makeChunk('chunk-a', 0, 'Short content.')
    const graph = await buildLearningKnowledgeGraph([chunk], makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis([chunk], makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), [chunk], graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.estimatedMinutes).toBeGreaterThanOrEqual(1)
    expect(blueprint.insights.estimatedCompletionSummary).toContain(`~${blueprint.estimatedMinutes} minutes`)
  })

  it('keeps the fixed, unchanged seven-step Learning Journey™ — real app navigation, not a content claim', async () => {
    const document = makeTestDocument()
    const chunks = makeEnrichedChunks()
    const graph = await buildLearningKnowledgeGraph(chunks, makeDocument(), { now: NOW })
    const analysis = await buildLearningAnalysis(chunks, makeDocument(), graph, { now: NOW })
    const ulo = buildUniversalLearningObject(makeDocument(), chunks, graph, analysis, { now: NOW })

    const blueprint = generateRealLearningBlueprint(document, ulo)

    expect(blueprint.journey.map((step) => step.id)).toEqual(['overview', 'key-concepts', 'flashcards', 'mind-maps', 'practice', 'quiz', 'revision'])
  })
})
