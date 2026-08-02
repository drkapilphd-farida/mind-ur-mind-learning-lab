import { describe, expect, it } from 'vitest'
import { makeEmptyULO, makeULO } from '../testFixtures'
import { buildLearningQueue } from './buildLearningQueue'

describe('buildLearningQueue', () => {
  it('includes one item per real chunk, ordered by real location.order', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)

    expect(queue.items).toHaveLength(ulo.knowledge.chunks.length)
    for (let i = 1; i < queue.items.length; i += 1) {
      expect(queue.items[i - 1]!.order).toBeLessThanOrEqual(queue.items[i]!.order)
    }
  })

  it('marks the real introducing chunk of a milestone concept as a checkpoint', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)

    for (const step of ulo.experience.learningJourney.steps) {
      const introducesEdge = ulo.knowledge.graph.edges.find((edge) => edge.type === 'introduces' && edge.targetNodeId === step.conceptNodeId)
      if (!introducesEdge) continue
      const item = queue.items.find((queueItem) => queueItem.chunkNodeId === introducesEdge.sourceNodeId)
      expect(item?.isCheckpoint).toBe(true)
      expect(item?.checkpointConceptNodeId).toBe(step.conceptNodeId)
      expect(item?.checkpointLabel).toBe(step.label)
    }
  })

  it('marks non-milestone chunks as non-checkpoints, without fabricating checkpoint fields', async () => {
    const ulo = await makeULO()
    const queue = buildLearningQueue(ulo)

    const checkpointChunkIds = new Set(ulo.experience.learningJourney.steps.map((step) => ulo.knowledge.graph.edges.find((edge) => edge.type === 'introduces' && edge.targetNodeId === step.conceptNodeId)?.sourceNodeId))
    const nonCheckpointItems = queue.items.filter((item) => !checkpointChunkIds.has(item.chunkNodeId))

    for (const item of nonCheckpointItems) {
      expect(item.isCheckpoint).toBe(false)
      expect(item.checkpointConceptNodeId).toBeUndefined()
      expect(item.checkpointLabel).toBeUndefined()
    }
  })

  it('returns an empty queue for a ULO with no chunks', async () => {
    const ulo = await makeEmptyULO()
    const queue = buildLearningQueue(ulo)
    expect(queue.items).toEqual([])
  })

  it('is deterministic for the same ULO', async () => {
    const ulo = await makeULO()
    expect(buildLearningQueue(ulo)).toEqual(buildLearningQueue(ulo))
  })
})
