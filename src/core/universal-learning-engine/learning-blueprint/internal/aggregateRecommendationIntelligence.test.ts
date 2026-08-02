import { describe, expect, it } from 'vitest'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { makeChunk, makeDocument, FIXED_NOW } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { aggregateRecommendationIntelligence } from './aggregateRecommendationIntelligence'

describe('aggregateRecommendationIntelligence', () => {
  it('reshapes real, already-computed UCE-5 fields — zero new difficulty/order computation', async () => {
    const chunks = [
      makeChunk('chunk-1', 0, 'Algebra introduces variables.', { concepts: ['algebra'], difficulty: 'beginner' }),
      makeChunk('chunk-2', 1, 'Calculus is genuinely advanced.', { concepts: ['calculus'], prerequisites: ['algebra'], difficulty: 'advanced' }),
    ]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: FIXED_NOW })

    const result = aggregateRecommendationIntelligence(chunks[1]!, chunks, graph, analysis)

    expect(result.difficultConcepts).toEqual(['calculus'])
    expect(result.suggestedReadingOrder).toEqual(['calculus'])
    expect(result.revisionPriority).toEqual(['calculus'])
  })

  it('never marks a concept difficult without a real advanced-difficulty chunk backing it', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'Algebra introduces variables.', { concepts: ['algebra'], difficulty: 'beginner' })]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })
    const analysis = await buildLearningAnalysis(chunks, document, graph, { now: FIXED_NOW })

    const result = aggregateRecommendationIntelligence(chunks[0]!, chunks, graph, analysis)
    expect(result.difficultConcepts).toEqual([])
  })
})
