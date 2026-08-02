import { describe, expect, it, vi } from 'vitest'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { makeChunk, makeDocument, FIXED_NOW } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { buildChapterIntelligenceBlueprint } from './buildChapterIntelligenceBlueprint'

async function makeScenario(): Promise<{ chunks: readonly LearningChunk[]; document: UniversalLearningDocument; graph: LearningKnowledgeGraph; analysis: LearningAnalysis }> {
  const chunks = [
    makeChunk(
      'chunk-1',
      0,
      'Algebra introduces variables and equations.',
      { concepts: ['algebra'], definitions: [{ term: 'algebra', definition: 'A branch of mathematics using symbols.' }], difficulty: 'beginner' },
      { metadata: { title: 'Chapter 1', documentTitle: 'Physics 101', contentType: 'text' } },
    ),
  ]
  const document = makeDocument()
  const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })
  const analysis = await buildLearningAnalysis(chunks, document, graph, { now: FIXED_NOW })
  return { chunks, document, graph, analysis }
}

describe('buildChapterIntelligenceBlueprint', () => {
  it('builds a complete Blueprint from real aggregated data alone when no aiFoundation is supplied', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()

    const blueprint = await buildChapterIntelligenceBlueprint(chunks[0]!, chunks, document, graph, analysis, { now: FIXED_NOW, idFactory: () => 'blueprint-1' })

    expect(blueprint.header).toEqual({
      blueprintId: 'blueprint-1',
      documentId: 'doc-1',
      chapterId: 'chunk-1',
      title: 'Chapter 1',
      language: null,
      chapterNumber: 1,
      subject: 'Physics 101',
      estimatedReadingTime: 10,
      estimatedLearningTime: expect.any(Number),
      difficulty: 'beginner',
      version: 1,
    })
    expect(blueprint.learningObjects.objects).toHaveLength(1)
    expect(blueprint.learningObjects.objects[0]?.title).toBe('algebra')
    expect(blueprint.learningObjects.objects[0]?.definition).toBe('A branch of mathematics using symbols.')
    // Never fabricated — no AI call was made.
    expect(blueprint.learningObjects.objects[0]?.explanation).toBeNull()
    expect(blueprint.memoryAssets).toEqual({ memoryHooks: [], associations: [], simpleMemoryNotes: [] })
    expect(blueprint.aiMentorContext).toEqual({ beginnerExplanation: null, simpleExplanation: null, realLifeExample: null, commonDoubts: [] })
  })

  it('fills in the genuinely-new AI-generated fields when aiFoundation succeeds, via exactly one call', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()

    const responseJson = JSON.stringify({
      conceptExplanations: [{ concept: 'algebra', explanation: 'Algebra uses symbols to represent unknown numbers.' }],
      memoryHooks: ['Picture "x" as a locked box.'],
      associations: [],
      simpleMemoryNotes: [],
      recallQuestions: [{ question: 'What is algebra?', expectedAnswerHint: 'Math using symbols.' }],
      applicationQuestions: [],
      aiMentorContext: { beginnerExplanation: 'Algebra helps solve for unknowns.', simpleExplanation: null, realLifeExample: null, commonDoubts: [] },
    })
    const execute = vi.fn().mockResolvedValue({ success: true, task: 'chapter-blueprint-generation', requestId: 'chunk-1', response: { content: responseJson }, usage: {}, cacheHit: false, processingTimeMs: 10 })

    const blueprint = await buildChapterIntelligenceBlueprint(chunks[0]!, chunks, document, graph, analysis, { now: FIXED_NOW, idFactory: () => 'blueprint-1', aiFoundation: { execute } })

    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledWith('chapter-blueprint-generation', expect.anything(), 'chunk-1')
    expect(blueprint.learningObjects.objects[0]?.explanation).toBe('Algebra uses symbols to represent unknown numbers.')
    expect(blueprint.memoryAssets.memoryHooks).toEqual(['Picture "x" as a locked box.'])
    expect(blueprint.assessmentAssets.recallQuestions).toEqual([{ question: 'What is algebra?', expectedAnswerHint: 'Math using symbols.' }])
    expect(blueprint.aiMentorContext.beginnerExplanation).toBe('Algebra helps solve for unknowns.')
  })

  it('degrades honestly (never throws) when the one AI call fails', async () => {
    const { chunks, document, graph, analysis } = await makeScenario()
    const execute = vi.fn().mockResolvedValue({ success: false, task: 'chapter-blueprint-generation', requestId: 'chunk-1', error: { code: 'timeout', message: 'boom', providerId: 'ai-foundation', retryable: true }, processingTimeMs: 10 })

    const blueprint = await buildChapterIntelligenceBlueprint(chunks[0]!, chunks, document, graph, analysis, { now: FIXED_NOW, aiFoundation: { execute } })

    expect(blueprint.learningObjects.objects[0]?.explanation).toBeNull()
    expect(blueprint.memoryAssets).toEqual({ memoryHooks: [], associations: [], simpleMemoryNotes: [] })
  })
})
