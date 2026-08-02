import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from './testFixtures'
import { evaluateLearningState } from './evaluateLearningState'

describe('evaluateLearningState', () => {
  it('reports real chunkAnalysis/attentionBlueprint values for an untouched chunk', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const evaluation = evaluateLearningState('chunk-1', ulo, queue, [], {})

    const chunkAnalysis = ulo.analysis.chunkAnalyses.find((analysis) => analysis.chunkNodeId === 'chunk-1')!
    const attentionEntry = ulo.experience.attentionBlueprint.entries.find((entry) => entry.chunkNodeId === 'chunk-1')!

    expect(evaluation.learningDifficulty).toBe(chunkAnalysis.learningDifficulty)
    expect(evaluation.suggestedReadingStrategy).toBe(chunkAnalysis.suggestedReadingStrategy)
    expect(evaluation.focusLevel).toBe(attentionEntry.focusLevel)
    expect(evaluation.isRepeatedChunk).toBe(false)
    expect(evaluation.repeatCount).toBe(0)
    expect(evaluation.isMarkedForRevisit).toBe(false)
  })

  it('reports real runtime-tracked repeat and revisit state', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const evaluation = evaluateLearningState('chunk-2', ulo, queue, ['chunk-2'], { 'chunk-2': 3 })

    expect(evaluation.isRepeatedChunk).toBe(true)
    expect(evaluation.repeatCount).toBe(3)
    expect(evaluation.isMarkedForRevisit).toBe(true)
  })
})
