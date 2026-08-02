import { describe, expect, it } from 'vitest'
import { makeScenario } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { aggregateChapterIntelligence } from './aggregateChapterIntelligence'

describe('aggregateChapterIntelligence', () => {
  it('re-exposes real, already-computed UCE-3B/UCE-5 fields for this chunk, with zero new AI', async () => {
    const { chunks, graph, analysis } = await makeScenario()
    const chunk = chunks[0]!

    const result = aggregateChapterIntelligence(chunk, graph, analysis)

    expect(result.coreConcepts).toEqual(['algebra'])
    expect(result.readingDifficulty).not.toBeNull()
    expect(typeof result.readingDifficulty).toBe('number')
  })

  it('never fabricates a summary/order for a chunk with no real data', async () => {
    const { chunks, graph, analysis } = await makeScenario()
    // chunk-2 has no chunkAnalysis mismatch, but check the honest-absence
    // path directly: an unrelated chunk id has no ChunkAnalysis at all.
    const missingChunk = { ...chunks[0]!, id: 'chunk-does-not-exist' }

    const result = aggregateChapterIntelligence(missingChunk, graph, analysis)
    expect(result.readingDifficulty).toBeNull()
    expect(result.recommendedLearningOrder).toEqual([])
  })
})
