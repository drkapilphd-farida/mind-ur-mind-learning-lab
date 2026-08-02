import { describe, expect, it } from 'vitest'
import { makeQueue } from '../testFixtures'
import { findQueueIndex, getNextQueueItem, getPreviousQueueItem, getQueueItemAt } from './navigateQueue'

describe('navigateQueue', () => {
  it('findQueueIndex finds a real chunk and returns -1 for an unknown one', async () => {
    const queue = await makeQueue()
    expect(findQueueIndex(queue, 'chunk-2')).toBe(1)
    expect(findQueueIndex(queue, 'chunk-unknown')).toBe(-1)
  })

  it('getQueueItemAt/getNextQueueItem/getPreviousQueueItem navigate real bounds', async () => {
    const queue = await makeQueue()
    expect(getQueueItemAt(queue, 0)?.chunkNodeId).toBe('chunk-1')
    expect(getNextQueueItem(queue, 0)?.chunkNodeId).toBe('chunk-2')
    expect(getPreviousQueueItem(queue, 0)).toBeUndefined()
    expect(getPreviousQueueItem(queue, 1)?.chunkNodeId).toBe('chunk-1')
    expect(getNextQueueItem(queue, queue.items.length - 1)).toBeUndefined()
  })
})
