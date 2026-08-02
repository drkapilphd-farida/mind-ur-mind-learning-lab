import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeQueue } from '../testFixtures'
import { buildAdvanceEvents } from './buildAdvanceEvents'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('buildAdvanceEvents', () => {
  it('emits a real chunk-started event for a real queue position', async () => {
    const queue = await makeQueue()
    const events = buildAdvanceEvents(queue, 0, FIXED_NOW, idFactory)

    expect(events[0]).toMatchObject({ type: 'chunk-started', chunkNodeId: queue.items[0]!.chunkNodeId })
  })

  it('additionally emits checkpoint-reached only when the real queue item says so', async () => {
    const queue = await makeQueue()
    const checkpointIndex = queue.items.findIndex((item) => item.isCheckpoint)

    if (checkpointIndex === -1) {
      const events = buildAdvanceEvents(queue, 0, FIXED_NOW, idFactory)
      expect(events.map((event) => event.type)).toEqual(['chunk-started'])
      return
    }

    const events = buildAdvanceEvents(queue, checkpointIndex, FIXED_NOW, idFactory)
    expect(events.map((event) => event.type)).toEqual(['chunk-started', 'checkpoint-reached'])
  })

  it('returns an empty array for an out-of-bounds index', async () => {
    const queue = await makeQueue()
    expect(buildAdvanceEvents(queue, queue.items.length + 5, FIXED_NOW, idFactory)).toEqual([])
  })
})
