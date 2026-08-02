import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeULO } from '../testFixtures'
import { startRuntime } from './startRuntime'
import { checkpointRuntime } from './checkpointRuntime'

let counter = 0
const idFactory = (): string => `id-${(counter += 1)}`

describe('checkpointRuntime', () => {
  it('is a real, honest no-op when the current chunk is not a checkpoint', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    if (started.state.scheduledQueue.items[started.state.position.queueIndex]?.isCheckpoint) return

    const result = checkpointRuntime(started.state, { now: FIXED_NOW, idFactory })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.events).toEqual([])
    expect(result.state).toBe(started.state)
  })

  it('emits checkpoint-reached when the current chunk is a real checkpoint', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory })
    if (!started.success) throw new Error('fixture failed')

    const checkpointIndex = started.state.scheduledQueue.items.findIndex((item) => item.isCheckpoint)
    if (checkpointIndex === -1) return

    const atCheckpoint = { ...started.state, position: { queueIndex: checkpointIndex, chunkNodeId: started.state.scheduledQueue.items[checkpointIndex]!.chunkNodeId } }
    const result = checkpointRuntime(atCheckpoint, { now: FIXED_NOW, idFactory })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.events).toHaveLength(1)
    expect(result.events[0]?.type).toBe('checkpoint-reached')
  })
})
