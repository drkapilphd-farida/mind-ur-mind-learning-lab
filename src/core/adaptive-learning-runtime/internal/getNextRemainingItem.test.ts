import { describe, expect, it } from 'vitest'
import { makeQueue } from '../testFixtures'
import { getNextRemainingItem } from './getNextRemainingItem'

describe('getNextRemainingItem', () => {
  it('returns the first item that is neither completed nor skipped', async () => {
    const queue = await makeQueue()
    expect(getNextRemainingItem(queue, [], [])?.chunkNodeId).toBe('chunk-1')
    expect(getNextRemainingItem(queue, ['chunk-1'], [])?.chunkNodeId).toBe('chunk-2')
    expect(getNextRemainingItem(queue, ['chunk-1'], ['chunk-2'])?.chunkNodeId).toBe('chunk-3')
  })

  it('returns undefined once every item is completed or skipped', async () => {
    const queue = await makeQueue()
    const allIds = queue.items.map((item) => item.chunkNodeId)
    expect(getNextRemainingItem(queue, allIds, [])).toBeUndefined()
  })
})
