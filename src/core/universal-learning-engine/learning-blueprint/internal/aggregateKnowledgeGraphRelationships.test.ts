import { describe, expect, it } from 'vitest'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { makeChunk, makeDocument, FIXED_NOW } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { aggregateKnowledgeGraphRelationships } from './aggregateKnowledgeGraphRelationships'

describe('aggregateKnowledgeGraphRelationships', () => {
  it('reshapes real, already-computed graph edges scoped to this chapter’s own concepts — zero new computation', async () => {
    // Real concept-to-concept edges (`related-to`) only ever form from
    // real same-chunk co-occurrence — chunk-to-concept edges
    // (prerequisite/depends-on/part-of/defines) are a different real
    // relationship shape UCE-4 already keeps separate (see
    // buildStructuralEdges.ts) and are correctly excluded here, since a
    // BlueprintKnowledgeRelationship connects two Learning Objects
    // (concepts), never a chunk to a concept.
    const chunks = [makeChunk('chunk-1', 0, 'Algebra and calculus are related fields.', { concepts: ['algebra', 'calculus'] })]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })

    const result = aggregateKnowledgeGraphRelationships('chunk-1', graph)

    expect(result.relationships.length).toBeGreaterThan(0)
    expect(result.relationships.every((r) => typeof r.type === 'string' && typeof r.sourceObjectId === 'string' && typeof r.targetObjectId === 'string')).toBe(true)
  })

  it('is honestly empty for a chapter that introduces no real concepts', async () => {
    const chunks = [makeChunk('chunk-1', 0, 'No concepts here.')]
    const document = makeDocument()
    const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })

    expect(aggregateKnowledgeGraphRelationships('chunk-1', graph).relationships).toEqual([])
  })
})
