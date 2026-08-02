import { describe, expect, it } from 'vitest'
import { makeQueue, makeULO } from '../../testFixtures'
import { applyDependencyFirstStrategy } from './dependencyFirstStrategy'

describe('applyDependencyFirstStrategy', () => {
  it('orders resolvable chunks by the real UCE-5 topological recommendedOrder of the concept they introduce', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyDependencyFirstStrategy(queue, ulo)

    const orderByConceptId = new Map(ulo.analysis.conceptAnalyses.map((concept) => [concept.conceptNodeId, concept.recommendedOrder]))
    const rank = (chunkNodeId: string): number => {
      const item = queue.items.find((queueItem) => queueItem.chunkNodeId === chunkNodeId)
      const conceptOrder = item?.checkpointConceptNodeId ? orderByConceptId.get(item.checkpointConceptNodeId) : undefined
      return conceptOrder ?? Number.POSITIVE_INFINITY
    }

    const ranks = result.items.map((item) => rank(item.chunkNodeId))
    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1]!)
    }
  })

  it('returns the same set of items as the input queue, never dropping or duplicating', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyDependencyFirstStrategy(queue, ulo)

    expect(result.items).toHaveLength(queue.items.length)
    expect(new Set(result.items.map((item) => item.chunkNodeId))).toEqual(new Set(queue.items.map((item) => item.chunkNodeId)))
  })

  it('places a chunk with no resolvable concept order after every resolvable chunk', async () => {
    const ulo = await makeULO()
    const queue = await makeQueue(ulo)
    const result = applyDependencyFirstStrategy(queue, ulo)

    const orderByConceptId = new Map(ulo.analysis.conceptAnalyses.map((concept) => [concept.conceptNodeId, concept.recommendedOrder]))
    const unresolvedIds = queue.items.filter((item) => !item.checkpointConceptNodeId || orderByConceptId.get(item.checkpointConceptNodeId) == null).map((item) => item.chunkNodeId)
    const resolvedIds = queue.items.filter((item) => item.checkpointConceptNodeId && orderByConceptId.get(item.checkpointConceptNodeId) != null).map((item) => item.chunkNodeId)

    const resultIds = result.items.map((item) => item.chunkNodeId)
    const lastResolvedIndex = Math.max(-1, ...resolvedIds.map((id) => resultIds.indexOf(id)))
    const firstUnresolvedIndex = unresolvedIds.length > 0 ? Math.min(...unresolvedIds.map((id) => resultIds.indexOf(id))) : Number.POSITIVE_INFINITY

    expect(firstUnresolvedIndex).toBeGreaterThan(lastResolvedIndex)
  })
})
