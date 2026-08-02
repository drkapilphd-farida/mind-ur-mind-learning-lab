import { describe, expect, it } from 'vitest'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { makeChunk, makeDocument, FIXED_NOW } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { aggregateLearningObjects } from './aggregateLearningObjects'

async function makeAlgebraScenario(): Promise<{ chunks: readonly LearningChunk[]; document: UniversalLearningDocument; graph: LearningKnowledgeGraph; analysis: LearningAnalysis }> {
  const chunks = [
    makeChunk('chunk-1', 0, 'Algebra introduces variables and equations.', {
      concepts: ['algebra'],
      definitions: [{ term: 'algebra', definition: 'A branch of mathematics using symbols.' }],
      examples: ['solving for x in 2x = 4'],
      misconceptions: ['algebra is only about letters, not numbers'],
      difficulty: 'beginner',
    }),
    makeChunk('chunk-2', 1, 'Calculus builds on algebra with derivatives.', {
      concepts: ['algebra', 'calculus'],
      examples: ['using algebra to simplify a derivative'],
      prerequisites: ['algebra'],
      difficulty: 'advanced',
    }),
  ]
  const document = makeDocument()
  const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })
  const analysis = await buildLearningAnalysis(chunks, document, graph, { now: FIXED_NOW })
  return { chunks, document, graph, analysis }
}

describe('aggregateLearningObjects', () => {
  it('rolls up real definitions/examples/misconceptions for a concept across every chunk that mentions it', async () => {
    const { chunks, graph, analysis } = await makeAlgebraScenario()

    // "algebra" is introduced in chunk-1 but also appears in chunk-2 —
    // building the Blueprint for chunk-2 must still see chunk-1's real
    // definition/misconception, not just chunk-2's own local data.
    const objects = aggregateLearningObjects(chunks[1]!, chunks, graph, analysis)
    const algebra = objects.find((object) => object.title === 'algebra')

    expect(algebra).toBeDefined()
    expect(algebra?.definition).toBe('A branch of mathematics using symbols.')
    expect(algebra?.examples).toEqual(expect.arrayContaining(['solving for x in 2x = 4', 'using algebra to simplify a derivative']))
    expect(algebra?.misconceptions).toEqual(['algebra is only about letters, not numbers'])
    expect(algebra?.explanation).toBeNull()
  })

  it('never fabricates a difficulty/definition when no real chunk provided one', async () => {
    const { chunks, graph, analysis } = await makeAlgebraScenario()
    const objects = aggregateLearningObjects(chunks[1]!, chunks, graph, analysis)
    const calculus = objects.find((object) => object.title === 'calculus')

    expect(calculus?.definition).toBeNull()
    expect(calculus?.difficulty).toBe('advanced')
  })

  it('only returns concepts real for this specific chapter, not every concept in the document', async () => {
    const { chunks, graph, analysis } = await makeAlgebraScenario()
    const objectsForChunk1 = aggregateLearningObjects(chunks[0]!, chunks, graph, analysis)
    expect(objectsForChunk1.map((object) => object.title)).toEqual(['algebra'])
  })
})
